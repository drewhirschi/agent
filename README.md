# AI Developer Agent - Monorepo

A LangGraph-powered agent with a Next.js client and Express server, organized as a monorepo.

## 📁 Project Structure

```
agent/
├── apps/
│   ├── client/          # Next.js frontend application
│   └── server/          # Express backend server
├── packages/
│   └── shared/          # Shared utilities and types
├── scripts/             # Build and development scripts
└── package.json         # Root workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

1. Install dependencies for all workspaces:
```bash
bun install
```

2. Set up environment variables:
```bash
# Copy the template for client
cp apps/client/env.template apps/client/.env.local

# Create server env file
cp apps/server/.env.example apps/server/.env
```

3. Add your API keys to `apps/client/.env.local`:
```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional but Recommended: LangSmith for advanced tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key_here
LANGCHAIN_PROJECT=agent-dev
```

### Development

Run both client and server in development mode:
```bash
bun run dev
```

Or run them individually:
```bash
# Client only (Next.js on port 3001)
bun run dev:client

# Server only (Express on port 3002)
bun run dev:server
```

### Building

Build all applications:
```bash
bun run build
```

Or build individually:
```bash
bun run build:client
bun run build:server
```

## 📦 Workspaces

### Client (`apps/client`)

Next.js 16 application with:
- **LangGraph Integration**: Full visibility into agent operations
- **Model Selection**: Claude Sonnet 4.5 or Haiku 4.5
- **Multi-turn Execution**: Up to 20 turns per conversation
- **Modern UI**: Radix UI components with Tailwind CSS

**Available at**: [http://localhost:3001](http://localhost:3001)

See [apps/client/README.md](apps/client/README.md) for more details.

### Server (`apps/server`)

Express server with:
- RESTful API endpoints
- CORS enabled for client communication
- TypeScript with strict mode
- Hot reload in development

**Available at**: [http://localhost:3002](http://localhost:3002)

API Endpoints:
- `GET /health` - Health check
- `GET /api/hello` - Test endpoint
- `POST /api/data` - Example POST handler

### Shared (`packages/shared`)

Common utilities and types used across client and server:
- Shared TypeScript types
- Utility functions
- API response helpers

## 🛠️ Available Scripts

From the root directory:

| Command | Description |
|---------|-------------|
| `bun run dev` | Run all apps in development mode |
| `bun run dev:client` | Run only the client |
| `bun run dev:server` | Run only the server |
| `bun run build` | Build all apps |
| `bun run build:client` | Build only the client |
| `bun run build:server` | Build only the server |
| `bun run lint` | Lint all workspaces |
| `bun run format` | Format client code |

## 🏗️ Adding Dependencies

### Workspace-specific dependency:
```bash
# For client
cd apps/client && bun add package-name

# For server
cd apps/server && bun add package-name

# For shared
cd packages/shared && bun add package-name
```

### Root-level dependency (dev tools):
```bash
bun add -D package-name
```

## 📝 Agent Features

The agent has access to 5 tools:

1. **listFiles** - List files and directories in the `servers/` folder
2. **analyzeFunctions** - Parse TypeScript files to extract function signatures and docs
3. **readFile** - Read full file contents
4. **writeCode** - Write TypeScript code to the `actions/` directory
5. **executeCommand** - Execute shell commands

### Example Workflow

User: "Get the weather for Stockholm"

The agent will:
1. List files in the weather-channel server directory
2. Analyze function signatures
3. Generate TypeScript code
4. Execute and return results

## 🔧 Tech Stack

- **Monorepo**: Bun workspaces
- **Client**: Next.js 16, React 19, Tailwind CSS
- **Server**: Express, TypeScript
- **Agent**: LangGraph, Claude 4.5 (Anthropic)
- **Runtime**: Bun
- **Linting**: Biome

## 📚 Learn More

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Anthropic API](https://docs.anthropic.com/)

## 🤝 Contributing

Generated files are saved to `apps/client/actions/` with timestamped filenames and are gitignored.
