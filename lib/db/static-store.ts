// Static data store - works on Vercel without a database
// Data is pre-computed at build time and stored as JSON

import fs from "fs";
import path from "path";

export interface StoredChunk {
  id: string;
  heading: string;
  content: string;
  source_path: string;
  offset_start: number;
  offset_end: number;
  token_count: number;
  embedding: number[];
}

export interface StoredMetadata {
  document_name: string;
  document_path: string;
  section_count: number;
  chunk_count: number;
  total_tokens: number;
  ingested_at: string;
}

export interface StaticData {
  chunks: StoredChunk[];
  metadata: StoredMetadata;
}

const DATA_FILE = "data/embedded-data.json";

function getDataPath(): string {
  return path.join(process.cwd(), DATA_FILE);
}

// Cache the loaded data
let cachedData: StaticData | null = null;

/**
 * Load pre-computed data from JSON file
 */
export function loadStaticData(): StaticData | null {
  if (cachedData) return cachedData;
  
  try {
    const dataPath = getDataPath();
    if (!fs.existsSync(dataPath)) {
      return null;
    }
    const content = fs.readFileSync(dataPath, "utf-8");
    cachedData = JSON.parse(content) as StaticData;
    return cachedData;
  } catch (error) {
    console.error("Failed to load static data:", error);
    return null;
  }
}

/**
 * Save pre-computed data to JSON file (used during ingestion)
 */
export function saveStaticData(data: StaticData): void {
  const dataPath = getDataPath();
  const dir = path.dirname(dataPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  cachedData = data;
}

/**
 * Check if data has been ingested
 */
export function hasData(): boolean {
  const data = loadStaticData();
  return data !== null && data.chunks.length > 0;
}

/**
 * Get all chunks
 */
export function getAllChunks(): StoredChunk[] {
  const data = loadStaticData();
  return data?.chunks || [];
}

/**
 * Get chunk by ID
 */
export function getChunkById(id: string): StoredChunk | undefined {
  const data = loadStaticData();
  return data?.chunks.find((c) => c.id === id);
}

/**
 * Get chunks by IDs
 */
export function getChunksByIds(ids: string[]): StoredChunk[] {
  const data = loadStaticData();
  if (!data) return [];
  const idSet = new Set(ids);
  return data.chunks.filter((c) => idSet.has(c.id));
}

/**
 * Get chunk count
 */
export function getChunkCount(): number {
  const data = loadStaticData();
  return data?.chunks.length || 0;
}

/**
 * Get metadata
 */
export function getMetadata(): StoredMetadata | null {
  const data = loadStaticData();
  return data?.metadata || null;
}

/**
 * Get all chunks with embeddings for search
 */
export function getAllChunksWithEmbeddings(): Array<{
  id: string;
  heading: string;
  content: string;
  embedding: number[];
}> {
  const data = loadStaticData();
  if (!data) return [];
  
  return data.chunks.map((chunk) => ({
    id: chunk.id,
    heading: chunk.heading,
    content: chunk.content,
    embedding: chunk.embedding,
  }));
}

/**
 * Get unique headings
 */
export function getUniqueHeadings(): string[] {
  const data = loadStaticData();
  if (!data) return [];
  return [...new Set(data.chunks.map((c) => c.heading))];
}

