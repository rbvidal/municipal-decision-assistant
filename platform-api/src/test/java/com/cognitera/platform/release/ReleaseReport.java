package com.cognitera.platform.release;

import com.cognitera.platform.ai.benchmark.BenchmarkQuestion;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Generates release validation reports with quality scoring.
 */
final class ReleaseReport {

    private ReleaseReport() {}

    record ReleaseResult(
            BenchmarkQuestion question,
            int httpStatus,
            String actualStrategy,
            double confidence,
            long totalMs,
            int sourceCount,
            int docCount,
            String answer,
            String regulation,
            boolean grounded,
            List<String> failures,
            int routingScore,
            int evidenceScore,
            int semanticsScore,
            int groundingScore,
            int overallScore
    ) {
        boolean passed() {
            return failures.isEmpty()
                    || failures.stream().allMatch(f -> f.startsWith("[ADVISORY]"));
        }
        boolean isWeak() {
            String a = answer != null ? answer : "";
            return a.length() < 200 || a.toLowerCase().contains("keine information")
                    || a.toLowerCase().contains("kann ich nicht")
                    || a.equals(question.question());
        }
    }

    static ReleaseResult from(BenchmarkQuestion q, int httpStatus, String strategy,
            double confidence, long totalMs, int sources, int docs,
            String answer, String regulation, boolean grounded, List<String> failures) {
        // Compute quality scores from the answer and expectations
        int routing = strategy.equals(q.expectedStrategy().name()) ? 100 : 0;
        int evidence = 100;
        if (q.expectedRegulation() != null && !q.expectedRegulation().isBlank()) {
            evidence = answer.contains(q.expectedRegulation()) ? 100 : 0;
        }
        String lower = answer.toLowerCase();
        int required = q.mustContainConcepts().size();
        int requiredOk = 0;
        for (String c : q.mustContainConcepts()) {
            if (lower.contains(c.toLowerCase())) requiredOk++;
        }
        int forbidden = q.mustNotContainConcepts().size();
        int forbiddenOk = 0;
        for (String c : q.mustNotContainConcepts()) {
            if (!lower.contains(c.toLowerCase())) forbiddenOk++;
        }
        int sem = (required + forbidden) == 0 ? 100
                : (int) Math.round(100.0 * (requiredOk + forbiddenOk) / (required + forbidden));
        int ground = grounded ? 100 : 0;
        int overall = (int) Math.round(routing * 0.25 + evidence * 0.25 + sem * 0.30 + ground * 0.20);

        return new ReleaseResult(q, httpStatus, strategy, confidence, totalMs, sources, docs,
                answer, regulation, grounded, failures,
                routing, evidence, sem, ground, overall);
    }

