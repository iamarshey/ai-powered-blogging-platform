import db from '../db';
import { chunkText } from '../ai/rag/chunker';
import { generateEmbedding } from '../ai/embeddings';

export async function processDocumentUpload(documentId: string, rawText: string) {
  try {
    // 1. Update Document Status to PROCESSING
    await db.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    // 2. Clean & Chunk Text
    const chunks = chunkText(rawText, 800, 100);

    // 3. Generate Embeddings & Store Chunks
    for (const chunk of chunks) {
      const vector = await generateEmbedding(chunk.content);
      await db.documentChunk.create({
        data: {
          documentId,
          chunkIndex: chunk.index,
          content: chunk.content,
          vectorJson: JSON.stringify(vector),
        },
      });
    }

    // 4. Mark Document Status as COMPLETED
    await db.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    });
  } catch (error) {
    console.error(`[Document Processing Error] Failed document ${documentId}:`, error);
    await db.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    });
  }
}
