package com.cognitera.platform.api.ingestion;

import com.cognitera.platform.document.infrastructure.persistence.DocumentEntity;
import com.cognitera.platform.document.infrastructure.persistence.DocumentVersionEntity;
import com.cognitera.platform.document.infrastructure.persistence.JpaDocumentEntityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.*;

/**
 * Deterministic duplicate and version detection for document imports.
 * Uses SHA-256 checksums for exact duplicate detection and metadata comparison
 * for version/amendment detection. No vector similarity. No AI.
 */
@Component
public class DuplicateDetector {

    private static final Logger log = LoggerFactory.getLogger(DuplicateDetector.class);

    private final JpaDocumentEntityRepository documentRepo;

    public DuplicateDetector(JpaDocumentEntityRepository documentRepo) {
        this.documentRepo = documentRepo;
    }

    /**
     * Result of duplicate/version check on a candidate file.
     */
    public enum MatchResult {
        /** No match found — safe to import as new document. */
        NEW,
        /** Exact SHA-256 match — this exact file is already in the corpus. */
        EXACT_DUPLICATE,
        /** Same title, different checksum, newer date — this is a newer version. */
        NEWER_VERSION,
        /** Same title, different checksum, older date — this is an older version. */
        OLDER_VERSION,
        /** Same title, different checksum, same date — possible amendment or rename. */
        POSSIBLE_AMENDMENT
    }

    public record MatchInfo(
            MatchResult result,
            UUID existingDocumentId,
            String existingTitle,
            String message
    ) {}

    /**
     * Checks a candidate file against the existing corpus.
     *
     * @param checksumSha256   SHA-256 of the file content
     * @param title            document title from metadata
     * @param publicationDate  publication date from metadata (may be null)
     * @return match information
     */
    public MatchInfo check(String checksumSha256, String title, LocalDate publicationDate) {
        // 1. Exact SHA-256 match — this exact file already exists
        List<DocumentEntity> allDocs = documentRepo.findAll();
        for (DocumentEntity doc : allDocs) {
            for (DocumentVersionEntity ver : doc.getVersions()) {
                if (checksumSha256 != null && checksumSha256.equals(ver.getChecksumSha256())) {
                    return new MatchInfo(MatchResult.EXACT_DUPLICATE, doc.getId(),
                            doc.getTitle(), "Exact SHA-256 match with existing document: " + doc.getTitle());
                }
            }
        }

        // 2. Title match — check for version relationship
        if (title != null && !title.isBlank()) {
            List<DocumentEntity> sameTitle = allDocs.stream()
                    .filter(d -> title.equalsIgnoreCase(
                            d.getTitle() != null ? d.getTitle().trim() : ""))
                    .toList();

            if (!sameTitle.isEmpty()) {
                DocumentEntity existing = sameTitle.getFirst();
                if (publicationDate != null && existing.getCreatedAt() != null) {
                    LocalDate existingDate = existing.getCreatedAt()
                            .atZone(java.time.ZoneOffset.UTC).toLocalDate();
                    if (publicationDate.isAfter(existingDate)) {
                        return new MatchInfo(MatchResult.NEWER_VERSION, existing.getId(),
                                existing.getTitle(),
                                "Newer version detected: candidate date " + publicationDate
                                        + " > existing date " + existingDate);
                    } else if (publicationDate.isBefore(existingDate)) {
                        return new MatchInfo(MatchResult.OLDER_VERSION, existing.getId(),
                                existing.getTitle(),
                                "Older version: candidate date " + publicationDate
                                        + " < existing date " + existingDate);
                    }
                }
                return new MatchInfo(MatchResult.POSSIBLE_AMENDMENT, existing.getId(),
                        existing.getTitle(),
                        "Same title, different content, same or unknown date — possible amendment");
            }
        }

        // 3. No match — new document
        return new MatchInfo(MatchResult.NEW, null, null,
                "No duplicate or version conflict detected");
    }

    /**
     * Computes SHA-256 checksum for byte content.
     */
    public static String computeSha256(byte[] content) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(content);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(Arrays.hashCode(content));
        }
    }
}
