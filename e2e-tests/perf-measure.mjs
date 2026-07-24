// Performance Measurement — collects all metrics in one run
const BASE = "http://localhost:8080";

async function login() {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@test.de", password: "Test123!" }),
  });
  return (await r.json()).accessToken;
}

async function api(token, method, path, body) {
  const opts = { method, headers: { "Authorization": `Bearer ${token}` } };
  if (body) { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  const t0 = performance.now();
  const r = await fetch(`${BASE}${path}`, opts);
  const data = await r.json().catch(() => ({}));
  return { status: r.status, ms: Math.round(performance.now() - t0), data };
}

async function metric(name) {
  try {
    const r = await fetch(`${BASE}/actuator/metrics/${name}`);
    const d = await r.json();
    return d.measurements?.[0]?.value ?? null;
  } catch { return null; }
}

// ============================================================
async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  PERFORMANCE MEASUREMENT                 ║");
  console.log("╚══════════════════════════════════════════╝\n");

  const token = await login();

  // --- 1. JVM BASELINE ---
  console.log("=== 1. JVM BASELINE ===");
  const heap0 = await metric("jvm.memory.used");
  const heapMax = await metric("jvm.memory.max");
  const threads0 = await metric("jvm.threads.live");
  const gcCount = await metric("jvm.gc.pause");
  const cpu0 = await metric("process.cpu.usage");
  const dbConn = await metric("hikaricp.connections.active");
  console.log(`  Heap:        ${(heap0 / 1024 / 1024).toFixed(0)} / ${(heapMax / 1024 / 1024).toFixed(0)} MB`);
  console.log(`  Threads:     ${threads0}`);
  console.log(`  DB conns:    ${dbConn ?? "N/A"}`);
  console.log(`  CPU:         ${cpu0 ? (cpu0 * 100).toFixed(1) + "%" : "N/A"}`);

  // --- 2. ENDPOINT BASELINE ---
  console.log("\n=== 2. ENDPOINT LATENCY ===");
  const endpoints = [
    ["GET",  "/api/workspaces"],
    ["GET",  "/api/documents"],
    ["GET",  "/api/knowledge"],
    ["GET",  "/actuator/health"],
    ["POST", "/api/search", {query: "Baugenehmigung"}],
    ["GET",  "/api/corpus/audit"],
    ["GET",  "/api/decision/test-case"],
  ];
  for (const [m, p, b] of endpoints) {
    const { ms, status } = await api(token, m, p, b || null);
    console.log(`  ${m.padEnd(5)} ${p.padEnd(32)} ${String(ms).padStart(5)}ms HTTP ${status}`);
  }

  // --- 3. AI PIPELINE TIMING ---
  console.log("\n=== 3. AI PIPELINE STAGES ===");
  const aiQuestions = [
    ["RULE_ENGINE",  "Welche Wertgrenzen gelten fuer Direktauftraege nach AV Paragraph 55 LHO?"],
    ["RULE_ENGINE",  "Was verdient ein Beschaeftigter in EG 9 Stufe 3 brutto monatlich?"],
    ["GRAPH_REASONING", "Welche Vorschriften gelten fuer Baugenehmigungen in Berlin?"],
    ["GRAPH_REASONING", "Was ist der Unterschied zwischen BauGB Paragraph 30 und Paragraph 34?"],
  ];

  const pipelineResults = [];
  for (const [expected, q] of aiQuestions) {
    const t0 = performance.now();

    // Phase 1: Submit question
    const { ms, data } = await api(token, "POST", `/api/decision/perf-${Date.now()}/analyze`, { question: q });
    const total = Math.round(performance.now() - t0);

    // Parse duration (LLM time from response)
    let llmTimeMs = 0;
    const dur = data.duration || "";
    const dm = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (dm) llmTimeMs = ((parseInt(dm[1])||0)*3600 + (parseInt(dm[2])||0)*60 + (parseFloat(dm[3])||0)) * 1000;

    const retrievalTimeMs = total - llmTimeMs;
    const strategy = data.strategy || "UNKNOWN";
    const conf = data.confidence?.overall ?? 0;

    pipelineResults.push({ expected, strategy, total, llmTimeMs, retrievalTimeMs, conf, answerLen: (data.summary||data.answer||"").length });

    const match = expected === strategy ? "✓" : "?";
    console.log(`  ${match} ${expected.padEnd(18)} total:${String(total).padStart(6)}ms  retrieval:${String(Math.round(retrievalTimeMs)).padStart(6)}ms  llm:${String(Math.round(llmTimeMs)).padStart(5)}ms  conf:${conf.toFixed(2)}  strategy:${strategy}`);
  }

  // --- 4. OLLAMA METRICS ---
  console.log("\n=== 4. OLLAMA ===");
  try {
    const r = await fetch("http://localhost:11434/api/tags");
    const d = await r.json();
    const models = d.models || [];
    for (const m of models.slice(0, 5)) {
      console.log(`  ${m.name.padEnd(30)} ${m.size ? (m.size/1024/1024/1024).toFixed(1) + "GB" : "?"}`);
    }
  } catch (e) { console.log("  Ollama unreachable"); }

  // Measure Ollama inference directly
  console.log("  Direct Ollama inference test:");
  try {
    const t0 = performance.now();
    const r = await fetch("http://localhost:11434/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "qwen2.5:14b", prompt: "Was ist die Bauordnung Berlin? Antworte in einem Satz.", stream: false }),
      signal: AbortSignal.timeout(60000),
    });
    const d = await r.json();
    const ollamaMs = Math.round(performance.now() - t0);
    const tokensPerSec = d.eval_count && d.eval_duration ? ((d.eval_count / (d.eval_duration / 1e9)).toFixed(0)) : "?";
    console.log(`  Model: ${d.model || "?"}  Total: ${ollamaMs}ms  Eval: ${d.eval_count || 0} tokens @ ${tokensPerSec} tok/s  Prompt: ${d.prompt_eval_count || 0} tok`);
  } catch (e) { console.log(`  Ollama test failed: ${e.message}`); }

  // --- 5. DATABASE PERFORMANCE ---
  console.log("\n=== 5. DATABASE ===");
  // Health details give us connection status
  try {
    const r = await fetch(`${BASE}/actuator/health`);
    const d = await r.json();
    const comps = d.components || {};
    for (const [name, c] of Object.entries(comps)) {
      if (["db", "neo4j", "qdrant"].includes(name)) {
        const status = c.status === "UP" ? "UP" : "DOWN";
        const details = name === "neo4j" ? `connected:${c.details?.connected || false}` :
                        name === "qdrant" ? `url:${c.details?.url || "?"}` :
                        `db:${c.details?.database || "?"}`;
        console.log(`  ${name.padEnd(12)} ${status}  ${details}`);
      }
    }
  } catch {}

  // --- 6. POST-WORKLOAD METRICS ---
  console.log("\n=== 6. POST-WORKLOAD ===");
  const heap1 = await metric("jvm.memory.used");
  const threads1 = await metric("jvm.threads.live");
  const cpu1 = await metric("process.cpu.usage");
  console.log(`  Heap:        ${(heap0/1024/1024).toFixed(0)} → ${(heap1/1024/1024).toFixed(0)} MB (${(heap1 > heap0 ? "+" : "")}${((heap1-heap0)/1024/1024).toFixed(1)} MB)`);
  console.log(`  Threads:     ${threads0} → ${threads1} (${threads1 > threads0 ? "+" : ""}${threads1 - threads0})`);
  console.log(`  CPU:         ${cpu1 ? (cpu1*100).toFixed(1)+"%" : "N/A"}`);

  // --- 7. CONCURRENCY ESTIMATION ---
  console.log("\n=== 7. CONCURRENCY MODEL ===");
  const avgAI = pipelineResults.reduce((s, r) => s + r.total, 0) / pipelineResults.length;
  console.log(`  Avg AI response:   ${Math.round(avgAI)}ms (${(avgAI/1000).toFixed(1)}s)`);
  console.log(`  Single user tput:  ${(1000/avgAI).toFixed(3)} req/s`);

  // With 1 Ollama model, requests serialize. Estimate:
  const ollamaTime = pipelineResults.reduce((s, r) => s + r.llmTimeMs, 0) / pipelineResults.length;
  const overhead = avgAI - ollamaTime;
  console.log(`  Ollama inference:  ${Math.round(ollamaTime)}ms avg`);
  console.log(`  Non-LLM overhead:  ${Math.round(overhead)}ms`);

  console.log("\n  Estimated throughput (Ollama-serialized):");
  for (const n of [1, 3, 5, 10]) {
    const concurrentThroughput = n / (ollamaTime * n / 1000 + overhead / 1000);
    console.log(`    ${String(n).padStart(2)} users: ~${concurrentThroughput.toFixed(2)} req/s  (~${(ollamaTime*n/1000 + overhead/1000).toFixed(1)}s per batch)`);
  }

  // --- SUMMARY ---
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║  MEASUREMENT COMPLETE                    ║");
  console.log("╚══════════════════════════════════════════╝");
}

main().catch(e => { console.error(e.message); process.exit(1); });
