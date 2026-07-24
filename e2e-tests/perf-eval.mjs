// Performance & SRE Evaluation
const BASE = "http://localhost:8080";

async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.de", password: "Test123!" }),
  });
  return (await r.json()).accessToken;
}

async function apiCall(token, endpoint, method = "GET", body = null) {
  const opts = { method, headers: { "Authorization": `Bearer ${token}` } };
  if (body) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const start = performance.now();
  const r = await fetch(`${BASE}${endpoint}`, opts);
  const data = await r.json().catch(() => ({}));
  const latency = Math.round(performance.now() - start);
  return { status: r.status, latency, data };
}

const QUESTIONS = [
  { q: "Welche Wertgrenzen gelten fuer Direktauftraege nach AV Paragraph 55 LHO?", label: "Procurement-RULE" },
  { q: "Was verdient ein Beschaeftigter in EG 9 Stufe 3 brutto monatlich?", label: "Salary-RULE" },
  { q: "Welche Vorschriften gelten fuer Baugenehmigungen in Berlin?", label: "Building-GRAPH" },
  { q: "Welches Vergabeverfahren brauche ich bei 50000 Euro fuer IT-Dienstleistungen?", label: "Procurement-amount" },
  { q: "Was ist das Bundesreisekostengesetz und welche Pauschalen gelten?", label: "Travel-mixed" },
];

