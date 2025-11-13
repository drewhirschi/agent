# MCP Sandbox Server Setup

This project implements an MCP (Model Context Protocol) server that runs inside a Vercel Sandbox, providing the AI agent with a complete development environment.

## Architecture

```
Client (Next.js)                    Vercel Sandbox
┌──────────────────┐               ┌────────────────┐
│ 1. Orchestrator  │──creates───▶  │                │
│    - Create      │               │ MCP Server     │
│    - Deploy code │               │ (Express)      │
│    - Start server│               │ - SSE endpoint │
│                  │               │ - MCP tools    │
│ 2. MCP Client    │──connects──▶  │                │
│    - SSE conn    │     via       │ Filesystem     │
│    - Bridge AI   │   sandbox URL │ - /workspace/  │
│      SDK tools   │               │ - /outputs/    │
└──────────────────┘               └────────────────┘
```

## Components

### MCP Server (`apps/server`)

A standalone Express server with MCP protocol support that provides:

**Core Tools:**
- `listFiles` - List directory contents
- `readFile` - Read complete file contents
- `writeFile` - Write content to files
- `executeCommand` - Run shell commands (output redirected to files)
- `analyzeFunctions` - Parse TypeScript code and extract function signatures

**Utility Tools:**
- `grep` - Search for patterns in files
- `tail` - Read last N lines of a file
- `readLines` - Read specific line range from a file
- `parseJson` - Query JSON files with jq

**Key Features:**
- Command outputs automatically redirected to `/workspace/outputs/` to keep context clean
- Runs in isolated Vercel Sandbox with node22 runtime
- SSE transport for real-time communication

### Client (`apps/client`)

**Sandbox Orchestrator** (`src/lib/sandbox-orchestrator.ts`):
- Creates Vercel Sandbox sessions
- Deploys MCP server into sandbox
- Monitors health and readiness
- Supports local mode for development

**MCP Client** (`src/lib/mcp-client.ts`):
- Connects to MCP server via SSE
- Lists available tools
- Calls tools with parameters
- Handles reconnection

**Bridge** (`src/lib/mcp-to-ai-sdk-bridge.ts`):
- Converts MCP tools to Vercel AI SDK tool format
- Enables seamless integration with AI agents

## Setup

### Prerequisites

1. Install dependencies:
```bash
bun install
```

2. For production mode, get Vercel OIDC token:
```bash
vercel link
vercel env pull
```

### Local Development

**Terminal 1 - Run MCP server locally:**
```bash
cd apps/server
bun run dev
```

**Terminal 2 - Run client with local mode:**
```bash
cd apps/client
USE_LOCAL=true bun run dev
```

In local mode, the client connects to `localhost:3002` instead of creating a sandbox.

### Production Mode

Simply run the client without `USE_LOCAL`:
```bash
cd apps/client
bun run dev
```

The client will:
1. Create a Vercel Sandbox
2. Clone the repository into the sandbox
3. Install dependencies
4. Start the MCP server
5. Connect and provide tools to the AI agent

## Usage Example

```typescript
import { createSandboxSession } from '@/lib/sandbox-orchestrator';
import { createMCPClient } from '@/lib/mcp-client';
import { createAgentWithMCP } from '@/lib/agent';

// Create sandbox and connect
const session = await createSandboxSession((progress) => {
  console.log(progress);
});

const mcpClient = await createMCPClient(session.url);

// Create AI agent with MCP tools
const agent = await createAgentWithMCP(mcpClient, 'Sonnet 4.5');

// Use the agent
const result = await agent.executeTask('List files in the workspace');
```

## UI Component

The `SandboxStatus` component provides a visual indicator:

```tsx
import { SandboxStatus, useSandbox } from '@/components/sandbox-status';

function MyComponent() {
  const { mcpClient, state, SandboxStatus } = useSandbox(true);
  
  return (
    <div>
      {SandboxStatus}
      {state === 'ready' && <ChatInterface mcpClient={mcpClient} />}
    </div>
  );
}
```

## Output Management

Commands executed via `executeCommand` automatically redirect output:

```typescript
// Execute a command
await mcpClient.callTool('executeCommand', {
  command: 'npm install lodash'
});
// Returns: { exitCode, outputFiles: { stdout, stderr }, summary }

// Read the output
await mcpClient.callTool('tail', {
  path: '/outputs/cmd-1234567890-stdout.txt',
  lines: 20
});
```

This keeps the AI context clean while allowing intelligent consumption of outputs.

## Environment Variables

### Server
- `WORKSPACE_ROOT` - Root directory for file operations (default: `/workspace`)
- `PORT` - Server port (default: `3002`)

### Client
- `USE_LOCAL` or `NEXT_PUBLIC_USE_LOCAL` - Use local server instead of sandbox
- `NEXT_PUBLIC_REPO_URL` - Git repository URL for sandbox deployment

## Tools Reference

### listFiles
```typescript
{ path: string }
// Returns: { files: Array<{name, type, path}>, count }
```

### readFile
```typescript
{ path: string }
// Returns: { content: string, size: number, lines: number }
```

### writeFile
```typescript
{ path: string, content: string }
// Returns: { success: boolean, path: string }
```

### executeCommand
```typescript
{ command: string, workingDir?: string }
// Returns: { exitCode, outputFiles: {stdout, stderr}, summary }
```

### tail
```typescript
{ path: string, lines?: number }
// Returns: { content: string, actualLines: number }
```

### grep
```typescript
{ pattern: string, path: string, caseInsensitive?: boolean }
// Returns: { matches: number, results: string[] }
```

### readLines
```typescript
{ path: string, start: number, end: number }
// Returns: { content: string, lineCount: number }
```

### parseJson
```typescript
{ path: string, query: string }
// Returns: { result: any, raw: string }
```

## Troubleshooting

### Server won't start
- Check port 3002 is not in use
- Verify dependencies are installed
- Check WORKSPACE_ROOT is accessible

### Sandbox creation fails
- Verify Vercel OIDC token is valid
- Check `vercel env pull` was run
- Ensure repository URL is accessible

### MCP connection timeout
- Wait for health endpoint to respond
- Check firewall/network settings
- Verify sandbox is running

## Security

- All operations run in isolated Vercel Sandbox
- No access to production systems
- File operations limited to `/workspace`
- Commands run with sandbox user privileges

## Limits

- Sandbox timeout: 45 minutes (hobby tier)
- Command timeout: 30 seconds
- Output buffer: 10MB
- Sandbox resources: 4 vCPUs, node22 runtime

