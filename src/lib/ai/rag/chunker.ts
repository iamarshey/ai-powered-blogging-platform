export interface TextChunk {
  index: number;
  content: string;
}

export function chunkText(text: string, chunkSize: number = 800, overlap: number = 100): TextChunk[] {
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleanText.length <= chunkSize) {
    return [{ index: 0, content: cleanText }];
  }

  const chunks: TextChunk[] = [];
  const paragraphs = cleanText.split('\n\n');

  let currentChunk = '';
  let index = 0;

  for (const para of paragraphs) {
    if ((currentChunk + '\n\n' + para).length > chunkSize) {
      if (currentChunk.trim().length > 0) {
        chunks.push({ index: index++, content: currentChunk.trim() });
      }

      if (para.length > chunkSize) {
        let start = 0;
        while (start < para.length) {
          const end = Math.min(start + chunkSize, para.length);
          chunks.push({ index: index++, content: para.slice(start, end) });
          start += chunkSize - overlap;
        }
        currentChunk = '';
      } else {
        const overlapText = currentChunk.slice(Math.max(0, currentChunk.length - overlap));
        currentChunk = overlapText + '\n\n' + para;
      }
    } else {
      currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({ index: index++, content: currentChunk.trim() });
  }

  return chunks;
}
