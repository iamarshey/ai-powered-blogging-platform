import db from '../../db';
import { generateTextCompletion } from '../providers';
import { searchPostEmbeddings, searchDocumentEmbeddings } from '../vector';
import { executeHybridSearch } from '../retrieval/hybrid';

export interface RAGAnswerResult {
  answer: string;
  sources: { title: string; slug?: string; content: string }[];
  provider: string;
}

export async function askArticleRAG(postId: string, question: string): Promise<RAGAnswerResult> {
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { title: true, content: true, slug: true },
  });

  if (!post) {
    throw new Error('Article not found');
  }

  const embeddings = await db.postEmbedding.findMany({
    where: { postId },
    take: 5,
  });

  let context = '';
  if (embeddings.length > 0) {
    context = embeddings.map((e) => e.content).join('\n\n');
  } else {
    context = post.content.slice(0, 3000);
  }

  const prompt = `You are a helpful AI reading assistant answering a question about the article titled "${post.title}".
Answer strictly based on the following article context. If the answer cannot be found in the context, politely state that it's not mentioned in the article.

CONTEXT:
${context}

QUESTION:
${question}`;

  const completion = await generateTextCompletion(prompt, {
    action: 'ASK_ARTICLE',
    systemPrompt: 'You are an articulate AI blog reading assistant.',
  });

  return {
    answer: completion.text,
    sources: [{ title: post.title, slug: post.slug, content: context.slice(0, 250) + '...' }],
    provider: completion.provider,
  };
}

export async function askDocumentRAG(documentId: string, question: string): Promise<RAGAnswerResult> {
  const document = await db.document.findUnique({
    where: { id: documentId },
    select: { title: true },
  });

  if (!document) throw new Error('Document not found');

  const chunkResults = await searchDocumentEmbeddings(question, documentId, 4);
  const context = chunkResults.map((c) => c.content).join('\n---\n');

  const prompt = `You are an expert PDF & Document AI Q&A assistant.
Answer the user's question using ONLY the provided document chunks below. Be accurate, concise, and direct.

DOCUMENT TITLE: ${document.title}

RELEVANT EXCERPTS:
${context || 'No explicit chunks found.'}

USER QUESTION: ${question}`;

  const completion = await generateTextCompletion(prompt, {
    action: 'ASK_PDF',
  });

  return {
    answer: completion.text,
    sources: chunkResults.map((c) => ({
      title: document.title,
      content: c.content.slice(0, 200) + '...',
    })),
    provider: completion.provider,
  };
}

export async function globalBlogChatbotRAG(question: string, history: string[] = []): Promise<RAGAnswerResult> {
  const searchResults = await executeHybridSearch(question, 4);
  const context = searchResults.map((s) => `[${s.title}] (${s.slug}): ${s.excerpt}`).join('\n\n');

  const formattedHistory = history.slice(-4).join('\n');

  const prompt = `You are the official AI Assistant for the blogging platform.
Answer the user query using the retrieved knowledge base articles below. Cite relevant articles when appropriate.

CONVERSATION HISTORY:
${formattedHistory}

RELEVANT KNOWLEDGE BASE ARTICLES:
${context || 'No specific published articles match this query.'}

USER QUESTION: ${question}`;

  const completion = await generateTextCompletion(prompt, {
    action: 'GLOBAL_CHATBOT',
    systemPrompt: 'You are the platform AI assistant with full knowledge of published blogs.',
  });

  return {
    answer: completion.text,
    sources: searchResults.map((s) => ({ title: s.title, slug: s.slug, content: s.excerpt })),
    provider: completion.provider,
  };
}
