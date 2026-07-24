// 1-Hour Stability Test — 120 iterations at 30s intervals
const BASE = "http://localhost:8080";
const ITERATIONS = 120;
const INTERVAL = 30000; // 30 seconds between iterations

async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.de", password: "Test123!" }),
  });
  return (await r.json()).accessToken;
}

async function getMetric(name) {
  try {
    const r = await fetch(`${BASE}/actuator/metrics/${name}`);
    const d = await r.json();
    return d.measurements[0].value;
  } catch { return null; }
}

const questions = [
  "Welche Wertgrenzen gelten fuer Direktauftraege nach AV Paragraph 55 LHO?",
  "Welche Vorschriften gelten fuer Baugenehmigungen in Berlin?",
  "Was verdient ein Beschaeftigter in EG 9 Stufe 3?",
  "Welches Vergabeverfahren bei 50000 Euro fuer IT-Dienstleistungen?",
];

async function main() {
  let token = await login();
  const results = [];
  const memorySnapshots = [];

  console.log("=== 1-HOUR STABILITY TEST ===");
  console.log(`Iterations: ${ITERATIONS} | Interval: ${INTERVAL / 1000}s | Duration: ${(ITERATIONS * INTERVAL / 60000).toFixed(1)} min\n`);
  console.log("Time          Iter  Latency   Strategy           Heap(MB)  Threads  Status");

  for (let i = 1; i <= ITERATIONS; i++) {
    // Refresh token every 30 iterations
    if (i % 30 === 0) token = await login();

    const question = questions[i % questions.length];
    const start = performance.now();

    let status = "OK";
    let strategy = "ERROR";
    let latency = 0;

    try {
      const r = await fetch(`${BASE}/api/decision/stab-${i}-${Date.now()}/analyze`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ question }),
        signal: AbortSignal.timeout(90000),
      });
      const data = await r.json();
      strategy = data.strategy || "UNKNOWN";
      latency = Math.round(performance.now() - start);
      status = r.status;
    } catch (e) {
      latency = Math.round(performance.now() - start);
      status = "ERR";
    }

    results.push({ i, latency, strategy, status });

    // Memory snapshot every 10 iterations
    let heapMB = "?";
    let threads = "?";
    if (i % 10 === 0 || i === 1) {
      const heap = await getMetric("jvm.memory.used");
      const threadCount = await getMetric("jvm.threads.live");
      heapMB = heap ? (heap / 1024 / 1024).toFixed(0) : "?";
      threads = threadCount ? threadCount : "?";
      memorySnapshots.push({ i, heapMB, threads });
    }

    const time = new Date().toISOString().substring(11, 19);
    console.log(`${time}   ${String(i).padStart(3)}   ${String(latency).padStart(6)}ms ${strategy.padEnd(18)} ${String(heapMB).padStart(5)}MB  ${String(threads).padStart(5)}    ${status}`);

    // Wait for next iteration (account for request time)
    const elapsed = performance.now() - start;
    const wait = Math.max(5000, INTERVAL - elapsed);
    await new Promise(r => setTimeout(r, wait));
  }

  // Analysis
  const latencies = results.filter(r => r.status !== "ERR").map(r => r.latency);
  const errors = results.filter(r => r.status === "ERR").length;
  const avg = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const min = latencies.length ? Math.min(...latencies) : 0;
  const max = latencies.length ? Math.max(...latencies) : 0;

  console.log("\n=== STABILITY RESULTS ===");
  console.log(`Total iterations: ${ITERATIONS}`);
  console.log(`Errors: ${errors}/${ITERATIONS}`);
  console.log(`Latency: avg=${avg}ms min=${min}ms max=${max}ms`);
  console.log(`\nMemory snapshots:`);
  for (const s of memorySnapshots) {
    console.log(`  Iter ${String(s.i).padStart(3)}: Heap ${String(s.heapMB).padStart(5)}MB  Threads ${s.threads}`);
  }

  // Memory trend
  const firstHeap = Number(memorySnapshots[0]?.heapMB || 0);
  const lastHeap = Number(memorySnapshots[memorySnapshots.length - 1]?.heapMB || 0);
  const growth = lastHeap - firstHeap;
  console.log(`\nMemory trend: ${firstHeap}MB → ${lastHeap}MB (${growth > 0 ? "+" : ""}${growth}MB)`);
  if (growth > 50) console.log("WARNING: Significant heap growth detected — possible memory leak");
  else if (growth < 0) console.log("Heap decreased — GC functioning normally");
  else console.log("Heap stable — no memory leak detected");
}

main().catch(e => { console.error(e.message); process.exit(1); });
