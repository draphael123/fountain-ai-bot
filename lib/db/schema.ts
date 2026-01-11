// Database schema and types

export interface Chunk {
  id: string;
  heading: string;
  content: string;
  source_path: string;
  offset_start: number;
  offset_end: number;
  token_count: number;
  embedding: string; // JSON array of floats
  created_at: string;
}

export interface Metadata {
  key: string;
  value: string;
}

export const SCHEMA_SQL = `
-- Chunks table with embeddings stored as JSON array
CREATE TABLE IF NOT EXISTS chunks (
  id TEXT PRIMARY KEY,
  heading TEXT NOT NULL,
  content TEXT NOT NULL,
  source_path TEXT NOT NULL,
  offset_start INTEGER NOT NULL,
  offset_end INTEGER NOT NULL,
  token_count INTEGER NOT NULL,
  embedding TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Metadata table for document info
CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chunks_heading ON chunks(heading);
`;

export const CLEAR_DATA_SQL = `
DELETE FROM chunks;
DELETE FROM metadata;
`;

