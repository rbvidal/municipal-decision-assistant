package com.cognitera.platform.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled background job that monitors corpus health.
 *
 * <p>Runs every hour. Checks:
 * <ul>
 *   <li>Embedding coverage rate (alerts if below 90%)</li>
 *   <li>Missing Qdrant vectors (alerts if any documents are indexed but
 *       lack vector representations)</li>
 *   <li>Documents without embeddings</li>
 *   <li>Failed extraction or indexing jobs that may need attention</li>
 * </ul>
 */
@Component
public class CorpusHealthAlertScheduler {

    private static final Logger log = LoggerFactory.getLogger(CorpusHealthAlertScheduler.class);

    private final CorpusHealthService healthService;
    private final CorpusManifestService manifestService;

    public CorpusHealthAlertScheduler(CorpusHealthService healthService,
                                       CorpusManifestService manifestService) {
        this.healthService = healthService;
        this.manifestService = manifestService;
    }

    /**
     * Runs every hour (at minute 7 past the hour, to spread load).
     * Checks coverage metrics and logs warnings for any issues found.
     */
    @Scheduled(cron = "0 7 * * * *")
    public void checkCorpusHealth() {
        log.info("Scheduled corpus health check starting...");
        int warnings = 0;

        try {
            // ── Coverage check ──
            var report = healthService.generateReport();
            var summary = report.summary();
            double coverage = summary.embeddingCoveragePct();
            long embeddedDocs = report.documents().stream()
                    .filter(d -> d.chunksWithEmbeddings() > 0).count();
            log.info("Corpus health: {}% embedding coverage ({} of {} documents with embeddings)",
                    String.format("%.1f", coverage),
                    embeddedDocs, summary.documentCount());

            if (coverage < 90.0) {
                log.warn("HEALTH ALERT: Embedding coverage is {}% — below 90% threshold. "
                        + "{} chunks lack embeddings.",
                        String.format("%.1f", coverage), summary.missingEmbeddings());
                warnings++;
            }

            // ── Missing vectors: documents with embeddings but no Qdrant vectors ──
            long missingVectors = report.documents().stream()
                    .filter(d -> d.chunksWithEmbeddings() > 0 && d.vectorCount() == 0).count();
            if (missingVectors > 0) {
                log.warn("HEALTH ALERT: {} documents are Qdrant-indexed but have no vectors. "
                        + "Consider reindexing affected documents.", missingVectors);
                warnings++;
            }

            // ── Health categories check ──
            var categories = report.healthCategories() != null
                    ? report.healthCategories() : java.util.Collections.<CorpusHealthService.HealthCategory>emptyList();
            int withoutEmbeddings = 0, withoutVectors = 0, failedExtraction = 0, failedIndexing = 0;
            String embeddingIds = "", vectorIds = "";
            for (CorpusHealthService.HealthCategory cat : categories) {
                int count = cat.count();
                java.util.List<String> ids = cat.items() != null
                        ? cat.items() : java.util.Collections.emptyList();
                if ("withoutEmbeddings".equals(cat.key())) {
                    withoutEmbeddings = count;
                    embeddingIds = String.join(", ", ids.stream().limit(5).toList());
                } else if ("withoutVectors".equals(cat.key())) {
                    withoutVectors = count;
                    vectorIds = String.join(", ", ids.stream().limit(5).toList());
                } else if ("failedExtraction".equals(cat.key())) {
                    failedExtraction = count;
                } else if ("failedIndexing".equals(cat.key())) {
                    failedIndexing = count;
                }
            }

            if (withoutEmbeddings > 0) {
                log.warn("HEALTH ALERT: {} documents without embeddings: {}", withoutEmbeddings, embeddingIds);
                warnings++;
            }
            if (withoutVectors > 0) {
                log.warn("HEALTH ALERT: {} documents without Qdrant vectors: {}", withoutVectors, vectorIds);
                warnings++;
            }
            if (failedExtraction > 0) {
                log.warn("HEALTH ALERT: {} documents had text extraction failures", failedExtraction);
                warnings++;
            }
            if (failedIndexing > 0) {
                log.warn("HEALTH ALERT: {} documents had indexing failures", failedIndexing);
                warnings++;
            }

            // ── Manifest checks ──
            try {
                var missingDocs = manifestService.findMissingDocuments();
                if (!missingDocs.isEmpty()) {
                    log.warn("HEALTH ALERT: {} manifest entries have no matching document",
                            missingDocs.size());
                    warnings++;
                }
                var outdated = manifestService.findOutdatedDocuments();
                if (!outdated.isEmpty()) {
                    log.info("Corpus health: {} manifest entries may be outdated", outdated.size());
                }
                var duplicates = manifestService.findDuplicates();
                if (!duplicates.isEmpty()) {
                    log.warn("HEALTH ALERT: {} potential duplicate documents detected", duplicates.size());
                    warnings++;
                }
            } catch (Exception e) {
                log.debug("Manifest health check skipped — manifest may not be loaded: {}",
                        e.getMessage());
            }

        } catch (Exception e) {
            log.error("Scheduled corpus health check failed", e);
            return;
        }

        if (warnings == 0) {
            log.info("Scheduled corpus health check complete — all metrics healthy.");
        } else {
            log.warn("Scheduled corpus health check complete — {} warning(s) found.", warnings);
        }
    }
}
