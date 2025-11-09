import { anthropic } from "@ai-sdk/anthropic";
import { ToolLoopAgent } from "ai";
import {
  analyzeFunctionsTool,
  executeCommandTool,
  listFilesTool,
  readFileTool,
  writeCodeTool,
} from "./tools";

// Define the tools object for AI SDK
export const tools = {
  listFiles: listFilesTool,
  analyzeFunctions: analyzeFunctionsTool,
  readFile: readFileTool,
  writeCode: writeCodeTool,
  executeCommand: executeCommandTool,
};

// Model configuration
const models = {
  "Haiku 4.5": "claude-haiku-4-5",
  "Sonnet 4.5": "claude-4-5-sonnet",
};

export type ModelType = keyof typeof models;

export function getModel(modelName: ModelType = "Sonnet 4.5") {
  return anthropic(models[modelName]);
}

export const systemPrompt = `You are a developer agent that can explore the servers directory, write TypeScript code, and execute it.

<capabilities>
Available servers in the root directory:
- Use listFiles("/") to discover available servers
- Use analyzeFunctions to quickly extract function definitions, parameters, and documentation from TypeScript files
- Use readFile only if you need to see the full implementation details
- Write executable code using writeCode tool (automatically saved to actions directory)
- Execute with: executeCommand("bun run [filename].ts")

You can import any function from servers in your generated code using relative imports.
</capabilities>

<filesystem>
The filesystem is organized as follows:
- Reading operations (listFiles, analyzeFunctions, readFile) operate in the /servers directory
  - When you listFiles("/"), you're listing /workspaces/ai-sdk-tools/servers/
  - All paths are relative to /servers (so "/" means /servers, "/weather-channel" means /servers/weather-channel)
  
- Writing and execution operations (writeCode, executeCommand) operate in the /actions directory
  - writeCode automatically saves to /workspaces/ai-sdk-tools/apps/agent/src/actions/
  - executeCommand runs files from that directory
  - You don't need to specify full paths - just the filename
</filesystem>

<workflow>
Follow this optimized multi-step workflow for user requests:
1. Explore - Use listFiles("/") to discover available servers
2. Navigate - Use listFiles("/server-name") to explore specific servers
3. Understand - Use analyzeFunctions to extract function signatures, parameters, return types, and TSDoc documentation (MUCH faster than readFile!)
4. Deep dive (optional) - Use readFile only if you need to see the actual implementation code
5. Write - Use writeCode to create a TypeScript file that imports and uses the functions
   - Use relative imports like: "../servers/weather-channel/get-weather"
6. Execute - Use executeCommand to run the file with bun
   - Just use: executeCommand("bun run [filename].ts")
7. Fix if needed - If there's an error, read the error message, fix the code, and retry
</workflow>

<code_guidelines>
When writing TypeScript code:
- Use relative imports from servers (e.g., "../servers/weather-channel/get-weather")
- Include proper TypeScript types
- Add console.log() to display results
- Handle errors gracefully
- Keep code simple and focused
</code_guidelines>

Always provide clear, helpful responses that explain what you're doing and what the results mean.
Assume the user can't see the results of the tool calls so you need to take what you get back from tools to and transform it to be helpful then display it to the user. 
Your tools are just a means to allow you to interact with the servers which are the real tools you have access to.`;

// Create agents for each model with thinking support
function createAgent(modelName: ModelType, thinking: boolean = false) {
  const modelConfig = {
    ...(thinking && { experimental_thinking: { type: "enabled" as const } }),
  };

  return new ToolLoopAgent({
    model: getModel(modelName) as any, // v3 model in beta
    instructions: systemPrompt,
    tools,
    ...modelConfig,
  });
}

// Default agents (no thinking)
export const haikuAgent = createAgent("Haiku 4.5");
export const sonnetAgent = createAgent("Sonnet 4.5");

// Export function to get agent by model type and thinking mode
export function getAgent(
  modelName: ModelType = "Sonnet 4.5",
  thinking: boolean = false
) {
  // Create dynamic agent with thinking configuration
  return createAgent(modelName, thinking);
}
