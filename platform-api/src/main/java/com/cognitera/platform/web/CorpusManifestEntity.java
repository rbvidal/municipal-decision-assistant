package com.cognitera.platform.web;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Logical record for a legal source in the corpus. May reference a stored
 * {@code DocumentEntity} via {@code documentId}, or exist independently for
 * documents that have not yet been ingested.
 */
@Entity
@Table(name = "corpus_manifest")
public class CorpusManifestEntity {

    @Id
    private UUID id;

    @Column(name = "document_id")
    private UUID documentId;

    // ── Identity ──

    @Column(nullable = false)
    private String title;

    @Column(name = "short_name")
    private String shortName;

    @Column(name = "legal_domain")
    private String legalDomain;

    private String jurisdiction;

    private String authority;

    @Column(name = "doc_type")
    private String docType;

    private String language;

    // ── Source ──

    @Column(name = "source_url", length = 1024)
    private String sourceUrl;

    @Column(name = "publication_date")
    private LocalDate publicationDate;

    @Column(name = "last_amendment_date")
    private LocalDate lastAmendmentDate;

    @Column(name = "version_identifier")
    private String versionIdentifier;

    @Column(name = "file_format")
    private String fileFormat;

    @Column(name = "local_filename")
    private String localFilename;

    // ── Status ──

    @Enumerated(EnumType.STRING)
    @Column(name = "upload_status", nullable = false)
    private UploadStatus uploadStatus = UploadStatus.NOT_UPLOADED;

    @Enumerated(EnumType.STRING)
    @Column(name = "ingestion_status", nullable = false)
    private IngestionStatus ingestionStatus = IngestionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "indexing_status", nullable = false)
    private IndexingStatus indexingStatus = IndexingStatus.NOT_INDEXED;

    @Enumerated(EnumType.STRING)
    @Column(name = "embedding_status", nullable = false)
    private EmbeddingStatus embeddingStatus = EmbeddingStatus.NOT_EMBEDDED;

    // ── Metrics ──

    @Column(name = "page_count")
    private int pageCount;

    @Column(name = "extracted_chars")
    private long extractedChars;

    @Column(name = "chunk_count")
    private int chunkCount;

    @Column(name = "vector_count")
    private int vectorCount;

    // ── Tracking ──

    @Column(name = "last_successful_ingestion")
    private Instant lastSuccessfulIngestion;

    @Column(name = "checksum_sha256")
    private String checksumSha256;

    private String priority;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // ── Lifecycle ──

    @PrePersist
    void onCreate() {
        if (id == null) id = UUID.randomUUID();
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    // ── Status enums ──

    public enum UploadStatus { NOT_UPLOADED, UPLOADED, FAILED }

    public enum IngestionStatus { PENDING, INGESTING, COMPLETED, FAILED }

    public enum IndexingStatus { NOT_INDEXED, INDEXED, FAILED }

    public enum EmbeddingStatus { NOT_EMBEDDED, EMBEDDING, EMBEDDED, PARTIAL, FAILED }

    // ── Constructors ──

    public CorpusManifestEntity() {}

    public CorpusManifestEntity(UUID id, UUID documentId, String title, String shortName,
            String legalDomain, String jurisdiction, String authority, String docType,
            String language, String sourceUrl, LocalDate publicationDate,
            LocalDate lastAmendmentDate, String versionIdentifier, String fileFormat,
            String localFilename, String checksumSha256, String priority) {
        this.id = id != null ? id : UUID.randomUUID();
        this.documentId = documentId;
        this.title = title;
        this.shortName = shortName;
        this.legalDomain = legalDomain;
        this.jurisdiction = jurisdiction;
        this.authority = authority;
        this.docType = docType;
        this.language = language;
        this.sourceUrl = sourceUrl;
        this.publicationDate = publicationDate;
        this.lastAmendmentDate = lastAmendmentDate;
        this.versionIdentifier = versionIdentifier;
        this.fileFormat = fileFormat;
        this.localFilename = localFilename;
        this.checksumSha256 = checksumSha256;
        this.priority = priority;
    }

    // ── Getters / setters ──

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getShortName() { return shortName; }
    public void setShortName(String shortName) { this.shortName = shortName; }

    public String getLegalDomain() { return legalDomain; }
    public void setLegalDomain(String legalDomain) { this.legalDomain = legalDomain; }

    public String getJurisdiction() { return jurisdiction; }
    public void setJurisdiction(String jurisdiction) { this.jurisdiction = jurisdiction; }

    public String getAuthority() { return authority; }
    public void setAuthority(String authority) { this.authority = authority; }

    public String getDocType() { return docType; }
    public void setDocType(String docType) { this.docType = docType; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String sourceUrl) { this.sourceUrl = sourceUrl; }

    public LocalDate getPublicationDate() { return publicationDate; }
    public void setPublicationDate(LocalDate publicationDate) { this.publicationDate = publicationDate; }

    public LocalDate getLastAmendmentDate() { return lastAmendmentDate; }
    public void setLastAmendmentDate(LocalDate lastAmendmentDate) { this.lastAmendmentDate = lastAmendmentDate; }

    public String getVersionIdentifier() { return versionIdentifier; }
    public void setVersionIdentifier(String versionIdentifier) { this.versionIdentifier = versionIdentifier; }

    public String getFileFormat() { return fileFormat; }
    public void setFileFormat(String fileFormat) { this.fileFormat = fileFormat; }

    public String getLocalFilename() { return localFilename; }
    public void setLocalFilename(String localFilename) { this.localFilename = localFilename; }

    public UploadStatus getUploadStatus() { return uploadStatus; }
    public void setUploadStatus(UploadStatus uploadStatus) { this.uploadStatus = uploadStatus; }

    public IngestionStatus getIngestionStatus() { return ingestionStatus; }
    public void setIngestionStatus(IngestionStatus ingestionStatus) { this.ingestionStatus = ingestionStatus; }

    public IndexingStatus getIndexingStatus() { return indexingStatus; }
    public void setIndexingStatus(IndexingStatus indexingStatus) { this.indexingStatus = indexingStatus; }

    public EmbeddingStatus getEmbeddingStatus() { return embeddingStatus; }
    public void setEmbeddingStatus(EmbeddingStatus embeddingStatus) { this.embeddingStatus = embeddingStatus; }

    public int getPageCount() { return pageCount; }
    public void setPageCount(int pageCount) { this.pageCount = pageCount; }

    public long getExtractedChars() { return extractedChars; }
    public void setExtractedChars(long extractedChars) { this.extractedChars = extractedChars; }

    public int getChunkCount() { return chunkCount; }
    public void setChunkCount(int chunkCount) { this.chunkCount = chunkCount; }

    public int getVectorCount() { return vectorCount; }
    public void setVectorCount(int vectorCount) { this.vectorCount = vectorCount; }

    public Instant getLastSuccessfulIngestion() { return lastSuccessfulIngestion; }
    public void setLastSuccessfulIngestion(Instant lastSuccessfulIngestion) { this.lastSuccessfulIngestion = lastSuccessfulIngestion; }

    public String getChecksumSha256() { return checksumSha256; }
    public void setChecksumSha256(String checksumSha256) { this.checksumSha256 = checksumSha256; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
