import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
import path from "path";
import { SCHEMA_SQL, CLEAR_DATA_SQL, type Chunk, type Metadata } from "./schema";

// Re-export types from schema
export type { Chunk, Metadata };

// Database singleton
let db: SqlJsDatabase | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

function getDbPath(): string {
  return path.join(process.cwd(), "fountain.db");
}

async function initDb(): Promise<SqlJsDatabase> {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  const dbPath = getDbPath();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    return new SQL.Database(buffer);
  }
  
  const newDb = new SQL.Database();
  newDb.run(SCHEMA_SQL);
  saveDb(newDb);
  return newDb;
}

function saveDb(database: SqlJsDatabase): void {
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(getDbPath(), buffer);
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (!db) {
    db = await initDb();
  }
  return db;
}

export function getDbSync(): SqlJsDatabase {
  if (!db) {
    throw new Error("Database not initialized. Call getDb() first.");
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    saveDb(db);
    db.close();
    db = null;
  }
}

// Chunk operations
export async function insertChunk(chunk: Chunk): Promise<void> {
  const database = await getDb();
  database.run(
    `INSERT OR REPLACE INTO chunks (id, heading, content, source_path, offset_start, offset_end, token_count, embedding, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [chunk.id, chunk.heading, chunk.content, chunk.source_path, chunk.offset_start, chunk.offset_end, chunk.token_count, chunk.embedding, chunk.created_at]
  );
  saveDb(database);
}

export async function insertChunks(chunks: Chunk[]): Promise<void> {
  const database = await getDb();
  
  for (const chunk of chunks) {
    database.run(
      `INSERT OR REPLACE INTO chunks (id, heading, content, source_path, offset_start, offset_end, token_count, embedding, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [chunk.id, chunk.heading, chunk.content, chunk.source_path, chunk.offset_start, chunk.offset_end, chunk.token_count, chunk.embedding, chunk.created_at]
    );
  }
  
  saveDb(database);
}

export function getAllChunks(): Chunk[] {
  const database = getDbSync();
  const results = database.exec("SELECT * FROM chunks");
  
  if (results.length === 0) return [];
  
  const { columns, values } = results[0];
  return values.map((row) => {
    const chunk: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      chunk[col] = row[i];
    });
    return chunk as unknown as Chunk;
  });
}

export function getChunkById(id: string): Chunk | undefined {
  const database = getDbSync();
  const results = database.exec("SELECT * FROM chunks WHERE id = ?", [id]);
  
  if (results.length === 0 || results[0].values.length === 0) return undefined;
  
  const { columns, values } = results[0];
  const chunk: Record<string, unknown> = {};
  columns.forEach((col, i) => {
    chunk[col] = values[0][i];
  });
  return chunk as unknown as Chunk;
}

export function getChunksByIds(ids: string[]): Chunk[] {
  if (ids.length === 0) return [];
  
  const database = getDbSync();
  const placeholders = ids.map(() => "?").join(",");
  const results = database.exec(`SELECT * FROM chunks WHERE id IN (${placeholders})`, ids);
  
  if (results.length === 0) return [];
  
  const { columns, values } = results[0];
  return values.map((row) => {
    const chunk: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      chunk[col] = row[i];
    });
    return chunk as unknown as Chunk;
  });
}

export function getChunkCount(): number {
  const database = getDbSync();
  const results = database.exec("SELECT COUNT(*) as count FROM chunks");
  
  if (results.length === 0) return 0;
  return results[0].values[0][0] as number;
}

// Metadata operations
export async function setMetadata(key: string, value: string): Promise<void> {
  const database = await getDb();
  database.run(
    `INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)`,
    [key, value]
  );
  saveDb(database);
}

export function getMetadata(key: string): string | undefined {
  const database = getDbSync();
  const results = database.exec("SELECT value FROM metadata WHERE key = ?", [key]);
  
  if (results.length === 0 || results[0].values.length === 0) return undefined;
  return results[0].values[0][0] as string;
}

export function getAllMetadata(): Metadata[] {
  const database = getDbSync();
  const results = database.exec("SELECT * FROM metadata");
  
  if (results.length === 0) return [];
  
  const { columns, values } = results[0];
  return values.map((row) => {
    const metadata: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      metadata[col] = row[i];
    });
    return metadata as unknown as Metadata;
  });
}

// Clear all data (for re-ingestion)
export async function clearAllData(): Promise<void> {
  const database = await getDb();
  database.run(CLEAR_DATA_SQL);
  saveDb(database);
}

// Get all chunk embeddings for search
export function getAllChunksWithEmbeddings(): Array<{ id: string; heading: string; content: string; embedding: number[] }> {
  const database = getDbSync();
  const results = database.exec("SELECT id, heading, content, embedding FROM chunks");
  
  if (results.length === 0) return [];
  
  const { columns, values } = results[0];
  return values.map((row) => {
    const idIdx = columns.indexOf("id");
    const headingIdx = columns.indexOf("heading");
    const contentIdx = columns.indexOf("content");
    const embeddingIdx = columns.indexOf("embedding");
    
    return {
      id: row[idIdx] as string,
      heading: row[headingIdx] as string,
      content: row[contentIdx] as string,
      embedding: JSON.parse(row[embeddingIdx] as string) as number[],
    };
  });
}

// Initialize database on module load for sync operations
let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = getDb().then(() => {});
  }
  return initPromise;
}
