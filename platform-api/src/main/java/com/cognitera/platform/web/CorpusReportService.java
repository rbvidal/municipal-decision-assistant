package com.cognitera.platform.web;

import com.cognitera.platform.ai.benchmark.BenchmarkDataset;
import com.cognitera.platform.ai.benchmark.BenchmarkQuestion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Generates Markdown reports for corpus visibility and release readiness.
 * All reports are written to the {@code docs/} directory.
 */
@Service
public class CorpusReportService {

    private static final Logger log = LoggerFactory.getLogger(CorpusReportService.class);

    private static final Path DOCS_DIR = Path.of("docs");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final CorpusManifestService manifestService;

    public CorpusReportService(CorpusManifestService manifestService) {
        this.manifestService = manifestService;
    }

    // ── Corpus Inventory ──

    /**
     * Generates {@code docs/CORPUS_INVENTORY.md} with full corpus statistics,
     * documents by domain, coverage, missing regulations, and warnings.
     */
    public String generateInventoryReport() {
        manifestService.syncFromDocuments();
        var summary = manifestService.getSummary();
        var all = manifestService.findAll();
        var missingDocs = manifestService.findMissingDocuments();
        var outdatedDocs = manifestService.findOutdatedDocuments();
        var duplicates = manifestService.findDuplicates();
        var withoutEmb = manifestService.findWithoutEmbeddings();
        var withoutVec = manifestService.findWithoutVectors();
        var failedExtract = manifestService.findFailedExtraction();
        var lowText = manifestService.findLowTextLength();
        var singleChunk = manifestService.findSingleChunkDocuments();

        StringBuilder sb = new StringBuilder();
        sb.append("# Corpus Inventory\n\n");
        sb.append("> Auto-generated: ").append(LocalDate.now().format(DATE_FMT)).append("\n\n");
        sb.append("---\n\n");

        // Summary
        sb.append("## Summary\n\n");
        sb.append("| Metric | Value |\n");
        sb.append("|---|---|\n");
        sb.append("| Total manifest entries | ").append(summary.totalEntries()).append(" |\n");
        sb.append("| Linked to stored documents | ").append(summary.withDocuments()).append(" |\n");
        sb.append("| Fully embedded | ").append(summary.fullyEmbedded()).append(" |\n");
        sb.append("| Fully indexed | ").append(summary.fullyIndexed()).append(" |\n");
        sb.append("| Total chunks | ").append(summary.totalChunks()).append(" |\n");
        sb.append("| Total vectors | ").append(summary.totalVectors()).append(" |\n\n");

        // Documents by domain
        sb.append("## Documents by Legal Domain\n\n");
        sb.append("| Domain | Count |\n");
        sb.append("|---|---|\n");
        var byDomain = summary.byDomain();
        List.of("Vergaberecht", "Baurecht", "Personalrecht", "Allgemein").forEach(domain -> {
            long count = byDomain.getOrDefault(domain, 0L);
            sb.append("| ").append(domain).append(" | ").append(count).append(" |\n");
        });
        // any other domains
        byDomain.entrySet().stream()
                .filter(e -> !List.of("Vergaberecht", "Baurecht", "Personalrecht", "Allgemein").contains(e.getKey()))
                .forEach(e -> sb.append("| ").append(e.getKey()).append(" | ").append(e.getValue()).append(" |\n"));
        sb.append("\n");

        // Coverage by domain (percentage)
        sb.append("## Coverage by Domain\n\n");
        sb.append("| Domain | Coverage | Status |\n");
        sb.append("|---|---|---|\n");
        for (String domain : List.of("Vergaberecht", "Baurecht", "Personalrecht")) {
            long count = byDomain.getOrDefault(domain, 0L);
            String status;
            if (count >= 5) status = ":green_circle: Ausreichend";
            else if (count >= 2) status = ":yellow_circle: Teilweise";
            else status = ":red_circle: Unzureichend";
            sb.append("| ").append(domain).append(" | ").append(count).append(" Dokumente | ")
                    .append(status).append(" |\n");
        }
        sb.append("\n");

        // Missing regulations (from manifest entries without documents)
        sb.append("## Missing Regulations\n\n");
        if (missingDocs.isEmpty()) {
            sb.append("Keine fehlenden Dokumente.\n\n");
        } else {
            sb.append("| Title | Priority |\n");
            sb.append("|---|---|\n");
            for (var m : missingDocs) {
                sb.append("| ").append(m.getTitle()).append(" | ")
                        .append(m.getPriority() != null ? m.getPriority() : "—").append(" |\n");
            }
            sb.append("\n");
        }

        // Warnings
        sb.append("## Warnings\n\n");

        if (!outdatedDocs.isEmpty()) {
            sb.append("### Outdated Documents (").append(outdatedDocs.size()).append(")\n\n");
            for (var m : outdatedDocs) {
                sb.append("- ").append(m.getTitle()).append("\n");
            }
            sb.append("\n");
        }

        if (!duplicates.isEmpty()) {
            sb.append("### Duplicate Documents (").append(duplicates.size()).append(" groups)\n\n");
            for (var entry : duplicates.entrySet()) {
                sb.append("- \"").append(entry.getKey()).append("\" — ")
                        .append(entry.getValue().size()).append(" copies\n");
            }
            sb.append("\n");
        }

        if (!withoutEmb.isEmpty()) {
            sb.append("### Without Embeddings (").append(withoutEmb.size()).append(")\n\n");
            for (var m : withoutEmb) {
                sb.append("- ").append(m.getTitle()).append("\n");
            }
            sb.append("\n");
        }

        if (!withoutVec.isEmpty()) {
            sb.append("### Without Vectors (").append(withoutVec.size()).append(")\n\n");
            for (var m : withoutVec) {
                sb.append("- ").append(m.getTitle()).append("\n");
            }
            sb.append("\n");
        }

        if (!failedExtract.isEmpty()) {
            sb.append("### Failed Extraction (").append(failedExtract.size()).append(")\n\n");
            for (var m : failedExtract) {
                sb.append("- ").append(m.getTitle()).append("\n");
            }
            sb.append("\n");
        }

        if (!lowText.isEmpty()) {
            sb.append("### Low Text Length (").append(lowText.size()).append(")\n\n");
            for (var m : lowText) {
                sb.append("- ").append(m.getTitle()).append(" (").append(m.getExtractedChars())
                        .append(" Zeichen)\n");
            }
            sb.append("\n");
        }

        if (!singleChunk.isEmpty()) {
            sb.append("### Single Chunk Only (").append(singleChunk.size()).append(")\n\n");
            for (var m : singleChunk) {
                sb.append("- ").append(m.getTitle()).append("\n");
            }
            sb.append("\n");
        }

        // All entries
        sb.append("## All Entries\n\n");
        sb.append("| # | Title | Domain | Type | Priority | Chunks | Vectors | Status |\n");
        sb.append("|---|---|---|---|---|---|---|---|\n");
        var sorted = all.stream()
                .sorted(Comparator.comparing(e -> e.getTitle() != null ? e.getTitle() : ""))
                .toList();
        int idx = 1;
        for (var m : sorted) {
            String status = m.getEmbeddingStatus() == CorpusManifestEntity.EmbeddingStatus.EMBEDDED
                    && m.getIndexingStatus() == CorpusManifestEntity.IndexingStatus.INDEXED
                    ? "READY" : m.getEmbeddingStatus().name();
            sb.append("| ").append(idx++).append(" | ")
                    .append(m.getTitle()).append(" | ")
                    .append(m.getLegalDomain() != null ? m.getLegalDomain() : "—").append(" | ")
                    .append(m.getDocType() != null ? m.getDocType() : "—").append(" | ")
                    .append(m.getPriority() != null ? m.getPriority() : "—").append(" | ")
                    .append(m.getChunkCount()).append(" | ")
                    .append(m.getVectorCount()).append(" | ")
                    .append(status).append(" |\n");
        }

        String report = sb.toString();
        writeToFile(DOCS_DIR.resolve("CORPUS_INVENTORY.md"), report);
        return report;
    }

