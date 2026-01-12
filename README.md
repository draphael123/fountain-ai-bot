# Fountain Workflows Assistant

A production-quality "NotebookLM-like" document Q&A system consisting of a Next.js web app and a Chrome extension. The system answers questions **only** using content from a source document, with full citations.

## Features

- **Document-Grounded Answers**: All responses come exclusively from the ingested document
- **Full Citations**: Every claim links back to the source section
- **Strict Mode**: Enforces document-only knowledge (ON by default)
- **Streaming Responses**: Real-time answer generation
- **PHI Detection**: Warns users before sending potentially sensitive information
- **Escalation Detection**: Flags legal/compliance-related queries
- **Chrome Extension**: Query the system from any browser tab
- **HIPAA-Conscious**: No query logging, no telemetry, no data storage

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- OpenAI API key (for embeddings and optionally LLM)
- Anthropic API key (optional, for Claude as LLM)

### Local Setup

1. **Clone and install dependencies**

```bash
cd "Fountain Bot - redone"
npm install
```

2. **Configure environment variables**

```bash
# Copy the example env file
copy env.example .env.local

# Edit .env.local with your API keys
```

Required variables:
```
OPENAI_API_KEY=sk-your-key-here
DOCUMENT_PATH=./data/source.docx
```

3. **Add your document**

Place your `.docx` file in the `data/` folder and update `DOCUMENT_PATH` in `.env.local`:

```bash
# Example: if your file is "Fountain Workflows.docx"
DOCUMENT_PATH=./data/Fountain Workflows.docx
```

4. **Run document ingestion**

```bash
npm run ingest
```

This will:
- Parse the DOCX file
- Split content into semantic chunks
- Generate embeddings via OpenAI
- Store everything in a local SQLite database

5. **Start the development server**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | OpenAI API key for embeddings (and optionally LLM) |
| `ANTHROPIC_API_KEY` | No | - | Anthropic API key (if using Claude) |
| `LLM_PROVIDER` | No | `openai` | Which LLM to use: `openai` or `anthropic` |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model for answers |
| `ANTHROPIC_MODEL` | No | `claude-3-5-sonnet-20241022` | Anthropic model for answers |
| `OPENAI_EMBEDDING_MODEL` | No | `text-embedding-3-small` | Embedding model |
| `DOCUMENT_PATH` | No | `./data/source.docx` | Path to your DOCX file |
| `DEV_MODE` | No | `true` | Enables re-ingest button in UI |

## How Ingestion Works

1. **DOCX Parsing**: Uses `mammoth` to convert DOCX to HTML, preserving structure
2. **Section Extraction**: Identifies headings and groups content by section
3. **Chunking**: Splits large sections into 600-900 token chunks with overlap
4. **Embedding**: Generates OpenAI embeddings for each chunk
5. **Storage**: Saves chunks + embeddings to SQLite (`fountain.db`)

## Project Structure

```
├── app/
│   ├── page.tsx            # Landing page
│   ├── chat/page.tsx       # Q&A interface
│   ├── sources/page.tsx    # Document info
│   └── api/
│       ├── ask/            # Q&A endpoint
│       ├── sources/        # Metadata endpoint
│       └── ingest/         # Re-ingest trigger
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── chat/               # Chat interface components
│   └── ...
├── lib/
│   ├── db/                 # SQLite client
│   ├── ingest/             # Document processing
│   ├── retrieval/          # Search + reranking
│   ├── llm/                # LLM providers + prompts
│   └── compliance/         # PHI/escalation detection
├── extension/              # Chrome extension
├── scripts/
│   └── ingest.ts           # CLI ingestion script
└── data/                   # Place your .docx here
```

## Chrome Extension

### Loading the Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `extension/` folder from this project
5. The extension icon will appear in your toolbar

### Using the Extension

1. Click the extension icon
2. Type your question
3. Get answers with citations, just like the web app

### Configuring the Extension

By default, the extension connects to `http://localhost:3000`. To change this:

1. Right-click the extension icon → "Options"
2. Enter your deployed URL (e.g., `https://your-app.vercel.app`)
3. Save

**Note**: Add placeholder PNG icons to `extension/icons/` before publishing:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

## Deployment to Vercel

### Important: SQLite Limitation

SQLite doesn't persist on Vercel's serverless functions. For production, use one of these alternatives:

#### Option 1: Supabase + pgvector (Recommended)

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Enable the pgvector extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

3. Create the chunks table:
```sql
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  heading TEXT NOT NULL,
  content TEXT NOT NULL,
  source_path TEXT NOT NULL,
  offset_start INTEGER NOT NULL,
  offset_end INTEGER NOT NULL,
  token_count INTEGER NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

4. Update the database client to use Supabase instead of SQLite

5. Add `DATABASE_URL` to your Vercel environment variables

#### Option 2: Turso (SQLite at the edge)

Turso provides edge-compatible SQLite. See [turso.tech](https://turso.tech) for setup.

### Deploying

1. Push to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Smoke Test Questions

After ingestion, test with these questions (adjust based on your document):

- "What is the cancellation workflow?"
- "How do I handle a WhatsApp inquiry?"
- "What are the critical escalation steps?"
- "How do I send Virtu secure documents?"
- "What should I do if a patient threatens legal action?"

## Compliance Features

### PHI Warning
- Detects potential PHI patterns (SSN, phone, email, DOB)
- Warns users before sending (does not block)
- No data is logged or stored

### Escalation Detection
- Detects keywords: lawsuit, BBB, malpractice, attorney, etc.
- Shows a prominent banner recommending escalation workflow
- Reminds to cease communication per documented procedures

### Strict Mode
- ON by default
- Forces answers to come only from the document
- Requires citations for all claims
- Says "Not found" if information isn't in the doc

## Development

```bash
# Run development server
npm run dev

# Run ingestion
npm run ingest

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Security Notes

- No user queries are stored or logged
- Telemetry is disabled
- API keys are never exposed to the client
- The extension never scrapes page content
- PHI detection is client-side only (nothing sent to server for detection)

## License

Internal use only. Do not distribute externally.


