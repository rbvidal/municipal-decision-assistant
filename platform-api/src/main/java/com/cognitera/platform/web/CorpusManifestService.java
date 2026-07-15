package com.cognitera.platform.web;

import com.cognitera.platform.document.infrastructure.persistence.DocumentEntity;
import com.cognitera.platform.document.infrastructure.persistence.JpaDocumentEntityRepository;
import com.cognitera.platform.search.infrastructure.persistence.DocumentChunkEntity;
import com.cognitera.platform.search.infrastructure.persistence.JpaDocumentChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Maintains the corpus manifest — one logical record per legal source.
 * A manifest entry may reference a stored {@code DocumentEntity} or exist
 * independently for documents not yet ingested.
 */
@Service
public class CorpusManifestService {

    private static final Logger log = LoggerFactory.getLogger(CorpusManifestService.class);

    private final JpaCorpusManifestRepository manifestRepo;
    private final JpaDocumentEntityRepository documentRepo;
    private final JpaDocumentChunkRepository chunkRepo;

    public CorpusManifestService(JpaCorpusManifestRepository manifestRepo,
                                 JpaDocumentEntityRepository documentRepo,
                                 JpaDocumentChunkRepository chunkRepo) {
        this.manifestRepo = manifestRepo;
        this.documentRepo = documentRepo;
        this.chunkRepo = chunkRepo;
    }

    // ── CRUD ──

    @Transactional
    public CorpusManifestEntity register(CorpusManifestEntity entry) {
        return manifestRepo.save(entry);
    }

