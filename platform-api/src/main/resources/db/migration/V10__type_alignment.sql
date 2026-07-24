-- V10__type_alignment.sql
-- Fix column-type mismatches and missing columns between migrations and entity model.

ALTER TABLE document_ingestion_jobs
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(255);

ALTER TABLE document_ingestion_jobs
  ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255);

ALTER TABLE document_ingestion_jobs
  ALTER COLUMN sequence_number TYPE BIGINT;
