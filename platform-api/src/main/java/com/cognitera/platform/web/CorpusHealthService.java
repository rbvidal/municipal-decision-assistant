package com.cognitera.platform.web;

import com.cognitera.platform.document.infrastructure.persistence.DocumentEntity;
import com.cognitera.platform.document.infrastructure.persistence.JpaDocumentEntityRepository;
import com.cognitera.platform.search.application.qdrant.QdrantProperties;
import com.cognitera.platform.search.infrastructure.persistence.DocumentChunkEntity;
import com.cognitera.platform.search.infrastructure.persistence.JpaDocumentChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Inspects the document corpus, chunk store, and Qdrant vector index to produce
 * an immutable health report. Uses the Corpus Manifest for extended health checks.
 */
@Service
public class CorpusHealthService {

    private static final Logger log = LoggerFactory.getLogger(CorpusHealthService.class);

    private final JpaDocumentEntityRepository documentRepo;
    private final JpaDocumentChunkRepository chunkRepo;
    private final RestClient qdrantClient;
    private final QdrantProperties qdrantProps;
    private final CorpusManifestService manifestService;

    private static final Set<String> REQUIRED_METADATA_KEYS = Set.of(
            "title", "category", "source", "document_type");

    public CorpusHealthService(JpaDocumentEntityRepository documentRepo,
                               JpaDocumentChunkRepository chunkRepo,
                               QdrantProperties qdrantProps,
                               CorpusManifestService manifestService) {
        this.documentRepo = documentRepo;
        this.chunkRepo = chunkRepo;
        this.qdrantProps = qdrantProps;
        this.manifestService = manifestService;
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.qdrantClient = RestClient.builder()
                .baseUrl(qdrantProps.baseUrl())
                .requestFactory(new JdkClientHttpRequestFactory(httpClient))
                .build();
    }

    /** Produces a complete health report of the document corpus and vector index. */
    public CorpusHealthReport generateReport() {
        List<DocumentEntity> docs = documentRepo.findAll();
        List<DocumentHealth> docHealths = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        int totalChunks = 0;
        int totalEmbedded = 0;
        int totalMissingEmbeddings = 0;

        int totalQdrantVectors = queryQdrantTotalCount();
        int qdrantVectorDim = queryQdrantVectorDimension();

        if (totalQdrantVectors < 0) {
            warnings.add("Qdrant nicht erreichbar — Vektorstatistiken nicht verfügbar.");
        }

        for (DocumentEntity doc : docs) {
            List<DocumentChunkEntity> chunks = chunkRepo.findByDocumentIdOrderByChunkIndex(doc.getId());

            int chunkCount = chunks.size();
            int embeddedCount = (int) chunks.stream()
                    .filter(c -> c.getEmbeddingReference() != null && !c.getEmbeddingReference().isBlank())
                    .count();
            int missingEmbed = chunkCount - embeddedCount;

            totalChunks += chunkCount;
            totalEmbedded += embeddedCount;
            totalMissingEmbeddings += missingEmbed;

            int qdrantVecCount = queryQdrantCountForDocument(doc.getId());
            boolean indexed = qdrantVecCount > 0;

            String docWarnings = buildDocumentWarnings(doc, chunks, embeddedCount, indexed);
            if (!docWarnings.isEmpty()) {
                warnings.add(doc.getTitle() + ": " + docWarnings);
            }

            docHealths.add(new DocumentHealth(
                    doc.getTitle() != null ? doc.getTitle() : "Unbekannt",
                    deriveLegalDomain(doc.getCategory()),
                    deriveAuthority(doc.getCategory()),
                    doc.getCategory() != null ? doc.getCategory() : "—",
                    doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : "—",
                    detectLanguage(chunks),
                    estimatePageCount(chunks),
                    chunkCount,
                    embeddedCount,
                    missingEmbed,
                    indexed,
                    indexed ? qdrantVecCount : 0,
                    qdrantVectorDim,
                    computeMetadataCompleteness(doc),
                    computeLastIndexingTime(chunks),
                    classifyHealth(chunkCount, embeddedCount, indexed)
            ));
        }

        double embeddingCoverage = totalChunks > 0
                ? 100.0 * totalEmbedded / totalChunks : 0.0;
        double avgChunksPerDoc = docs.isEmpty() ? 0.0
                : (double) totalChunks / docs.size();

        var summary = new CorpusHealthSummary(
                docs.size(),
                totalChunks,
                totalEmbedded,
                totalMissingEmbeddings,
                Math.max(totalQdrantVectors, 0),
                embeddingCoverage,
                avgChunksPerDoc,
                "N/A",
                qdrantVectorDim
        );

        // ── Extended health categories from manifest ──
        var missingDocs = titlesOf(manifestService.findMissingDocuments());
        var outdatedDocs = titlesOf(manifestService.findOutdatedDocuments());
        var duplicateGroups = manifestService.findDuplicates();
        List<String> duplicateDocTitles = new ArrayList<>();
        for (var entry : duplicateGroups.entrySet()) {
            duplicateDocTitles.add(entry.getKey() + " (" + entry.getValue().size() + "x)");
        }
        duplicateDocTitles.sort(String::compareTo);

        var withoutEmb = titlesOf(manifestService.findWithoutEmbeddings());
        var withoutVec = titlesOf(manifestService.findWithoutVectors());
        var failedExtract = titlesOf(manifestService.findFailedExtraction());
        var failedIndex = titlesOf(manifestService.findFailedIndexing());
        var lowText = titlesOf(manifestService.findLowTextLength());
        var singleChunk = titlesOf(manifestService.findSingleChunkDocuments());

        var categories = List.of(
                new HealthCategory("missingDocs", "Fehlende Dokumente (im Manifest aber nicht in DB)",
                        missingDocs.size(), missingDocs, missingDocs.isEmpty() ? "green" : "red"),
                new HealthCategory("outdatedDocs", "Veraltete Dokumente (neue Version verfügbar)",
                        outdatedDocs.size(), outdatedDocs, outdatedDocs.isEmpty() ? "green" : "yellow"),
                new HealthCategory("duplicateDocs", "Doppelte Dokumente (gleicher Titel)",
                        duplicateDocTitles.size(), duplicateDocTitles, duplicateDocTitles.isEmpty() ? "green" : "yellow"),
                new HealthCategory("withoutEmbeddings", "Dokumente ohne Embeddings",
                        withoutEmb.size(), withoutEmb, withoutEmb.isEmpty() ? "green" : "red"),
                new HealthCategory("withoutVectors", "Dokumente ohne Qdrant-Vektoren",
                        withoutVec.size(), withoutVec, withoutVec.isEmpty() ? "green" : "red"),
                new HealthCategory("failedExtraction", "Dokumente mit fehlgeschlagener Textextraktion",
                        failedExtract.size(), failedExtract, failedExtract.isEmpty() ? "green" : "red"),
                new HealthCategory("failedIndexing", "Dokumente mit fehlgeschlagener Indexierung",
                        failedIndex.size(), failedIndex, failedIndex.isEmpty() ? "green" : "red"),
                new HealthCategory("lowTextLength", "Dokumente mit auffällig wenig Text (<100 Zeichen)",
                        lowText.size(), lowText, lowText.isEmpty() ? "green" : "yellow"),
                new HealthCategory("singleChunk", "Dokumente mit nur einem Chunk",
                        singleChunk.size(), singleChunk, singleChunk.size() <= 3 ? "green" : "yellow")
        );

        log.info("Corpus Health: {} docs, {} chunks, {} embedded ({}%), {} Qdrant vectors, {} warnings, {} manifest categories checked",
                summary.documentCount(), summary.chunkCount(), summary.embeddedChunks(),
                String.format("%.1f", summary.embeddingCoveragePct()),
                summary.qdrantVectors(), warnings.size(), categories.size());

        return new CorpusHealthReport(summary, List.copyOf(docHealths), List.copyOf(warnings), categories);
    }

