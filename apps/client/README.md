# Client Application

Next.js 16 frontend application for the AI Developer Agent.

## Features

- **LangGraph Integration**: Full visibility into agent operations and LLM calls
- **Model Selection**: Choose between Claude Sonnet 4.5 (intelligent) or Haiku 4.5 (fast)
- **Multi-turn Execution**: Up to 20 turns per conversation
- **File Exploration**: Discover available server functions
- **Code Generation**: Write TypeScript files that import and use server functions
- **Code Execution**: Run generated code using bun
- **Error Recovery**: Agent can see errors and fix code automatically

## Development

```bash
# From root
bun run dev:client

# From this directory
bun run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

## Environment Variables

Create a `.env.local` file:

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional but Recommended: LangSmith for advanced tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key_here
LANGCHAIN_PROJECT=agent-dev
```

## Model Selection

Use the dropdown in the header to switch between models:

- **Sonnet 4.5** - More intelligent, better for complex reasoning
- **Haiku 4.5** - Faster responses, great for simple tasks

## LangSmith Dashboard

Visit [https://smith.langchain.com/](https://smith.langchain.com/) to see:
- Real-time trace visualization
- Token usage and costs
- Latency metrics
- Error tracking

## Building

```bash
bun run build
```

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Radix UI Components
- LangGraph
- Anthropic Claude 4.5

