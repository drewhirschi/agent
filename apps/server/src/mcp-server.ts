import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type { Request, Response } from 'express';
import {
  listFilesTool,
  readFileTool,
  writeFileTool,
  executeCommandTool,
  analyzeFunctionsTool,
  grepTool,
  tailTool,
  readLinesTool,
  parseJsonTool,
} from './tools/index.js';

// MCP Server instance
const server = new Server(
  {
    name: 'sandbox-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all available tools
const tools = {
  listFiles: listFilesTool,
  readFile: readFileTool,
  writeFile: writeFileTool,
  executeCommand: executeCommandTool,
  analyzeFunctions: analyzeFunctionsTool,
  grep: grepTool,
  tail: tailTool,
  readLines: readLinesTool,
  parseJson: parseJsonTool,
};

// Register list tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'listFiles',
        description:
          'List files and directories in a given path. Use "/" for current directory.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Directory path to list (e.g., "/" or "/src")',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'readFile',
        description:
          'Read the complete contents of a file. For large files, consider using readLines or tail instead.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to read',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'writeFile',
        description:
          'Write content to a file. Creates the file if it does not exist.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to write to',
            },
            content: {
              type: 'string',
              description: 'Content to write to the file',
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'executeCommand',
        description:
          'Execute a shell command. Output is redirected to files to keep context clean. Returns file paths and summary.',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Shell command to execute',
            },
            workingDir: {
              type: 'string',
              description: 'Working directory (optional, defaults to /workspace)',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'analyzeFunctions',
        description:
          'Analyze a TypeScript file to extract function definitions, parameters, return types, and documentation. Much faster than reading the full file.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'TypeScript file path to analyze',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'grep',
        description:
          'Search for patterns in files using grep. Useful for finding specific content.',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Pattern to search for',
            },
            path: {
              type: 'string',
              description: 'File or directory to search in',
            },
            caseInsensitive: {
              type: 'boolean',
              description: 'Case insensitive search (default: false)',
            },
            lineNumbers: {
              type: 'boolean',
              description: 'Show line numbers (default: true)',
            },
          },
          required: ['pattern', 'path'],
        },
      },
      {
        name: 'tail',
        description:
          'Read the last N lines of a file. Useful for checking recent output.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to read',
            },
            lines: {
              type: 'number',
              description: 'Number of lines to read (default: 20)',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'readLines',
        description:
          'Read specific line range from a file. Useful for reading sections of large files.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'File path to read',
            },
            start: {
              type: 'number',
              description: 'Start line number (1-based)',
            },
            end: {
              type: 'number',
              description: 'End line number (1-based)',
            },
          },
          required: ['path', 'start', 'end'],
        },
      },
      {
        name: 'parseJson',
        description:
          'Parse and query JSON files using jq. Useful for extracting specific data from JSON.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'JSON file path',
            },
            query: {
              type: 'string',
              description: 'jq query (e.g., ".users[0].name" or ".")',
            },
          },
          required: ['path', 'query'],
        },
      },
    ],
  };
});

// Register call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!tools[name as keyof typeof tools]) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    const result = await tools[name as keyof typeof tools](args as any);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: error.message || 'Tool execution failed',
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// SSE endpoint handler
export async function handleSSE(req: Request, res: Response) {
  const transport = new SSEServerTransport('/message', res);
  await server.connect(transport);
  
  // Handle client disconnect
  req.on('close', () => {
    server.close();
  });
}

export { server };

