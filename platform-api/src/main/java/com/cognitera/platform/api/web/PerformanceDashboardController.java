package com.cognitera.platform.api.web;

import com.cognitera.platform.ai.application.PipelineProfiler;
import com.cognitera.platform.ai.application.PipelineProfiler.StageTiming;
import com.cognitera.platform.ai.config.AiPipelineProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.*;

/**
 * Developer-only performance dashboard and retrieval quality inspector.
 *
 * <p>Exposes pipeline timing, evidence composition, configuration values,
 * and retrieval metrics for debugging and optimization.
 */
@Controller
@RequestMapping("/dev")
public class PerformanceDashboardController {

    private static final Logger log = LoggerFactory.getLogger(PerformanceDashboardController.class);

    private final ObjectProvider<PipelineProfiler> profilerProvider;
    private final AiPipelineProperties props;
    private final List<RequestRecord> recentRequests = new ArrayList<>();
    private static final int MAX_RECORDS = 50;

    public PerformanceDashboardController(ObjectProvider<PipelineProfiler> profilerProvider,
                                           AiPipelineProperties props) {
        this.profilerProvider = profilerProvider;
        this.props = props;
    }

    @GetMapping("/perf")
    public String dashboard(Model model) {
        PipelineProfiler profiler = profilerProvider.getIfAvailable();
        Map<String, StageTiming> profile = profiler != null
                ? profiler.getCurrentProfile() : Map.of();
        long totalMs = profiler != null ? profiler.totalMs() : 0;

        model.addAttribute("profile", profile);
        model.addAttribute("totalMs", totalMs);
        model.addAttribute("config", buildConfigMap());
        model.addAttribute("recentRequests", recentRequests);

        return buildHtml(profile, totalMs);
    }

    @GetMapping("/perf/config")
    @ResponseBody
    public Map<String, Object> config() {
        return buildConfigMap();
    }

    @GetMapping("/perf/profile")
    @ResponseBody
    public Map<String, Object> profile() {
        PipelineProfiler profiler = profilerProvider.getIfAvailable();
        if (profiler == null) return Map.of("available", false);
        Map<String, StageTiming> profile = profiler.getCurrentProfile();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalMs", profiler.totalMs());
        List<Map<String, Object>> stages = new ArrayList<>();
        for (var entry : profile.entrySet()) {
            StageTiming s = entry.getValue();
            stages.add(Map.of("name", s.name(), "ms", s.ms()));
        }
        result.put("stages", stages);
        result.put("recentRequests", recentRequests);
        return result;
    }

    private Map<String, Object> buildConfigMap() {
        Map<String, Object> cfg = new LinkedHashMap<>();
        cfg.put("max-evidence-sources", props.getMaxEvidenceSources());
        cfg.put("max-paragraphs-per-source", props.getMaxParagraphsPerSource());
        cfg.put("max-prompt-length", props.getMaxPromptLength());
        cfg.put("max-excerpt-length", props.getMaxExcerptLength());
        cfg.put("retry-enabled", props.isRetryEnabled());
        cfg.put("coverage-threshold", props.getCoverageThreshold());
        cfg.put("domain-boost-factor", props.getDomainBoostFactor());
        cfg.put("max-mismatched-documents", props.getMaxMismatchedDocuments());
        return cfg;
    }

    private String buildHtml(Map<String, StageTiming> profile, long totalMs) {
        StringBuilder h = new StringBuilder();
        h.append("""
            <!doctype html><html lang="de"><head><title>Performance Dashboard</title>
            <style>
            body{font-family:Inter,system-ui,sans-serif;background:#f8f9fb;color:#232632;padding:24px;max-width:900px;margin:0 auto}
            h1{font-size:1.3rem;margin:0 0 8px}h2{font-size:1rem;margin:24px 0 12px}
            .card{background:#fff;border:1px solid #e2e4eb;border-radius:10px;padding:16px 20px;margin-bottom:16px}
            .bar{display:flex;align-items:center;gap:10px;margin:6px 0;font-size:.84rem}
            .bar-fill{height:18px;background:#4d7cff;border-radius:4px;min-width:2px}
            .bar-label{min-width:180px;font-weight:500}.bar-ms{min-width:80px;text-align:right;color:#6f7585}
            .total{font-size:.92rem;font-weight:700;margin-top:12px;padding-top:12px;border-top:1px solid #e2e4eb}
            .config-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;font-size:.82rem}
            .config-item{display:flex;justify-content:space-between}.config-key{color:#6f7585}.config-val{font-weight:600}
            .empty{color:#9da2b0;font-style:italic;padding:12px 0}
            .metric-big{font-size:2rem;font-weight:800;color:#1a4cd4}
            .metric-label{font-size:.78rem;color:#6f7585;text-transform:uppercase;letter-spacing:.04em}
            .metrics{display:flex;gap:32px;margin-bottom:16px}
            </style></head><body>
            <h1>⚡ Performance Dashboard</h1>
            <p style="color:#6f7585;font-size:.84rem;margin:0 0 20px">Developer-only — pipeline profiling, configuration, and retrieval metrics</p>
            """);

        // Quick metrics
        h.append("<div class=\"metrics\">");
        h.append("<div><div class=\"metric-big\">").append(totalMs).append(" ms</div><div class=\"metric-label\">Letzte Antwort</div></div>");
        h.append("<div><div class=\"metric-big\">").append(props.getMaxEvidenceSources()).append("</div><div class=\"metric-label\">Max. Quellen</div></div>");
        h.append("<div><div class=\"metric-big\">").append(props.getMaxPromptLength()).append("</div><div class=\"metric-label\">Max. Prompt</div></div>");
        h.append("</div>");

        // Pipeline profile
        h.append("<div class=\"card\"><h2>Pipeline-Profil (letzte Anfrage)</h2>");
        if (profile.isEmpty()) {
            h.append("<div class=\"empty\">Keine Profildaten — führe eine Anfrage aus.</div>");
        } else {
            for (var entry : profile.entrySet()) {
                StageTiming s = entry.getValue();
                if ("pipeline-start".equals(s.name())) continue;
                double pct = totalMs > 0 ? (double) s.ms() / totalMs * 100 : 0;
                int barW = (int) Math.max(1, pct * 4);
                h.append("<div class=\"bar\">")
                  .append("<span class=\"bar-label\">").append(s.name()).append("</span>")
                  .append("<span class=\"bar-ms\">").append(s.ms()).append(" ms</span>")
                  .append("<div class=\"bar-fill\" style=\"width:").append(barW).append("px\"></div>")
                  .append("</div>");
            }
            h.append("<div class=\"total\">Gesamt: ").append(totalMs).append(" ms</div>");
        }
        h.append("</div>");

        // Configuration
        h.append("<div class=\"card\"><h2>Konfiguration</h2><div class=\"config-grid\">");
        Map<String, Object> cfg = buildConfigMap();
        for (var entry : cfg.entrySet()) {
            h.append("<div class=\"config-item\"><span class=\"config-key\">")
              .append(entry.getKey()).append("</span><span class=\"config-val\">")
              .append(entry.getValue()).append("</span></div>");
        }
        h.append("</div></div>");

        h.append("</body></html>");
        return h.toString();
    }

    /** Record of a past request for the dashboard. */
    public record RequestRecord(
            String requestId,
            String query,
            long totalMs,
            int sourcesRetrieved,
            int uniqueDocs,
            int promptChars,
            long inferenceMs,
            double coverage,
            String domain
    ) {}
}