    private static List<String> titlesOf(List<CorpusManifestEntity> entries) {
        return entries.stream()
                .sorted(Comparator.comparing(e -> e.getTitle() != null ? e.getTitle() : ""))
                .map(CorpusManifestEntity::getTitle)
                .toList();
    }

    // ── Qdrant queries ──

    private int queryQdrantTotalCount() {
        try {
            var response = qdrantClient.post()
                    .uri("/collections/{collection}/points/count", qdrantProps.collection())
                    .body(Map.of())
                    .retrieve()
                    .body(Map.class);
            if (response != null && response.get("result") instanceof Map<?, ?> result) {
                Object count = result.get("count");
                return count instanceof Number n ? n.intValue() : -1;
            }
        } catch (Exception e) {
            log.warn("Qdrant total count failed: {}", e.getMessage());
        }
        return -1;
    }

    private int queryQdrantCountForDocument(java.util.UUID documentId) {
        try {
            Map<String, Object> filter = Map.of(
                    "must", List.of(
                            Map.of("key", "documentId",
                                    "match", Map.of("value", documentId.toString()))
                    )
            );
            var response = qdrantClient.post()
                    .uri("/collections/{collection}/points/count", qdrantProps.collection())
                    .body(Map.of("filter", filter))
                    .retrieve()
                    .body(Map.class);
            if (response != null && response.get("result") instanceof Map<?, ?> result) {
                Object count = result.get("count");
                return count instanceof Number n ? n.intValue() : 0;
            }
        } catch (Exception e) {
            log.debug("Qdrant count for doc {} failed: {}", documentId, e.getMessage());
        }
        return 0;
    }