    static String markdown(List<ReleaseResult> results, String gitCommit, String model) {
        long passed = results.stream().filter(ReleaseResult::passed).count();
        double avgTotal = results.stream().mapToLong(ReleaseResult::totalMs).average().orElse(0);
        double avgConf = results.stream().mapToDouble(ReleaseResult::confidence).average().orElse(0);
        double avgSem = results.stream().mapToInt(ReleaseResult::semanticsScore).average().orElse(0);
        double avgOverall = results.stream().mapToInt(ReleaseResult::overallScore).average().orElse(0);

        StringBuilder sb = new StringBuilder();
        sb.append("# Municipal Decision Assistant — Release Validation Report\n\n");
        sb.append("| Field | Value |\n");
        sb.append("|-------|-------|\n");
        sb.append("| Date | ").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE)).append(" |\n");
        sb.append("| Git commit | ").append(gitCommit).append(" |\n");
        sb.append("| Model | ").append(model).append(" |\n");
        sb.append("| Question count | ").append(results.size()).append(" |\n");
        sb.append("| Passed | ").append(passed).append(" |\n");
        sb.append("| Failed | ").append(results.size() - passed).append(" |\n");
        sb.append(String.format("| Success rate | %.1f%% |\n",
                results.isEmpty() ? 0.0 : 100.0 * passed / results.size()));
        sb.append(String.format("| Avg latency | %.0f ms |\n", avgTotal));
        sb.append(String.format("| Avg confidence | %.3f |\n", avgConf));
        sb.append(String.format("| Semantics score | %.0f%% |\n", avgSem));
        sb.append(String.format("| Overall quality | %.0f%% |\n", avgOverall));
        sb.append("\n## Per Category\n\n");
        sb.append("| Category | Count | Passed | Avg Latency | Avg Quality |\n");
        sb.append("|----------|-------|--------|-------------|-------------|\n");
        var byCat = new LinkedHashMap<String, List<ReleaseResult>>();
        for (var r : results) byCat.computeIfAbsent(
                r.question().category(), k -> new ArrayList<>()).add(r);
        for (var e : byCat.entrySet()) {
            long cp = e.getValue().stream().filter(ReleaseResult::passed).count();
            double ca = e.getValue().stream().mapToLong(ReleaseResult::totalMs).average().orElse(0);
            double cq = e.getValue().stream().mapToInt(ReleaseResult::overallScore).average().orElse(0);
            sb.append(String.format("| %s | %d | %d | %.0f ms | %.0f%% |\n",
                    e.getKey(), e.getValue().size(), cp, ca, cq));
        }

        // Per question — sorted by quality
        List<ReleaseResult> sorted = new ArrayList<>(results);
        sorted.sort((a, b) -> Integer.compare(b.overallScore(), a.overallScore()));
        sb.append("\n## Per Question (sorted by quality)\n\n");
        sb.append("| ID | Strategy | Latency | Confidence | Routing | Evidence | Semantics | Grounding | Overall |\n");
        sb.append("|----|----------|---------|------------|---------|----------|-----------|----------|--------|\n");
        for (var r : sorted) {
            String flag = r.isWeak() ? " ⚠" : "";
            sb.append(String.format("| %s%s | %s | %d ms | %.3f | %d%% | %d%% | %d%% | %d%% | %d%% |\n",
                    r.question().id(), flag, r.actualStrategy(),
                    r.totalMs(), r.confidence(),
                    r.routingScore(), r.evidenceScore(), r.semanticsScore(),
                    r.groundingScore(), r.overallScore()));
        }

        // Weak answers
        var weak = results.stream().filter(ReleaseResult::isWeak).toList();
        if (!weak.isEmpty()) {
            sb.append("\n## Questions with Weak Answers\n\n");
            for (var r : weak) {
                sb.append("- **").append(r.question().id()).append("**: ")
                        .append(r.question().question()).append("\n");
                sb.append("  - Answer length: ").append(r.answer().length()).append(" chars\n");
                sb.append("  - Quality: ").append(r.overallScore()).append("%\n");
            }
        }

        // Short answers
        List<ReleaseResult> shortAnswers = results.stream().filter(r ->
                r.answer() != null && r.answer().length() < 300).toList();
        if (!shortAnswers.isEmpty()) {
            sb.append("\n## Questions with Short Answers (<300 chars)\n\n");
            for (ReleaseResult r : shortAnswers) {
                sb.append("- **").append(r.question().id()).append("**: ")
                        .append(r.overallScore()).append("% quality\n");
            }
        }

        // Low confidence
        List<ReleaseResult> lowConf = results.stream().filter(r -> r.confidence() < 0.50).toList();
        if (!lowConf.isEmpty()) {
            sb.append("\n## Questions with Low Confidence (<0.50)\n\n");
            for (ReleaseResult r : lowConf) {
                sb.append("- **").append(r.question().id()).append("**: ")
                        .append(String.format("%.3f", r.confidence())).append("\n");
            }
        }

        // Failures
        var failed = results.stream().filter(r -> !r.passed()).toList();
        if (!failed.isEmpty()) {
            sb.append("\n## Failures\n\n");
            for (var r : failed) {
                sb.append("### ").append(r.question().id()).append("\n\n");
                sb.append("**Q:** ").append(r.question().question()).append("\n\n");
                for (var f : r.failures()) {
                    sb.append("- ").append(f).append("\n");
                }
                sb.append("\n");
            }
        } else {
            sb.append("\n## Failures\n\nNo failures.\n");
        }

        sb.append("\n---\n\n");
        sb.append("## READY FOR RELEASE: **");
        sb.append(failed.isEmpty() ? "YES" : "NO");
        sb.append("**\n");

        return sb.toString();
    }
}