async function measurePipeline() {
  const token = await login();
  console.log("=== PIPELINE STAGE LATENCY (ms) ===\n");

  const results = [];
  for (const { q, label } of QUESTIONS) {
    const start = performance.now();
    const { data, status } = await apiCall(token, `/api/decision/perf-${Date.now()}/analyze`, "POST", { question: q });
    const total = Math.round(performance.now() - start);

    const strategy = data.strategy || "UNKNOWN";
    const confidence = data.confidence?.overall ?? 0;
    const duration = data.duration || "";
    const answerLen = (data.summary || data.answer || "").length;

    // Attempt to extract pipeline timing from the response
    // The duration field is "PT2S" format — parse ISO duration
    let llmMs = 0;
    if (duration) {
      const m = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
      if (m) {
        llmMs = ((parseInt(m[1]) || 0) * 3600 + (parseInt(m[2]) || 0) * 60 + (parseFloat(m[3]) || 0)) * 1000;
      }
    }

    results.push({ label, strategy, total, confidence, answerLen, llmMs, status });

    console.log(`[${label}] S:${strategy.padEnd(16)} Total:${String(total).padStart(5)}ms LLM:${String(Math.round(llmMs)).padStart(4)}ms C:${confidence.toFixed(2)} Ans:${answerLen}ch`);
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log("\n--- Pipeline Summary ---");
  const avgTotal = results.reduce((s, r) => s + r.total, 0) / results.length;
  console.log(`Average total response: ${Math.round(avgTotal)}ms`);
  console.log(`RULE_ENGINE avg: ${Math.round(results.filter(r => r.strategy === "RULE_ENGINE").reduce((s, r) => s + r.total, 0) / Math.max(1, results.filter(r => r.strategy === "RULE_ENGINE").length))}ms`);
  console.log(`GRAPH_REASONING avg: ${Math.round(results.filter(r => r.strategy === "GRAPH_REASONING").reduce((s, r) => s + r.total, 0) / Math.max(1, results.filter(r => r.strategy === "GRAPH_REASONING").length))}ms`);
  return results;
}

async function measureEndpoints(token) {
  console.log("\n=== ENDPOINT BASELINE LATENCY ===\n");
  const endpoints = [
    ["GET", "/api/workspaces"],
    ["GET", "/api/documents"],
    ["GET", "/api/knowledge"],
    ["GET", "/actuator/health"],
    ["POST", "/api/search", { query: "Baugenehmigung" }],
  ];

  for (const [method, path, body] of endpoints) {
    const { latency, status } = await apiCall(token, path, method, body || null);
    console.log(`  ${method.padEnd(5)} ${path.padEnd(30)} ${String(latency).padStart(5)}ms HTTP ${status}`);
  }
}

async function measureResources() {
  console.log("\n=== RESOURCE USAGE ===\n");

  // JVM metrics
  try {
    const r = await fetch(`${BASE}/actuator/metrics/jvm.memory.used`);
    const d = await r.json();
    const heapMB = (d.measurements[0].value / 1024 / 1024).toFixed(1);
    console.log(`  JVM heap used: ${heapMB} MB`);
  } catch { console.log("  JVM metrics: unavailable"); }

  try {
    const r = await fetch(`${BASE}/actuator/metrics/jvm.threads.live`);
    const d = await r.json();
    console.log(`  JVM threads:    ${d.measurements[0].value}`);
  } catch { console.log("  JVM threads: unavailable"); }

  try {
    const r = await fetch(`${BASE}/actuator/metrics/process.cpu.usage`);
    const d = await r.json();
    console.log(`  CPU usage:      ${(d.measurements[0].value * 100).toFixed(1)}%`);
  } catch { console.log("  CPU: unavailable"); }

  // Docker stats
  const { exec } = await import("child_process");
  const dockerStats = () => new Promise(resolve => {
    exec("docker stats --no-stream --format \"table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}\\t{{.MemPerc}}\" 2>/dev/null", (err, stdout) => {
      if (err) resolve("Docker stats unavailable");
      else resolve(stdout);
    });
  });
  console.log("\n  Docker containers:");
  const stats = await dockerStats();
  console.log("  " + stats.split("\n").join("\n  "));
}

async function loadTest(token, concurrency, question, label) {
  console.log(`\n--- Load: ${concurrency} concurrent users (${label}) ---`);
  const startAll = performance.now();
  const promises = [];
  const latencies = [];
  const errors = [];

  for (let i = 0; i < concurrency; i++) {
    promises.push((async () => {
      const start = performance.now();
      try {
        const { data, status } = await apiCall(token, `/api/decision/load-${i}-${Date.now()}/analyze`, "POST", { question });
        const lat = Math.round(performance.now() - start);
        latencies.push(lat);
        return { status, lat, strategy: data.strategy };
      } catch (e) {
        errors.push(e.message);
        latencies.push(Math.round(performance.now() - start));
        return { status: 0, lat: 0, strategy: "ERROR" };
      }
    })());
  }

  const results = await Promise.all(promises);
  const totalTime = Math.round(performance.now() - startAll);

  const avg = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
  const min = latencies.length ? Math.min(...latencies) : 0;
  const max = latencies.length ? Math.max(...latencies) : 0;
  const p95 = latencies.length ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)] : 0;

  console.log(`  Completed: ${results.length - errors.length}/${concurrency}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Wall time: ${totalTime}ms`);
  console.log(`  Latency: avg=${avg}ms min=${min}ms max=${max}ms p95=${p95}ms`);
  console.log(`  Throughput: ${(concurrency / (totalTime / 1000)).toFixed(2)} req/s`);

  // Check memory after load
  try {
    const r = await fetch(`${BASE}/actuator/metrics/jvm.memory.used`);
    const d = await r.json();
    console.log(`  JVM heap after: ${(d.measurements[0].value / 1024 / 1024).toFixed(1)} MB`);
  } catch {}

  return { concurrency, avg, p95, max, totalTime, errors: errors.length, throughput: concurrency / (totalTime / 1000) };
}

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  PERFORMANCE & SRE EVALUATION            ║");
  console.log("╚══════════════════════════════════════════╝\n");

  // Phase 1: Pipeline measurement
  const pipelineResults = await measurePipeline();

  // Phase 2: Endpoint baselining
  const token = await login();
  await measureEndpoints(token);

  // Phase 3: Resource baseline
  await measureResources();

  // Phase 4: Load testing
  console.log("\n=== LOAD TEST ===\n");
  const testQuestion = "Welche Wertgrenzen gelten fuer Direktauftraege?";
  const loadResults = [];

  for (const concurrency of [1, 3, 5]) {
    const r = await loadTest(token, concurrency, testQuestion, `level-${concurrency}`);
    loadResults.push(r);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Phase 5: Post-load resources
  console.log("\n=== POST-LOAD RESOURCES ===");
  await measureResources();

  // Final summary
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  PERFORMANCE SUMMARY                     ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`\nPipeline (ms):`);
  for (const r of pipelineResults) {
    console.log(`  ${r.label.padEnd(20)} ${String(r.total).padStart(5)}ms ${r.strategy.padEnd(16)} conf=${r.confidence.toFixed(2)}`);
  }
  console.log(`\nLoad test:`);
  for (const r of loadResults) {
    console.log(`  ${r.concurrency} users: avg=${r.avg}ms p95=${r.p95}ms max=${r.max}ms tput=${r.throughput.toFixed(2)}r/s errors=${r.errors}`);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
