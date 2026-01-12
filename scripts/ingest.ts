#!/usr/bin/env npx tsx

/**
 * Document Ingestion Script
 * 
 * Usage: npm run ingest
 * 
 * This script:
 * 1. Reads the DOCX file specified in DOCUMENT_PATH
 * 2. Parses it into sections
 * 3. Chunks the content
 * 4. Generates embeddings via OpenAI
 * 5. Stores everything in SQLite
 */

import { config } from "dotenv";
import path from "path";

// Load environment variables
config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

import { ingestDocument } from "../lib/ingest/pipeline";
import { validateConfig, config as appConfig } from "../lib/config";

async function main() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║  Fountain Workflows Document Ingestion     ║");
  console.log("╚════════════════════════════════════════════╝\n");

  // Validate configuration
  const validation = validateConfig();
  if (!validation.valid) {
    console.error("❌ Configuration errors:");
    validation.errors.forEach((err) => console.error(`   - ${err}`));
    console.error("\n💡 Make sure you have a .env.local file with your API keys.");
    console.error("   Copy env.example to .env.local and fill in your values.\n");
    process.exit(1);
  }

  console.log(`📂 Document path: ${appConfig.documentPath}`);
  console.log(`🔧 Embedding model: ${appConfig.openaiEmbeddingModel}`);
  console.log(`📊 Target chunk size: ${appConfig.targetChunkTokens} tokens\n`);

  try {
    const result = await ingestDocument();

    if (result.success) {
      console.log("\n╔════════════════════════════════════════════╗");
      console.log("║  ✅ Ingestion Complete!                    ║");
      console.log("╚════════════════════════════════════════════╝\n");
      console.log("You can now run 'npm run dev' to start the app.");
    } else {
      console.error("\n❌ Ingestion failed:");
      result.errors.forEach((err) => console.error(`   - ${err}`));
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();


