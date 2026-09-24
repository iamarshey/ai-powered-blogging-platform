import { describe, it, expect } from 'vitest';
import { chunkText } from '../../src/lib/ai/rag/chunker.ts';

describe('Text Chunker Module', () => {
  it('should return a single chunk for text under chunk size', () => {
    const text = 'Short article content about software architecture.';
    const chunks = chunkText(text, 500);
    expect(chunks.length).toBe(1);
    expect(chunks[0].content).toBe(text);
  });

  it('should split long text into multiple overlapping chunks', () => {
    const paragraph1 = 'Paragraph 1 '.repeat(40);
    const paragraph2 = 'Paragraph 2 '.repeat(40);
    const fullText = `${paragraph1}\n\n${paragraph2}`;

    const chunks = chunkText(fullText, 250, 30);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].index).toBe(0);
    expect(chunks[1].index).toBe(1);
  });
});
