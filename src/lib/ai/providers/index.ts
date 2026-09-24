import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { trackAiGeneration } from '../observability/tracker';

export type AIProvider = 'openai' | 'google' | 'anthropic' | 'mock';

export interface CompletionOptions {
  provider?: AIProvider;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
  action?: string;
}

export async function generateTextCompletion(
  prompt: string,
  options: CompletionOptions = {}
): Promise<{ text: string; provider: string; tokensIn: number; tokensOut: number; latencyMs: number }> {
  const startTime = Date.now();
  const provider = options.provider || (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'mock';
  const systemPrompt = options.systemPrompt || 'You are an expert AI blog assistant.';

  const hasOpenAIKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '';
  const hasGeminiKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY !== '';
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== '';

  let activeProvider = provider;
  if (activeProvider === 'openai' && !hasOpenAIKey) activeProvider = 'mock';
  if (activeProvider === 'google' && !hasGeminiKey) activeProvider = 'mock';
  if (activeProvider === 'anthropic' && !hasAnthropicKey) activeProvider = 'mock';

  let resultText = '';
  let tokensIn = Math.ceil(prompt.length / 4);
  let tokensOut = 0;

  try {
    if (activeProvider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: options.temperature ?? 0.7,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
      const data = await response.json();
      resultText = data.choices[0]?.message?.content || '';
      tokensIn = data.usage?.prompt_tokens || tokensIn;
      tokensOut = data.usage?.completion_tokens || 100;
    } else if (activeProvider === 'google') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }],
          }),
        }
      );

      if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`);
      const data = await response.json();
      resultText = data.candidates[0]?.content?.parts[0]?.text || '';
      tokensOut = Math.ceil(resultText.length / 4);
    } else if (activeProvider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || 1024,
        }),
      });

      if (!response.ok) throw new Error(`Anthropic API error: ${response.statusText}`);
      const data = await response.json();
      resultText = data.content[0]?.text || '';
      tokensOut = Math.ceil(resultText.length / 4);
    } else {
      resultText = generateMockAIResponse(prompt, options.action);
      tokensOut = Math.ceil(resultText.length / 4);
    }
  } catch (err: any) {
    resultText = generateMockAIResponse(prompt, options.action);
    activeProvider = 'mock';
    tokensOut = Math.ceil(resultText.length / 4);
  }

  const latencyMs = Date.now() - startTime;

  await trackAiGeneration({
    userId: options.userId,
    action: options.action || 'TEXT_COMPLETION',
    provider: activeProvider,
    model: activeProvider === 'openai' ? 'gpt-4o-mini' : activeProvider === 'google' ? 'gemini-1.5-flash' : activeProvider === 'anthropic' ? 'claude-3-5-haiku' : 'local-engine-v1',
    prompt,
    response: resultText,
    tokensIn,
    tokensOut,
    latencyMs,
  });

  return {
    text: resultText,
    provider: activeProvider,
    tokensIn,
    tokensOut,
    latencyMs,
  };
}

function generateMockAIResponse(prompt: string, action?: string): string {
  const lower = prompt.toLowerCase();

  if (action === 'GENERATE_TITLE' || lower.includes('title')) {
    return 'Building Scalable AI-Powered Applications: Architecture & Best Practices';
  }
  if (action === 'GENERATE_OUTLINE' || lower.includes('outline')) {
    return `## 1. Introduction & Core Concepts
- Understanding the paradigm shift in AI integration
- High-level architectural overview

## 2. Infrastructure & Vector Search Setup
- PostgreSQL & pgvector implementation details
- Hybrid retrieval and reciprocal rank fusion

## 3. RAG Pipeline Implementation
- Text chunking strategies and overlap thresholds
- Grounded context synthesis and anti-hallucination guardrails

## 4. Production Observability & Evaluation
- Monitoring latency, token costs, and groundedness metrics
- Conclusion & actionable takeaways`;
  }
  if (action === 'GENERATE_SUMMARY' || lower.includes('summary') || lower.includes('tl;dr')) {
    return 'This article explores end-to-end modern AI platform architecture, detailing full-stack Next.js integration, vector databases with pgvector, stateful LangGraph workflows, and RAG pipelines for production-ready applications.';
  }
  if (action === 'GENERATE_TAGS' || lower.includes('tags') || lower.includes('keywords')) {
    return JSON.stringify(['AI', 'Nextjs', 'TypeScript', 'LangChain', 'RAG', 'VectorSearch']);
  }
  if (action === 'SEO_ANALYSIS') {
    return JSON.stringify({
      seoTitle: 'Production AI Blogging Platform: Complete Full-Stack Blueprint',
      metaDescription: 'Discover how to build and deploy a production-grade AI-powered blogging platform with Next.js, pgvector, and LangChain.',
      keywords: ['AI blogging', 'Next.js 14', 'RAG architecture', 'pgvector tutorial', 'TypeScript'],
      readabilityScore: 88,
      headingHierarchyValid: true,
      suggestions: [
        'Add 2 more internal links to related architecture posts.',
        'Include a structured bulleted summary in the introductory section.',
        'Ensure cover image has clear descriptive alt text.'
      ]
    });
  }

  return `Here is a comprehensive response based on your request:\n\n1. **Core Insight**: Modern AI integration requires tight coupling between structured relational data and high-dimensional vector representations.\n2. **Best Practice**: Always execute expensive LLM and embedding pipelines asynchronously, ensuring the main application UI remains responsive and snappy.\n3. **Production Guardrail**: Implement deterministic validation before presenting generated drafts to users.`;
}
