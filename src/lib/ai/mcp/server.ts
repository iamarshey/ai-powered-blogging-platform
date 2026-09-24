import { blogAgentTools } from '../tools/definitions';

export interface McpToolRequest {
  toolName: string;
  arguments: any;
}

export async function handleMcpRequest(req: McpToolRequest) {
  const { toolName, arguments: args } = req;

  // Strict enforcement: ONLY allow read-only tools via MCP interface
  const allowedTools = [
    'searchBlogs',
    'getBlog',
    'semanticSearch',
    'searchDocuments',
    'getRelatedArticles',
  ];

  if (!allowedTools.includes(toolName)) {
    throw new Error(`Forbidden MCP Tool Execution: '${toolName}' is not permitted or does not exist.`);
  }

  switch (toolName) {
    case 'searchBlogs':
      return await blogAgentTools.searchBlogs(args);
    case 'getBlog':
      return await blogAgentTools.getBlog(args);
    case 'semanticSearch':
      return await blogAgentTools.semanticSearch(args);
    case 'searchDocuments':
      return await blogAgentTools.searchDocuments(args);
    case 'getRelatedArticles':
      return await blogAgentTools.getRelatedArticles(args);
    default:
      throw new Error('Unknown tool');
  }
}

export function getMcpManifest() {
  return {
    name: 'AI Blogging Platform MCP Gateway',
    version: '1.0.0',
    description: 'Read-only Model Context Protocol interface for platform knowledge discovery.',
    tools: [
      {
        name: 'searchBlogs',
        description: 'Keyword search across published blog posts.',
        parameters: { type: 'object', properties: { query: { type: 'string' } } },
      },
      {
        name: 'semanticSearch',
        description: 'Semantic vector similarity search across published articles.',
        parameters: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' } } },
      },
      {
        name: 'getBlog',
        description: 'Retrieve detailed blog content by slug or ID.',
        parameters: { type: 'object', properties: { slugOrId: { type: 'string' } } },
      },
      {
        name: 'searchDocuments',
        description: 'Search across uploaded PDF & text document knowledge chunks.',
        parameters: { type: 'object', properties: { query: { type: 'string' } } },
      },
    ],
  };
}
