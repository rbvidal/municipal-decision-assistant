-- V9__workspace_code.sql
-- Add workspace_code as a unique business identifier for workspaces.

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS workspace_code VARCHAR(50);

-- Generate codes for existing rows that lack one
UPDATE workspaces
   SET workspace_code = 'WS-' || upper(left(replace(id::text, '-', ''), 8))
 WHERE workspace_code IS NULL;

ALTER TABLE workspaces
  ADD CONSTRAINT uq_workspace_code UNIQUE (workspace_code);
