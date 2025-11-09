# Dev Container Quick Start

## 1️⃣ Open in Dev Container

**Option A: VS Code Command Palette**
1. Open this repo in VS Code
2. Press `F1` or `Ctrl+Shift+P` (Windows/Linux) / `Cmd+Shift+P` (Mac)
3. Type: `Dev Containers: Reopen in Container`
4. Wait 3-5 minutes for first-time setup

**Option B: VS Code Notification**
1. Open this repo in VS Code
2. Click "Reopen in Container" in the notification popup

## 2️⃣ Configure API Key

Once the container is ready:

```bash
# Edit the env file
code apps/example/.env.local

# Add your OpenAI API key:
OPENAI_API_KEY=sk-your-actual-key-here
```

## 3️⃣ Start the App

```bash
cd apps/example
bun run dev
```

## 4️⃣ Open Browser

VS Code will show a notification about port 3000.
Click "Open in Browser" or navigate to: http://localhost:3000

## ✅ You're Ready!

Try asking the AI assistant:
- "Show me my account balance"
- "Can I afford a Tesla?"
- "What's my burn rate?"

## 🛠️ Development Workflow

```bash
# Build all packages
bun run build

# Format code
bun run format

# Create a changeset
bun run changeset

# Access Redis CLI (local Redis is running)
redis-cli
```

## 🐛 Troubleshooting

**Dependencies not installed?**
```bash
bun install
bun run build
```

**Port already in use?**
- Kill local processes on port 3000/6379
- Or change ports in `.devcontainer/devcontainer.json`

**Need to rebuild?**
- Press `F1` → `Dev Containers: Rebuild Container`

## 📚 Learn More

- [Full README](.devcontainer/README.md)
- [Example App](../apps/example/README.md)
- [Agents Package](../packages/agents/README.md)

