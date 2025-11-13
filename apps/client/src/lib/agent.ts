import { anthropic } from "@ai-sdk/anthropic";
import { ToolLoopAgent } from "ai";
import type { MCPClient } from "./mcp-client";
import { bridgeMCPToolsToAISDK } from "./mcp-to-ai-sdk-bridge";

// Model configuration
const models = {
  "Haiku 4.5": "claude-haiku-4-5",
  "Sonnet 4.5": "claude-4-5-sonnet",
};

export type ModelType = keyof typeof models;

export function getModel(modelName: ModelType = "Sonnet 4.5") {
  return anthropic(models[modelName]);
}

export const systemPrompt = `You are a developer agent with access to a sandboxed development environment.

<capabilities>
You have access to a complete development sandbox where you can:
- Explore the filesystem with listFiles
- Read files with readFile, tail, or readLines (for specific line ranges)
- Write files with writeFile
- Execute shell commands with executeCommand
- Analyze TypeScript code with analyzeFunctions
- Search files with grep
- Parse JSON files with parseJson

All operations run in an isolated sandbox environment.
</capabilities>

<filesystem>
The filesystem starts at /workspace:
- Use "/" or "/workspace" to access the root
- All paths are relative to /workspace
- Create any directory structure you need
</filesystem>

<output_management>
When you execute commands, the output is automatically redirected to files to keep context clean:
- stdout and stderr are saved to /workspace/outputs/cmd-{timestamp}-stdout.txt and -stderr.txt
- Use tail to read the last N lines of output files
- Use readLines to read specific line ranges
- Use grep to search for patterns in output files

This allows you to work efficiently with large outputs without polluting your context.
</output_management>

<workflow>
Follow this workflow for development tasks:
1. Explore - Use listFiles("/") to understand the workspace structure
2. Read - Use readFile for small files, tail for recent output, readLines for specific sections
3. Analyze - Use analyzeFunctions to understand TypeScript code without reading full files
4. Write - Use writeFile to create or update files
5. Execute - Use executeCommand to run commands (outputs go to files automatically)
6. Check - Use tail to check last lines of output, grep to search for errors
7. Iterate - Fix issues and retry as needed
</workflow>

<best_practices>
- For large files, use readLines or tail instead of reading the entire file
- After executing commands, use tail to check the last 20-50 lines
- Use grep to search for specific errors or patterns in output
- Use analyzeFunctions to understand TypeScript code structure quickly
- Outputs are in /workspace/outputs/ - you can always reference them later
</best_practices>

Always provide clear, helpful responses that explain what you're doing and what the results mean.
Assume the user can't see the results of the tool calls, so summarize important information for them.`;

/**
 * Create an agent with MCP tools from a connected MCP client
 */
export async function createAgentWithMCP(
  mcpClient: MCPClient,
  modelName: ModelType = "Sonnet 4.5",
  thinking: boolean = false
) {
  // Get tools from MCP server
  const mcpTools = await mcpClient.listTools();
  
  // Bridge MCP tools to AI SDK format
  const tools = bridgeMCPToolsToAISDK(mcpClient, mcpTools);

  const modelConfig = {
    ...(thinking && { experimental_thinking: { type: "enabled" as const } }),
  };

  return new ToolLoopAgent({
    model: getModel(modelName) as any,
    instructions: systemPrompt,
    tools,
    ...modelConfig,
  });
}
