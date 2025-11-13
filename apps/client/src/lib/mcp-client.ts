import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export class MCPClient {
  private client: Client | null = null;
  private transport: SSEClientTransport | null = null;
  private connected = false;

  /**
   * Connect to an MCP server via SSE
   */
  async connect(serverUrl: string): Promise<void> {
    if (this.connected) {
      return;
    }

    // Create SSE transport
    this.transport = new SSEClientTransport(new URL(`${serverUrl}/sse`));

    // Create client
    this.client = new Client(
      {
        name: 'agent-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    // Connect
    await this.client.connect(this.transport);
    this.connected = true;
  }

  /**
   * List available tools from the MCP server
   */
  async listTools(): Promise<MCPTool[]> {
    if (!this.client || !this.connected) {
      throw new Error('MCP client is not connected');
    }

    const response = await this.client.listTools();
    return response.tools;
  }

  /**
   * Call a tool on the MCP server
   */
  async callTool(name: string, args: any): Promise<any> {
    if (!this.client || !this.connected) {
      throw new Error('MCP client is not connected');
    }

    const response = await this.client.callTool({ name, arguments: args });
    
    // Parse the response
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if (firstContent.type === 'text') {
        try {
          return JSON.parse(firstContent.text);
        } catch {
          return firstContent.text;
        }
      }
    }
    
    return null;
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      await this.client.close();
      this.connected = false;
      this.client = null;
      this.transport = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Create a new MCP client and connect to a server
 */
export async function createMCPClient(serverUrl: string): Promise<MCPClient> {
  const client = new MCPClient();
  await client.connect(serverUrl);
  return client;
}

