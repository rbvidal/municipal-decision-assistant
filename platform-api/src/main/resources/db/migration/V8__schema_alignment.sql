-- V8__schema_alignment.sql
-- Add missing tables and columns to align with current JPA entity model.

-- 1. Missing columns in auth tables
ALTER TABLE auth_refresh_token_sessions
  ADD COLUMN IF NOT EXISTS created_by_ip VARCHAR(45);

ALTER TABLE auth_refresh_token_sessions
  ADD COLUMN IF NOT EXISTS replaced_by_token_id UUID;

ALTER TABLE auth_refresh_token_sessions
  ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE auth_users
  ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. corpus_manifest table (referenced by CorpusManifestEntity)
CREATE TABLE IF NOT EXISTS corpus_manifest (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id             UUID,
    title                   VARCHAR(500) NOT NULL,
    short_name              VARCHAR(255),
    legal_domain            VARCHAR(100),
    jurisdiction            VARCHAR(100),
    authority               VARCHAR(255),
    doc_type                VARCHAR(100),
    language                VARCHAR(50),
    source_url              VARCHAR(1024),
    publication_date        DATE,
    last_amendment_date     DATE,
    version_identifier      VARCHAR(100),
    file_format             VARCHAR(50),
    local_filename          VARCHAR(500),
    upload_status           VARCHAR(50) NOT NULL DEFAULT 'NOT_UPLOADED',
    ingestion_status        VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    indexing_status         VARCHAR(50) NOT NULL DEFAULT 'NOT_INDEXED',
    embedding_status        VARCHAR(50) NOT NULL DEFAULT 'NOT_EMBEDDED',
    page_count              INT NOT NULL DEFAULT 0,
    extracted_chars         BIGINT NOT NULL DEFAULT 0,
    chunk_count             INT NOT NULL DEFAULT 0,
    vector_count            INT NOT NULL DEFAULT 0,
    last_successful_ingestion TIMESTAMPTZ,
    checksum_sha256         VARCHAR(64),
    priority                VARCHAR(10),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corpus_manifest_document ON corpus_manifest (document_id);
CREATE INDEX IF NOT EXISTS idx_corpus_manifest_domain ON corpus_manifest (legal_domain);
