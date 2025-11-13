import { tool } from 'ai';
import { z } from 'zod';
import type { MCPClient, MCPTool } from './mcp-client';

/**
 * Convert MCP input schema to Zod schema
 */
function mcpSchemaToZod(schema: any): z.ZodType<any> {
  if (!schema || schema.type !== 'object') {
    return z.any();
  }

  const shape: Record<string, z.ZodType<any>> = {};

  for (const [key, prop] of Object.entries(schema.properties || {})) {
    const propSchema = prop as any;
    let zodType: z.ZodType<any>;

    switch (propSchema.type) {
      case 'string':
        zodType = z.string();
        break;
      case 'number':
        zodType = z.number();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      case 'array':
        zodType = z.array(z.any());
        break;
      case 'object':
        zodType = z.object({}).passthrough();
        break;
      default:
        zodType = z.any();
    }

    // Add description if available
    if (propSchema.description) {
      zodType = zodType.describe(propSchema.description);
    }

    // Make optional if not required
    if (!schema.required?.includes(key)) {
      zodType = zodType.optional();
    }

    shape[key] = zodType;
  }

  return z.object(shape);
}

/**
 * Convert MCP tools to AI SDK tools
 */
export function bridgeMCPToolsToAISDK(
  mcpClient: MCPClient,
  mcpTools: MCPTool[]
): Record<string, ReturnType<typeof tool>> {
  const aiSdkTools: Record<string, ReturnType<typeof tool>> = {};

  for (const mcpTool of mcpTools) {
    aiSdkTools[mcpTool.name] = tool({
      description: mcpTool.description,
      inputSchema: mcpSchemaToZod(mcpTool.inputSchema),
      execute: async (args: any) => {
        return await mcpClient.callTool(mcpTool.name, args);
      },
    });
  }

  return aiSdkTools;
}

