package com.cognitera.platform.web;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaCorpusManifestRepository extends JpaRepository<CorpusManifestEntity, UUID> {

    Optional<CorpusManifestEntity> findByDocumentId(UUID documentId);

    List<CorpusManifestEntity> findByLegalDomain(String legalDomain);

    List<CorpusManifestEntity> findByPriority(String priority);

    List<CorpusManifestEntity> findByUploadStatus(CorpusManifestEntity.UploadStatus status);

    List<CorpusManifestEntity> findByEmbeddingStatus(CorpusManifestEntity.EmbeddingStatus status);

    List<CorpusManifestEntity> findByIndexingStatus(CorpusManifestEntity.IndexingStatus status);

    int countByLegalDomain(String legalDomain);

    boolean existsByTitleAndIdNot(String title, UUID id);

    boolean existsByDocumentId(UUID documentId);
}
