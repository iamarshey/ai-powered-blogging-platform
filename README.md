# AI Pulse — Production-Ready AI-Powered Blogging Platform

AI Pulse is a full-fledged, production-oriented AI-powered Blogging Web Application built from scratch with TypeScript, Next.js App Router, PostgreSQL with `pgvector`, LangGraph stateful workflows, and RAG pipelines.

---

## 🌟 Key Architecture & Features

### 1. Core Blogging Platform
- **Public Discovery Pages**: `/`, `/explore`, `/search`, `/blog/[slug]`, `/category/[slug]`, `/tag/[slug]`, `/author/[username]`, `/about`, `/contact`.
- **RBAC Authentication & Profiles**: Reader, Author, and Admin user roles with session management and user profile management.
- **Blog CMS & Discovery**: Markdown editor, auto-saving drafts, category/tag taxonomies, published post versioning, and view/like/bookmark analytics.
- **Discussion System**: Nested comments, replies, and automated AI safety moderation.

### 2. Production AI & GenAI Infrastructure
- **Unified Multi-Provider Layer**: Supports **OpenAI** (`gpt-4o-mini`), **Google Gemini** (`gemini-1.5-flash`), **Anthropic Claude** (`claude-3-5-haiku`), and local deterministic fallback without rewriting application logic.
- **RAG & Vector Search**: Grounded article retrieval powered by PostgreSQL & `pgvector` with 1536-dimensional embeddings.
- **Hybrid Search & Reranking**: Combines full-text keyword queries with vector similarity using **Reciprocal Rank Fusion (RRF)** scoring.
- **Stateful LangGraph Workflows**: Multi-step blog generation state machine (`Topic` → `Analysis` → `Research` → `Outline` → `Draft` → `SEO` → `Final Draft`) and AI Research Assistant workflow.
- **AI Readers & Tools**: In-page **Ask This Article** RAG modal, **Ask PDF** document Q&A, and interactive in-editor AI writing assistant.
- **Model Context Protocol (MCP)**: Read-only MCP gateway exposing blog search, article retrieval, and document Q&A tools.
- **LLM Observability & Evaluation**: Admin telemetry dashboard tracking token usage, latency, API costs, and empirical RAG groundedness quality benchmarks.

---

## 🏗 System Architecture Diagram

```text
                    ┌─────────────────────┐
                    │     Next.js App     │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Vercel AI SDK/UI   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   AI Service Layer  │
                    │ LangChain/LangGraph │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
       ┌─────▼─────┐    ┌──────▼──────┐   ┌────▼────┐
       │ LLM APIs  │    │ AI Agents   │   │ AI Tools│
       │OpenAI etc.│    │ LangGraph   │   │ Backend │
       └───────────┘    └─────────────┘   └────┬────┘
                                               │
                                    ┌──────────▼─────────┐
                                    │ PostgreSQL/Supabase│
                                    │     + pgvector     │
                                    └──────────┬─────────┘
                                               │
                              ┌────────────────┼───────────────┐
                              │                │               │
                         Blog Data       Documents       Embeddings
                              │                │               │
                              └────────────────┼───────────────┘
                                               │
                                        RAG / Search
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **Docker & Docker Compose**: (Optional, for local PostgreSQL with pgvector)

### 1. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Set your preferred AI Provider in `.env`:
```env
DEFAULT_AI_PROVIDER="openai" # "openai" | "google" | "anthropic" | "mock"
OPENAI_API_KEY="sk-proj-your-key"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blogging_db?schema=public"
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Database Migration & Seeding
Generate Prisma client and push the schema:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing

Run unit tests for chunking, embeddings, and moderation guardrails:
```bash
npm run test
```

---

## 🐳 Docker Deployment

To spin up the application with PostgreSQL + `pgvector` and Redis locally using Docker:
```bash
docker-compose up --build
```
