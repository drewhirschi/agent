# AI Developer Agent

A LangGraph-powered agent that can explore the `servers/` directory, discover functions, write TypeScript code, and execute it using bun.

## Features

- **LangGraph Integration**: Full visibility into agent operations and LLM calls
- **Model Selection**: Choose between Claude Sonnet 4.5 (intelligent) or Haiku 4.5 (fast)
- **Multi-turn Execution**: Up to 20 turns per conversation
- **File Exploration**: Discover available server functions
- **Code Generation**: Write TypeScript files that import and use server functions
- **Code Execution**: Run generated code using bun
- **Error Recovery**: Agent can see errors and fix code automatically

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create `.env.local` file with your API keys:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add:
```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional but Recommended: LangSmith for advanced tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_key_here
LANGCHAIN_PROJECT=agent-dev
```

**Get LangSmith API Key:**
- Sign up at [https://smith.langchain.com/](https://smith.langchain.com/)
- Free tier includes 5,000 traces/month
- Navigate to Settings → API Keys
- Create a new API key

3. Run the development server:
```bash
bun run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

### Model Selection

Use the dropdown in the header to switch between models:

- **Sonnet 4.5** - More intelligent, better for complex reasoning and code generation
- **Haiku 4.5** - Faster responses, great for simple tasks and quick iterations

The model selection is applied per-request, so you can switch between them at any time!

### LangSmith Dashboard

Once configured, visit [https://smith.langchain.com/](https://smith.langchain.com/) to see:
- Real-time trace visualization
- Token usage and costs
- Latency metrics
- Error tracking
- Shareable trace links

## How It Works

The agent has access to 5 tools:

1. **listFiles** - List files and directories in the `servers/` folder
2. **analyzeFunctions** - Parse TypeScript files to extract function definitions, parameters, return types, and TSDoc/JSDoc documentation (fast!)
3. **readFile** - Read full file contents (use only when you need implementation details)
4. **writeCode** - Write TypeScript code to the `actions/` directory
5. **executeCommand** - Execute shell commands (primarily for running generated code with bun)

### Example Workflow

User: "Get the weather for Stockholm"

The agent will:
1. List files in `/workspaces/ai-sdk-tools/servers/weather-channel/`
2. **Analyze** `get-weather.ts` to extract the function signature and documentation
   ```typescript
   {
     name: "getWeather",
     parameters: [
       { name: "location", type: "WeatherLocation | string", optional: false }
     ],
     returnType: "WeatherDetails",
     description: "Mock function to get weather details for a given location"
   }
   ```
3. Write a TypeScript file that imports and calls `getWeather("Stockholm")`
4. Execute the file with `bun run`
5. Return the weather data to the user

**Why analyzeFunctions is better than readFile:**
- ⚡ **Much faster** - Only parses function signatures, not the entire file
- 📝 **Structured data** - Returns typed JSON with parameters, types, and docs
- 🎯 **Focused** - Agent gets exactly what it needs to understand how to call the function

## Architecture

- **LangGraph**: Manages agent workflow and provides full observability
- **Claude 4.5 Sonnet**: Powers the agent's reasoning and code generation
- **Next.js 16**: Frontend and API routes
- **Bun**: Fast TypeScript execution

## Generated Files

All generated code is saved to `/workspaces/ai-sdk-tools/actions/` with timestamped filenames (e.g., `1699564789-weather-check.ts`). These files are gitignored.