    @Transactional(readOnly = true)
    public Optional<CorpusManifestEntity> findById(UUID id) {
        return manifestRepo.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<CorpusManifestEntity> findByDocumentId(UUID documentId) {
        return manifestRepo.findByDocumentId(documentId);
    }

    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findAll() {
        return manifestRepo.findAll();
    }

    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findByDomain(String domain) {
        return manifestRepo.findByLegalDomain(domain);
    }

    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findByPriority(String priority) {
        return manifestRepo.findByPriority(priority);
    }

    @Transactional
    public void deleteById(UUID id) {
        manifestRepo.deleteById(id);
    }

    // ── Sync from documents ──

    /**
     * Scans the existing document table and creates manifest entries for any
     * documents that do not already have one. Existing entries are refreshed
     * with current chunk/vector metrics.
     *
     * @return summary of changes
     */
    @Transactional
    public SyncResult syncFromDocuments() {
        List<DocumentEntity> docs = documentRepo.findAll();
        int created = 0;
        int updated = 0;

        for (DocumentEntity doc : docs) {
            Optional<CorpusManifestEntity> existing = manifestRepo.findByDocumentId(doc.getId());
            List<DocumentChunkEntity> chunks = chunkRepo.findByDocumentIdOrderByChunkIndex(doc.getId());
            long extractedChars = chunks.stream()
                    .map(DocumentChunkEntity::getText)
                    .filter(t -> t != null)
                    .mapToLong(String::length)
                    .sum();
            int embeddedChunks = (int) chunks.stream()
                    .filter(c -> c.getEmbeddingReference() != null && !c.getEmbeddingReference().isBlank())
                    .count();

            if (existing.isPresent()) {
                CorpusManifestEntity m = existing.get();
                refreshMetrics(m, chunks, extractedChars, embeddedChunks);
                manifestRepo.save(m);
                updated++;
            } else {
                CorpusManifestEntity m = createFromDocument(doc, chunks, extractedChars, embeddedChunks);
                manifestRepo.save(m);
                created++;
            }
        }

        log.info("Manifest sync: {} created, {} updated", created, updated);
        return new SyncResult(created, updated);
    }

    private void refreshMetrics(CorpusManifestEntity m, List<DocumentChunkEntity> chunks,
                                long extractedChars, int embeddedChunks) {
        m.setChunkCount(chunks.size());
        m.setExtractedChars(extractedChars);
        m.setVectorCount(embeddedChunks);
        m.setPageCount(chunks.stream()
                .map(DocumentChunkEntity::getPageNumber)
                .filter(p -> p != null)
                .max(Integer::compareTo)
                .orElse(0));
        m.setUploadStatus(CorpusManifestEntity.UploadStatus.UPLOADED);
        if (chunks.isEmpty()) {
            m.setIngestionStatus(CorpusManifestEntity.IngestionStatus.PENDING);
            m.setIndexingStatus(CorpusManifestEntity.IndexingStatus.NOT_INDEXED);
            m.setEmbeddingStatus(CorpusManifestEntity.EmbeddingStatus.NOT_EMBEDDED);
        } else if (embeddedChunks == 0) {
            m.setIngestionStatus(CorpusManifestEntity.IngestionStatus.COMPLETED);
            m.setIndexingStatus(CorpusManifestEntity.IndexingStatus.NOT_INDEXED);
            m.setEmbeddingStatus(CorpusManifestEntity.EmbeddingStatus.NOT_EMBEDDED);
        } else if (embeddedChunks == chunks.size()) {
            m.setIngestionStatus(CorpusManifestEntity.IngestionStatus.COMPLETED);
            m.setIndexingStatus(CorpusManifestEntity.IndexingStatus.INDEXED);
            m.setEmbeddingStatus(CorpusManifestEntity.EmbeddingStatus.EMBEDDED);
        } else {
            m.setIngestionStatus(CorpusManifestEntity.IngestionStatus.COMPLETED);
            m.setIndexingStatus(CorpusManifestEntity.IndexingStatus.INDEXED);
            m.setEmbeddingStatus(CorpusManifestEntity.EmbeddingStatus.PARTIAL);
        }
    }

    private CorpusManifestEntity createFromDocument(DocumentEntity doc,
            List<DocumentChunkEntity> chunks, long extractedChars, int embeddedChunks) {
        var m = new CorpusManifestEntity();
        m.setId(UUID.randomUUID());
        m.setDocumentId(doc.getId());
        m.setTitle(doc.getTitle() != null ? doc.getTitle() : "Unbekannt");
        m.setShortName(doc.getTitle() != null ? doc.getTitle() : "Unbekannt");
        m.setLegalDomain(deriveLegalDomain(doc.getCategory()));
        m.setJurisdiction("Berlin");
        m.setAuthority(deriveAuthority(doc.getCategory()));
        m.setDocType(deriveDocumentType(doc.getCategory()));
        m.setLanguage("DE");
        m.setFileFormat(doc.getType() != null ? doc.getType().name() : "TXT");
        if (doc.getCreatedAt() != null) {
            m.setPublicationDate(doc.getCreatedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate());
        }

        refreshMetrics(m, chunks, extractedChars, embeddedChunks);

        if (!doc.getVersions().isEmpty()) {
            var latestVersion = doc.getVersions().get(doc.getVersions().size() - 1);
            m.setLocalFilename(latestVersion.getFileName());
            m.setChecksumSha256(latestVersion.getChecksumSha256());
        }

        m.setPriority("P2"); // default for existing demo documents
        return m;
    }

    // ── Health queries ──

    /** Documents in the manifest that have no corresponding DocumentEntity. */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findMissingDocuments() {
        List<CorpusManifestEntity> all = manifestRepo.findAll();
        return all.stream()
                .filter(m -> m.getDocumentId() == null || documentRepo.findById(m.getDocumentId()).isEmpty())
                .toList();
    }

    /** Documents where the manifest has a newer version than what's stored. */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findOutdatedDocuments() {
        List<CorpusManifestEntity> all = manifestRepo.findAll();
        List<CorpusManifestEntity> outdated = new ArrayList<>();
        for (var m : all) {
            if (m.getDocumentId() == null) continue;
            var doc = documentRepo.findById(m.getDocumentId());
            if (doc.isEmpty()) continue;
            List<DocumentChunkEntity> chunks = chunkRepo.findByDocumentIdOrderByChunkIndex(m.getDocumentId());
            int embedded = (int) chunks.stream()
                    .filter(c -> c.getEmbeddingReference() != null && !c.getEmbeddingReference().isBlank())
                    .count();
            if (m.getLastAmendmentDate() != null
                    && doc.get().getUpdatedAt() != null
                    && m.getLastAmendmentDate().isAfter(
                            doc.get().getUpdatedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate())) {
                outdated.add(m);
            }
        }
        return outdated;
    }

    /** Duplicate documents (same title, different manifest IDs). */
    @Transactional(readOnly = true)
    public Map<String, List<CorpusManifestEntity>> findDuplicates() {
        List<CorpusManifestEntity> all = manifestRepo.findAll();
        Map<String, List<CorpusManifestEntity>> byTitle = new LinkedHashMap<>();
        for (var m : all) {
            String key = m.getTitle() != null ? m.getTitle().toLowerCase().trim() : "";
            byTitle.computeIfAbsent(key, k -> new ArrayList<>()).add(m);
        }
        Map<String, List<CorpusManifestEntity>> duplicates = new LinkedHashMap<>();
        for (var entry : byTitle.entrySet()) {
            if (entry.getValue().size() > 1) {
                duplicates.put(entry.getKey(), entry.getValue());
            }
        }
        return duplicates;
    }

    /** Documents without embeddings. */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findWithoutEmbeddings() {
        return manifestRepo.findByEmbeddingStatus(CorpusManifestEntity.EmbeddingStatus.NOT_EMBEDDED);
    }

    /** Documents without vectors (indexed in Qdrant). */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findWithoutVectors() {
        return manifestRepo.findByIndexingStatus(CorpusManifestEntity.IndexingStatus.NOT_INDEXED);
    }

    /** Documents that failed extraction (have zero chunks despite being uploaded). */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findFailedExtraction() {
        List<CorpusManifestEntity> all = manifestRepo.findAll();
        return all.stream()
                .filter(m -> m.getUploadStatus() == CorpusManifestEntity.UploadStatus.UPLOADED
                        && m.getChunkCount() == 0)
                .toList();
    }

    /** Documents that failed indexing. */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findFailedIndexing() {
        return manifestRepo.findByIndexingStatus(CorpusManifestEntity.IndexingStatus.FAILED);
    }

    /** Documents with suspiciously low text length (under 100 characters). */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findLowTextLength() {
        List<CorpusManifestEntity> all = manifestRepo.findAll();
        return all.stream()
                .filter(m -> m.getChunkCount() > 0 && m.getExtractedChars() < 100)
                .toList();
    }

    /** Documents with only one chunk (likely under-chunked). */
    @Transactional(readOnly = true)
    public List<CorpusManifestEntity> findSingleChunkDocuments() {
        List<CorpusManifestEntity> all = manifestRepo.findAll();
        return all.stream()
                .filter(m -> m.getChunkCount() == 1)
                .toList();
    }

    // ── Summary ──

    @Transactional(readOnly = true)
    public ManifestSummary getSummary() {
        List<CorpusManifestEntity> all = manifestRepo.findAll();
        int total = all.size();
        int withDocuments = (int) all.stream().filter(m -> m.getDocumentId() != null).count();
        int fullyEmbedded = (int) all.stream()
                .filter(m -> m.getEmbeddingStatus() == CorpusManifestEntity.EmbeddingStatus.EMBEDDED).count();
        int fullyIndexed = (int) all.stream()
                .filter(m -> m.getIndexingStatus() == CorpusManifestEntity.IndexingStatus.INDEXED).count();
        long totalChunks = all.stream().mapToLong(CorpusManifestEntity::getChunkCount).sum();
        long totalVectors = all.stream().mapToLong(CorpusManifestEntity::getVectorCount).sum();

        Map<String, Long> byDomain = all.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getLegalDomain() != null ? m.getLegalDomain() : "Unbekannt",
                        Collectors.counting()));

