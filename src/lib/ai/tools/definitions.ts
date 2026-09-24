import { z } from 'zod';
import db from '../../db';
import { executeHybridSearch } from '../retrieval/hybrid';
import { searchPostEmbeddings, searchDocumentEmbeddings } from '../vector';
import { generateTextCompletion } from '../providers';

export const toolSchemas = {
  searchBlogs: z.object({ query: z.string() }),
  semanticSearch: z.object({ query: z.string(), limit: z.number().optional().default(5) }),
  getBlog: z.object({ slugOrId: z.string() }),
  getRelatedArticles: z.object({ postId: z.string() }),
  getUserDrafts: z.object({ userId: z.string() }),
  summarizeBlog: z.object({ postId: z.string() }),
  analyzeBlog: z.object({ postId: z.string() }),
  generateOutline: z.object({ topic: z.string() }),
  searchDocuments: z.object({ query: z.string() }),
};

export const blogAgentTools = {
  async searchBlogs({ query }: { query: string }) {
    const posts = await db.post.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { id: true, title: true, slug: true, excerpt: true },
    });
    return posts;
  },

  async semanticSearch({ query, limit = 5 }: { query: string; limit?: number }) {
    return await executeHybridSearch(query, limit);
  },

  async getBlog({ slugOrId }: { slugOrId: string }) {
    return await db.post.findFirst({
      where: {
        OR: [{ id: slugOrId }, { slug: slugOrId }],
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: { select: { profile: { select: { name: true, username: true } } } },
      },
    });
  },

  async getRelatedArticles({ postId }: { postId: string }) {
    const target = await db.post.findUnique({
      where: { id: postId },
      select: { categoryId: true, title: true },
    });

    if (!target) return [];

    return await db.post.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: postId },
        categoryId: target.categoryId,
      },
      take: 4,
      select: { id: true, title: true, slug: true, excerpt: true },
    });
  },

  async getUserDrafts({ userId }: { userId: string }) {
    return await db.post.findMany({
      where: { authorId: userId, status: 'DRAFT' },
      select: { id: true, title: true, updatedAt: true },
    });
  },

  async summarizeBlog({ postId }: { postId: string }) {
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { title: true, content: true },
    });

    if (!post) throw new Error('Blog not found');

    const res = await generateTextCompletion(
      `Summarize this article titled "${post.title}" into 3 bullet takeaways:\n\n${post.content.slice(0, 3000)}`,
      { action: 'GENERATE_SUMMARY' }
    );
    return { title: post.title, summary: res.text };
  },

  async analyzeBlog({ postId }: { postId: string }) {
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { title: true, content: true },
    });
    if (!post) throw new Error('Blog not found');

    const wordCount = post.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return {
      title: post.title,
      wordCount,
      readingTimeMin: readingTime,
      readabilityGrade: wordCount > 500 ? 'Good' : 'Short Draft',
    };
  },

  async generateOutline({ topic }: { topic: string }) {
    const res = await generateTextCompletion(`Generate a structured Markdown outline for topic: "${topic}"`, {
      action: 'GENERATE_OUTLINE',
    });
    return { topic, outline: res.text };
  },

  async searchDocuments({ query }: { query: string }) {
    return await searchDocumentEmbeddings(query, undefined, 5);
  },
};
