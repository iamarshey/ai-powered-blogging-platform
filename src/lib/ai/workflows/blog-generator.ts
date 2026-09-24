import { generateTextCompletion } from '../providers';
import { executeHybridSearch } from '../retrieval/hybrid';

export interface BlogWorkflowState {
  topic: string;
  topicAnalysis?: string;
  internalKnowledge?: string[];
  researchQuestions?: string[];
  outline?: string;
  sections?: { heading: string; content: string }[];
  draft?: string;
  seoKeywords?: string[];
  seoAnalysis?: any;
  finalDraft?: string;
  currentStep: string;
}

export async function runBlogGenerationWorkflow(topic: string): Promise<BlogWorkflowState> {
  let state: BlogWorkflowState = {
    topic,
    currentStep: 'INIT',
  };

  state.currentStep = 'TOPIC_ANALYSIS';
  const topicAnalysisRes = await generateTextCompletion(
    `Analyze the blogging topic: "${topic}". Identify target audience, key themes, and technical depth required.`,
    { action: 'BLOG_WORKFLOW' }
  );
  state.topicAnalysis = topicAnalysisRes.text;

  state.currentStep = 'KNOWLEDGE_RETRIEVAL';
  const internalPosts = await executeHybridSearch(topic, 3);
  state.internalKnowledge = internalPosts.map((p) => `${p.title}: ${p.excerpt}`);

  state.currentStep = 'RESEARCH_QUESTIONS';
  const researchQuestionsRes = await generateTextCompletion(
    `Based on topic "${topic}" and analysis: ${state.topicAnalysis}, list 4 essential research questions that this article must answer.`,
    { action: 'BLOG_WORKFLOW' }
  );
  state.researchQuestions = researchQuestionsRes.text.split('\n').filter((q) => q.trim().length > 0);

  state.currentStep = 'OUTLINE_GENERATION';
  const outlineRes = await generateTextCompletion(
    `Create a comprehensive, structured Markdown outline for an article titled "${topic}". Address these research questions: ${state.researchQuestions.join(', ')}.`,
    { action: 'GENERATE_OUTLINE' }
  );
  state.outline = outlineRes.text;

  state.currentStep = 'DRAFT_GENERATION';
  const draftRes = await generateTextCompletion(
    `Write a complete, highly engaging technical article in Markdown based on this outline:\n\n${state.outline}\n\nIncorporate references to existing platform knowledge where appropriate: ${state.internalKnowledge.join('; ')}.`,
    { action: 'BLOG_WORKFLOW' }
  );
  state.draft = draftRes.text;

  state.currentStep = 'SEO_ANALYSIS';
  const seoRes = await generateTextCompletion(
    `Perform SEO analysis for this draft article on "${topic}". Return SEO keywords, meta description, and title suggestions.\n\nDRAFT:\n${state.draft.slice(0, 1500)}`,
    { action: 'SEO_ANALYSIS' }
  );
  try {
    state.seoAnalysis = JSON.parse(seoRes.text);
  } catch (e) {
    state.seoAnalysis = { seoTitle: topic, metaDescription: state.draft.slice(0, 150), keywords: [topic, 'AI', 'Guide'] };
  }

  state.currentStep = 'COMPLETED';
  state.finalDraft = state.draft;

  return state;
}