    // ── Release Corpus Report ──

    /**
     * Generates a release readiness report by cross-referencing the
     * {@link BenchmarkDataset} against the corpus manifest.
     */
    public String generateReleaseCorpusReport() {
        manifestService.syncFromDocuments();
        var summary = manifestService.getSummary();
        var all = manifestService.findAll();
        List<BenchmarkQuestion> questions = BenchmarkDataset.all();

        Map<String, Long> byDomain = summary.byDomain();

        // Group benchmark questions by category
        Map<String, List<BenchmarkQuestion>> questionsByCategory = questions.stream()
                .collect(Collectors.groupingBy(BenchmarkQuestion::category, LinkedHashMap::new, Collectors.toList()));

        // Analyze coverage
        Map<String, String> domainCoverage = new LinkedHashMap<>();
        domainCoverage.put("Procurement",
                byDomain.getOrDefault("Vergaberecht", 0L) >= 5 ? "FULL" :
                byDomain.getOrDefault("Vergaberecht", 0L) >= 2 ? "PARTIAL" : "INSUFFICIENT");
        domainCoverage.put("Building",
                byDomain.getOrDefault("Baurecht", 0L) >= 5 ? "FULL" :
                byDomain.getOrDefault("Baurecht", 0L) >= 2 ? "PARTIAL" : "INSUFFICIENT");
        domainCoverage.put("HR",
                byDomain.getOrDefault("Personalrecht", 0L) >= 5 ? "FULL" :
                byDomain.getOrDefault("Personalrecht", 0L) >= 2 ? "PARTIAL" : "INSUFFICIENT");

        // Identify questions that can't be answered due to missing corpus
        var manifestTitles = all.stream()
                .map(m -> m.getTitle() != null ? m.getTitle().toLowerCase() : "")
                .collect(Collectors.toSet());

        List<BenchmarkQuestion> unanswered = new ArrayList<>();
        for (var q : questions) {
            if (q.expectedStrategy() == com.cognitera.platform.ai.model.DecisionStrategy.RULE_ENGINE) {
                continue; // RuleEngine questions don't need corpus
            }
            // Check if any manifest entry covers this question's domain
            String domain = switch (q.category()) {
                case "Procurement" -> "Vergaberecht";
                case "Building" -> "Baurecht";
                case "Retrieval" -> "Vergaberecht"; // mixed retrieval questions
                default -> null;
            };
            if (domain == null) continue;
            long count = byDomain.getOrDefault(domain, 0L);
            if (count == 0) {
                unanswered.add(q);
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("# Release Corpus Report\n\n");
        sb.append("> Auto-generated: ").append(LocalDate.now().format(DATE_FMT)).append("\n\n");
        sb.append("---\n\n");

        // Domain coverage
        sb.append("## Domain Coverage\n\n");
        sb.append("| Domain | Documents in Corpus | Benchmark Questions | Coverage Status |\n");
        sb.append("|---|---|---|---|\n");
        for (String domain : List.of("Procurement", "Building", "Salary", "Travel", "Retrieval")) {
            String mappedDomain = switch (domain) {
                case "Procurement" -> "Vergaberecht";
                case "Building" -> "Baurecht";
                case "Salary", "Travel" -> "Personalrecht";
                case "Retrieval" -> "Vergaberecht";
                default -> domain;
            };
            long count = byDomain.getOrDefault(mappedDomain, 0L);
            int questionCount = questionsByCategory.getOrDefault(domain, List.of()).size();
            String status = domainCoverage.getOrDefault(domain,
                    count >= 5 ? "FULL" : count >= 2 ? "PARTIAL" : "INSUFFICIENT");
            sb.append("| ").append(domain).append(" | ").append(count)
                    .append(" | ").append(questionCount)
                    .append(" | ").append(status).append(" |\n");
        }
        sb.append("\n");

        // Domains with insufficient evidence
        sb.append("## Domains with Insufficient Evidence\n\n");
        var insufficient = domainCoverage.entrySet().stream()
                .filter(e -> "INSUFFICIENT".equals(e.getValue()) || "PARTIAL".equals(e.getValue()))
                .toList();
        if (insufficient.isEmpty()) {
            sb.append("All domains have sufficient corpus coverage.\n\n");
        } else {
            for (var entry : insufficient) {
                String recommendations = switch (entry.getKey()) {
                    case "Building" -> "Ingest BauO Bln (Brandschutz, §61, §63), BauVorlV 2025, BauNVO";
                    case "Procurement" -> "Ingest BerlAVG §7, AV §55 LHO full text, VgV, GWB";
                    case "HR" -> "Ingest TV-L Entgeltordnung, UrlVO Bln, LRKG Berlin";
                    default -> "Ingest relevant regulations";
                };
                sb.append("- **").append(entry.getKey()).append("**: Status ").append(entry.getValue())
                        .append(" — ").append(recommendations).append("\n");
            }
            sb.append("\n");
        }

        // Unanswerable benchmark questions
        sb.append("## Benchmark Questions Requiring Corpus Completion\n\n");
        if (unanswered.isEmpty()) {
            sb.append("All HYBRID_RETRIEVAL benchmark questions have corpus coverage.\n\n");
        } else {
            sb.append("| ID | Question | Domain | Missing Document |\n");
            sb.append("|---|---|---|---|\n");
            for (var q : unanswered) {
                String missing = switch (q.id()) {
                    case "BUILD-001" -> "BauO Bln (Einfamilienhaus)";
                    case "BUILD-002" -> "BauO Bln §6 (Abstandsflächen)";
                    case "BUILD-003" -> "BauO Bln §61 (Genehmigungsfreie Vorhaben)";
                    case "BUILD-004" -> "BauVorlV 2025";
                    case "BUILD-005" -> "BauO Bln §63 (Nutzungsänderung)";
                    case "BUILD-006" -> "BauO Bln §§ 27-36 (Brandschutz)";
                    case "RETR-001" -> "BerlAVG §7 + AV Umwelt";
                    case "RETR-002" -> "Beschaffungsordnung Berlin";
                    case "RETR-003" -> "VgV §§ 15-17";
                    case "RETR-004" -> "UrlVO Bln";
                    default -> "See corpus recommendation";
                };
                sb.append("| ").append(q.id()).append(" | ").append(q.question()).append(" | ")
                        .append(q.category()).append(" | ").append(missing).append(" |\n");
            }
            sb.append("\n");
        }

        // RULE_ENGINE questions (always answerable)
        sb.append("## RULE_ENGINE Coverage\n\n");
        long ruleEngineCount = questions.stream()
                .filter(q -> q.expectedStrategy() == com.cognitera.platform.ai.model.DecisionStrategy.RULE_ENGINE)
                .count();
        sb.append(ruleEngineCount).append(" benchmark questions use RULE_ENGINE strategy ")
                .append("(no corpus required). These are always answerable as long as the ")
                .append("structured knowledge tables are correct.\n\n");

        // Manifest summary
        sb.append("## Corpus Manifest Summary\n\n");
        sb.append("| Metric | Value |\n");
        sb.append("|---|---|\n");
        sb.append("| Total entries | ").append(summary.totalEntries()).append(" |\n");
        sb.append("| Fully embedded | ").append(summary.fullyEmbedded()).append(" |\n");
        sb.append("| Fully indexed | ").append(summary.fullyIndexed()).append(" |\n");
        sb.append("| Total chunks | ").append(summary.totalChunks()).append(" |\n");
        sb.append("| Total vectors | ").append(summary.totalVectors()).append(" |\n\n");

        String report = sb.toString();
        writeToFile(DOCS_DIR.resolve("RELEASE_CORPUS_REPORT.md"), report);
        return report;
    }

    private void writeToFile(Path path, String content) {
        try {
            Files.createDirectories(path.getParent());
            Files.writeString(path, content, StandardCharsets.UTF_8);
            log.info("Report written: {}", path);
        } catch (IOException e) {
            log.error("Failed to write report {}: {}", path, e.getMessage());
        }
    }
}
