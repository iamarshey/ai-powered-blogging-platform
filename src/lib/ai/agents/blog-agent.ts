import { blogAgentTools, toolSchemas } from '../tools/definitions';
import { generateTextCompletion } from '../providers';
import db from '../../db';

export interface AgentExecutionResult {
  response: string;
  toolCallsMade: { toolName: string; args: any; result: any }[];
}

export async function runBlogAiAgent(
  userPrompt: string,
  userId?: string
): Promise<AgentExecutionResult> {
  const toolCallsMade: { toolName: string; args: any; result: any }[] = [];

  const lower = userPrompt.toLowerCase();
  let toolResultText = '';

  if (lower.includes('search blog') || lower.includes('find articles about')) {
    const args = { query: userPrompt.replace(/(search blog|find articles about)/gi, '').trim() || 'AI' };
    toolSchemas.searchBlogs.parse(args);
    const res = await blogAgentTools.searchBlogs(args);
    toolCallsMade.push({ toolName: 'searchBlogs', args, result: res });
    toolResultText = JSON.stringify(res);
  } else if (lower.includes('semantic search') || lower.includes('hybrid search')) {
    const args = { query: userPrompt, limit: 3 };
    const res = await blogAgentTools.semanticSearch(args);
    toolCallsMade.push({ toolName: 'semanticSearch', args, result: res });
    toolResultText = JSON.stringify(res);
  } else if (lower.includes('my drafts') || lower.includes('drafts') && userId) {
    const args = { userId: userId! };
    const res = await blogAgentTools.getUserDrafts(args);
    toolCallsMade.push({ toolName: 'getUserDrafts', args, result: res });
    toolResultText = JSON.stringify(res);
  } else if (lower.includes('outline for') || lower.includes('generate outline')) {
    const topic = userPrompt.replace(/(outline for|generate outline)/gi, '').trim() || 'Software Development';
    const args = { topic };
    const res = await blogAgentTools.generateOutline(args);
    toolCallsMade.push({ toolName: 'generateOutline', args, result: res });
    toolResultText = JSON.stringify(res);
  } else if (lower.includes('document') || lower.includes('pdf')) {
    const args = { query: userPrompt };
    const res = await blogAgentTools.searchDocuments(args);
    toolCallsMade.push({ toolName: 'searchDocuments', args, result: res });
    toolResultText = JSON.stringify(res);
  }

  const agentPrompt = `You are the platform's AI Blog Agent.
USER PROMPT: "${userPrompt}"

TOOL EXECUTIONS & RESULTS:
${toolResultText ? toolResultText : 'No specialized tool was triggered. Answer directly based on general platform knowledge.'}

Provide a helpful, precise, and professional response to the user.`;

  const completion = await generateTextCompletion(agentPrompt, {
    action: 'AI_BLOG_AGENT',
    userId,
  });

  for (const tc of toolCallsMade) {
    try {
      await db.aiToolCall.create({
        data: {
          toolName: tc.toolName,
          arguments: JSON.stringify(tc.args),
          result: JSON.stringify(tc.result),
          status: 'SUCCESS',
        },
      });
    } catch (e) {
      // Non-blocking
    }
  }

  return {
    response: completion.text,
    toolCallsMade,
  };
}
