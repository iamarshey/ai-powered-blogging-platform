const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding blogging database...');

  // Create Categories
  const catAI = await prisma.category.upsert({
    where: { slug: 'artificial-intelligence' },
    update: {},
    create: {
      name: 'Artificial Intelligence',
      slug: 'artificial-intelligence',
      description: 'LLMs, RAG, pgvector, LangChain, and AI Agent architecture.',
    },
  });

  const catEng = await prisma.category.upsert({
    where: { slug: 'engineering' },
    update: {},
    create: {
      name: 'Engineering',
      slug: 'engineering',
      description: 'Full-stack development, Next.js App Router, and TypeScript.',
    },
  });

  // Create Admin User
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aipulse.com' },
    update: {},
    create: {
      email: 'admin@aipulse.com',
      passwordHash,
      role: 'ADMIN',
      profile: {
        create: {
          name: 'Platform Admin',
          username: 'admin',
          bio: 'Lead System Administrator & AI Security Architect',
        },
      },
    },
  });

  // Create Author User
  const authorUser = await prisma.user.upsert({
    where: { email: 'author@aipulse.com' },
    update: {},
    create: {
      email: 'author@aipulse.com',
      passwordHash,
      role: 'AUTHOR',
      profile: {
        create: {
          name: 'Alex Mercer',
          username: 'alexmercer',
          bio: 'Principal Staff Engineer writing about RAG & LLMs',
        },
      },
    },
  });

  // Create Sample Published Post
  const samplePost = await prisma.post.upsert({
    where: { slug: 'building-production-rag-pipelines-with-pgvector' },
    update: {},
    create: {
      title: 'Building Production RAG Pipelines with PostgreSQL & pgvector',
      subtitle: 'A practical deep dive into hybrid vector retrieval, text chunking, and reciprocal rank fusion.',
      slug: 'building-production-rag-pipelines-with-pgvector',
      content: `Retrieval-Augmented Generation (RAG) has emerged as the industry standard pattern for grounding Large Language Models in domain-specific enterprise knowledge bases.

## 1. Why pgvector for Vector Storage?
PostgreSQL with the pgvector extension allows unified relational and high-dimensional vector similarity operations inside a single battle-tested database.

## 2. Text Chunking Strategies
Splitting documents into semantically coherent chunks using 800-token boundaries with 100-token overlaps preserves contextual continuity across chunk boundaries.

## 3. Hybrid Search & Reranking
Combining full-text keyword search with cosine distance vector retrieval via Reciprocal Rank Fusion (RRF) ensures high precision for both explicit keywords and semantic intent.`,
      excerpt: 'Learn how to construct resilient, production-grade RAG retrieval pipelines using PostgreSQL, pgvector, and Next.js.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      readingTimeMin: 5,
      viewsCount: 142,
      authorId: authorUser.id,
      categoryId: catAI.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