    private int queryQdrantVectorDimension() {
        try {
            var response = qdrantClient.get()
                    .uri("/collections/{collection}", qdrantProps.collection())
                    .retrieve()
                    .body(Map.class);
            if (response != null && response.get("result") instanceof Map<?, ?> result) {
                if (result.get("config") instanceof Map<?, ?> config) {
                    if (config.get("params") instanceof Map<?, ?> params) {
                        if (params.get("vectors") instanceof Map<?, ?> vectors) {
                            Object size = vectors.get("size");
                            return size instanceof Number n ? n.intValue() : 0;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Qdrant collection info failed: {}", e.getMessage());
        }
        return 0;
    }

    // ── Document-specific helpers ──

    private String buildDocumentWarnings(DocumentEntity doc, List<DocumentChunkEntity> chunks,
                                          int embeddedCount, boolean indexed) {
        List<String> w = new ArrayList<>();
        if (chunks.isEmpty()) {
            w.add("Keine Chunks vorhanden");
        } else if (embeddedCount == 0) {
            w.add("0 Vektoren — keine Embeddings generiert");
        } else if (embeddedCount < chunks.size()) {
            w.add(embeddedCount + "/" + chunks.size() + " Chunks mit Embeddings");
        }
        if (!chunks.isEmpty() && embeddedCount > 0 && !indexed) {
            w.add("Chunks haben Embeddings, sind aber nicht in Qdrant indexiert");
        }
        if ((doc.getCategory() == null || doc.getCategory().isBlank())
                && (doc.getTags() == null || doc.getTags().isEmpty())) {
            w.add("Fehlende Metadaten (Kategorie und Tags)");
        }
        return String.join("; ", w);
    }

    private String deriveLegalDomain(String category) {
        if (category == null) return "Allgemein";
        return switch (category) {
            case "procurement-regulations", "internal-procedures", "manuals" -> "Vergaberecht";
            case "building-regulations", "procedures", "forms", "citizen-information" -> "Baurecht";
            case "hr-regulations" -> "Personalrecht";
            default -> category;
        };
    }

    private String deriveAuthority(String category) {
        if (category == null) return "—";
        if (category.startsWith("procurement") || category.equals("internal-procedures")
                || category.equals("manuals"))
            return "Senatsverwaltung für Finanzen";
        if (category.startsWith("building") || category.equals("procedures")
                || category.equals("forms") || category.equals("citizen-information"))
            return "Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen";
        if (category.startsWith("hr"))
            return "Senatsverwaltung für Inneres und Sport";
        return "—";
    }

    private String detectLanguage(List<DocumentChunkEntity> chunks) {
        if (chunks.isEmpty()) return "—";
        String text = chunks.get(0).getText();
        if (text == null) return "—";
        long germanSignals = text.toLowerCase().chars()
                .filter(c -> c == 'ä' || c == 'ö' || c == 'ü' || c == 'ß').count();
        return germanSignals > 0 ? "DE" : "EN";
    }

    private int estimatePageCount(List<DocumentChunkEntity> chunks) {
        return chunks.stream()
                .map(DocumentChunkEntity::getPageNumber)
                .filter(p -> p != null)
                .max(Integer::compareTo)
                .orElse(0);
    }

    private double computeMetadataCompleteness(DocumentEntity doc) {
        int present = 0;
        if (doc.getTitle() != null && !doc.getTitle().isBlank()) present++;
        if (doc.getCategory() != null && !doc.getCategory().isBlank()) present++;
        if (doc.getTags() != null && !doc.getTags().isEmpty()) present++;
        if (doc.getType() != null) present++;
        if (doc.getCreatedAt() != null) present++;
        return 100.0 * present / 5.0;
    }

    private String computeLastIndexingTime(List<DocumentChunkEntity> chunks) {
        return chunks.stream()
                .map(DocumentChunkEntity::getUpdatedAt)
                .filter(t -> t != null)
                .max(Instant::compareTo)
                .map(Instant::toString)
                .orElse("—");
    }

    private HealthStatus classifyHealth(int chunks, int embedded, boolean indexed) {
        if (chunks == 0) return HealthStatus.RED;
        if (embedded == 0 || !indexed) return HealthStatus.YELLOW;
        if (embedded < chunks) return HealthStatus.YELLOW;
        return HealthStatus.GREEN;
    }

    // ── Immutable data model ──

    public enum HealthStatus { GREEN, YELLOW, RED }

    public record DocumentHealth(
            String title,
            String legalDomain,
            String authority,
            String category,
            String uploadDate,
            String language,
            int pageCount,
            int chunkCount,
            int chunksWithEmbeddings,
            int chunksWithoutEmbeddings,
            boolean indexedInQdrant,
            int vectorCount,
            int averageVectorDimension,
            double metadataCompleteness,
            String lastIndexingTime,
            HealthStatus status
    ) {}

    public record CorpusHealthSummary(
            int documentCount,
            int chunkCount,
            int embeddedChunks,
            int missingEmbeddings,
            int qdrantVectors,
            double embeddingCoveragePct,
            double avgChunksPerDocument,
            String avgRetrievalScore,
            int qdrantVectorDimension
    ) {}

    /** A named category of health items, e.g. "Documents without embeddings". */
    public record HealthCategory(
            String key,
            String label,
            int count,
            List<String> items,
            String statusClass  // "green", "yellow", "red"
    ) {}

    public record CorpusHealthReport(
            CorpusHealthSummary summary,
            List<DocumentHealth> documents,
            List<String> warnings,
            List<HealthCategory> healthCategories
    ) {}
}
