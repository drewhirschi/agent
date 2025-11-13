# MCP Sandbox Quick Start

Get your MCP-powered AI agent running in a sandbox environment in minutes.

## Installation

```bash
# Install dependencies
bun install

# Setup Vercel (for production mode)
vercel link
vercel env pull
```

## Local Development (Recommended for Testing)

Run both the MCP server and client locally:

### Terminal 1: Start MCP Server
```bash
cd apps/server
bun run dev
```

You should see:
```
🚀 MCP Server running on http://localhost:3002
   SSE endpoint: http://localhost:3002/sse
   Health check: http://localhost:3002/health
```

### Terminal 2: Start Client
```bash
cd apps/client
USE_LOCAL=true bun run dev
```

Visit `http://localhost:3001/sandbox-demo` to see the demo.

## Production Mode (Vercel Sandbox)

In production, the sandbox is created automatically:

```bash
cd apps/client
bun run dev
```

The client will:
1. ✅ Create a Vercel Sandbox
2. ✅ Deploy the MCP server into it
3. ✅ Install dependencies
4. ✅ Start the server
5. ✅ Connect and provide tools to the AI

Visit `http://localhost:3001/sandbox-demo` to test.

## What You Can Do

The AI agent has access to a complete development sandbox with these tools:

### File Operations
- **listFiles** - Browse directory structure
- **readFile** - Read entire files
- **writeFile** - Create or update files
- **readLines** - Read specific line ranges (efficient for large files)

### Code Analysis
- **analyzeFunctions** - Extract TypeScript function signatures and docs

### Execution
- **executeCommand** - Run any shell command (output saved to files)

### Utilities
- **tail** - Read last N lines (great for checking command output)
- **grep** - Search for patterns
- **parseJson** - Query JSON files with jq

### Example Queries

Try asking the agent:

1. **"List all files in the workspace"**
   - Uses `listFiles` tool

2. **"Create a simple Node.js HTTP server"**
   - Uses `writeFile` to create server.js
   - Uses `executeCommand` to test it

3. **"Search for 'TODO' comments in all TypeScript files"**
   - Uses `grep` with pattern matching

4. **"Show me the last 20 lines of the previous command output"**
   - Uses `tail` on output files

5. **"Create a package.json and install express"**
   - Uses `writeFile` to create package.json
   - Uses `executeCommand` to run npm install
   - Uses `tail` to verify installation

## Architecture

```
┌─────────────────────────────────────────┐
│ Your Browser                            │
│ ┌─────────────────────────────────────┐ │
│ │ Next.js Client                      │ │
│ │ - Sandbox Orchestrator              │ │
│ │ - MCP Client (connects via SSE)     │ │
│ │ - AI Agent (Vercel AI SDK)          │ │
│ └─────────────────────────────────────┘ │
└───────────────┬─────────────────────────┘
                │ SSE Connection
                ▼
    ┌───────────────────────────┐
    │ Vercel Sandbox            │
    │ ┌───────────────────────┐ │
    │ │ MCP Server (Express)  │ │
    │ │ - SSE Endpoint        │ │
    │ │ - 9 Tools Available   │ │
    │ └───────────────────────┘ │
    │ ┌───────────────────────┐ │
    │ │ Filesystem            │ │
    │ │ /workspace/          │ │
    │ │ /outputs/            │ │
    │ └───────────────────────┘ │
    └───────────────────────────┘
```

## Key Features

### Clean Context Management
Command outputs are automatically saved to files:
```
/workspace/outputs/cmd-1234567890-stdout.txt
/workspace/outputs/cmd-1234567890-stderr.txt
```

The agent intelligently reads only what it needs using `tail`, `grep`, or `readLines`.

### Isolated Environment
Everything runs in a fresh Vercel Sandbox:
- 4 vCPUs
- node22 runtime
- 45-minute timeout
- Isolated filesystem
- No access to production

### Seamless Integration
MCP tools are automatically converted to Vercel AI SDK tool format, allowing the agent to use them naturally.

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

**For local development:**
```env
USE_LOCAL=true
NEXT_PUBLIC_USE_LOCAL=true
```

**For production:**
```env
NEXT_PUBLIC_REPO_URL=https://github.com/your-username/your-repo.git
```

### Customizing the Agent

Edit `apps/client/src/lib/agent.ts` to modify:
- System prompt
- Model selection (Haiku 4.5 or Sonnet 4.5)
- Thinking mode

```typescript
const agent = await createAgentWithMCP(
  mcpClient,
  'Sonnet 4.5',  // Model
  true           // Enable thinking mode
);
```

## Troubleshooting

### Port 3002 already in use
```bash
# Kill the process using port 3002
lsof -ti:3002 | xargs kill -9
```

### Sandbox creation fails
```bash
# Refresh Vercel credentials
vercel env pull
```

### Connection timeout
- Wait 30-60 seconds for sandbox to fully start
- Check health endpoint: `curl http://localhost:3002/health`

### Command not found in sandbox
Commands run with the `vercel-sandbox` user. Install packages:
```typescript
await mcpClient.callTool('executeCommand', {
  command: 'sudo dnf install -y package-name'
});
```

## Next Steps

1. **Integrate into your app**: Use `SandboxStatus` component and `createAgentWithMCP`
2. **Add custom tools**: Extend `apps/server/src/tools/` with your own tools
3. **Deploy to Vercel**: Deploy the client, sandboxes created automatically
4. **Monitor usage**: Check Vercel dashboard for sandbox compute usage

## Learn More

- [Full Documentation](./SANDBOX_SETUP.md)
- [Vercel Sandbox Docs](https://vercel.com/docs/vercel-sandbox)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/)

## Support

Questions? Issues? Check:
1. MCP server logs in Terminal 1
2. Client logs in browser console
3. Sandbox health: `http://localhost:3002/health`