        Map<String, Long> byPriority = all.stream()
                .collect(Collectors.groupingBy(
                        m -> m.getPriority() != null ? m.getPriority() : "—",
                        Collectors.counting()));

        return new ManifestSummary(total, withDocuments, fullyEmbedded, fullyIndexed,
                totalChunks, totalVectors, byDomain, byPriority);
    }

    // ── Helpers ──

    static String deriveLegalDomain(String category) {
        if (category == null) return "Allgemein";
        return switch (category) {
            case "procurement-regulations", "internal-procedures", "manuals" -> "Vergaberecht";
            case "building-regulations", "procedures", "forms", "citizen-information" -> "Baurecht";
            case "hr-regulations" -> "Personalrecht";
            default -> category;
        };
    }

    static String deriveAuthority(String category) {
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

    static String deriveDocumentType(String category) {
        if (category == null) return "Dokument";
        return switch (category) {
            case "procurement-regulations" -> "Verwaltungsvorschrift";
            case "building-regulations" -> "Gesetz";
            case "hr-regulations" -> "Tarifvertrag";
            case "internal-procedures" -> "Richtlinie";
            case "procedures" -> "Verordnung";
            case "forms" -> "Formular";
            case "manuals" -> "Handbuch";
            case "citizen-information" -> "Bürgerinformation";
            default -> "Dokument";
        };
    }

    // ── Records ──

    public record SyncResult(int created, int updated) {}

    public record ManifestSummary(
            int totalEntries,
            int withDocuments,
            int fullyEmbedded,
            int fullyIndexed,
            long totalChunks,
            long totalVectors,
            Map<String, Long> byDomain,
            Map<String, Long> byPriority
    ) {}
}
