import { generateTextCompletion } from '../providers';
import { executeHybridSearch } from '../retrieval/hybrid';
import { searchDocumentEmbeddings } from '../vector';

export interface ResearchReport {
  topic: string;
  summary: string;
  internalBlogReferences: { title: string; slug: string; snippet: string }[];
  documentReferences: { title: string; snippet: string }[];
  researchQuestions: string[];
  recommendedOutline: string;
  missingGaps: string[];
}

export async function runResearchAssistantWorkflow(topic: string): Promise<ResearchReport> {
  const blogResults = await executeHybridSearch(topic, 5);
  const internalBlogReferences = blogResults.map((b) => ({
    title: b.title,
    slug: b.slug,
    snippet: b.excerpt,
  }));

  const docResults = await searchDocumentEmbeddings(topic, undefined, 4);
  const documentReferences = docResults.map((d) => ({
    title: d.metadata?.title || 'Uploaded Document',
    snippet: d.content.slice(0, 200) + '...',
  }));

  const contextText = `
INTERNAL BLOGS:
${internalBlogReferences.map((r) => `- ${r.title}: ${r.snippet}`).join('\n')}

UPLOADED DOCUMENTS:
${documentReferences.map((d) => `- ${d.title}: ${d.snippet}`).join('\n')}
`;

  const synthesisPrompt = `You are an AI Research Assistant for a technical blogging platform.
Analyze topic: "${topic}".
Use the following internal knowledge and document excerpts to compile a comprehensive research report:

${contextText}

Synthesize a detailed research report covering:
1. Topic Summary
2. 4 Key Research Questions
3. Recommended Article Outline
4. Identified Gaps or missing perspectives that need further exploration.`;

  const completion = await generateTextCompletion(synthesisPrompt, {
    action: 'RESEARCH_WORKFLOW',
  });

  const summary = completion.text.slice(0, 500) + '...';

  return {
    topic,
    summary,
    internalBlogReferences,
    documentReferences,
    researchQuestions: [
      `What are the core technical constraints in ${topic}?`,
      `How does ${topic} compare with existing architecture?`,
      `What are the production deployment requirements for ${topic}?`,
      `What performance optimizations yield the highest impact?`,
    ],
    recommendedOutline: completion.text,
    missingGaps: [
      'Empirical benchmarks on high-traffic production workloads',
      'Cost-benefit analysis of multi-cloud deployment',
    ],
  };
}
