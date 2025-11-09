# Dev Container for AI SDK Tools

This Dev Container provides a complete development environment for the AI SDK Tools monorepo.

## What's Included

- **Node.js 22** - Latest LTS version
- **Bun** - Fast JavaScript runtime and package manager
- **Redis** - Local Redis instance for testing memory features
- **VS Code Extensions** - Pre-configured extensions for TypeScript, Biome, Tailwind CSS
- **Git Configuration** - Ready for commits and changesets

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com/)
- [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Setup

1. **Open in Dev Container**
   - Open this folder in VS Code
   - Press `F1` → `Dev Containers: Reopen in Container`
   - Wait for the container to build and setup (first time takes ~5 minutes)

2. **Configure API Keys**
   - Edit `.devcontainer/.env.local` and add your `OPENAI_API_KEY`
   - This file is mounted into the example app automatically

3. **Start Development**
   ```bash
   cd apps/example
   bun run dev
   ```
   
4. **Open the App**
   - Navigate to http://localhost:3000
   - The port is automatically forwarded

## Available Services

- **Port 3000** - Example Next.js app
- **Port 6379** - Redis (for local memory persistence)

## Useful Commands

```bash
# Build all packages
bun run build

# Start example app
cd apps/example && bun run dev

# Create a changeset
bun run changeset

# Run tests (if available)
bun test

# Format code
bun run format
```

## Redis Configuration

The dev container includes a local Redis instance. To use it instead of in-memory storage:

1. The Redis service runs automatically at `localhost:6379`
2. You can connect to it using `redis-cli` in the terminal
3. For production, use Upstash Redis by adding credentials to `.env.local`

## Troubleshooting

### Container won't start
- Make sure Docker is running
- Try: `Dev Containers: Rebuild Container` (F1 menu)

### Port already in use
- Stop any local processes using ports 3000 or 6379
- Or change ports in `.devcontainer/devcontainer.json`

### Dependencies not installing
- Open terminal in VS Code and run:
  ```bash
  bun install
  bun run build
  ```

### Environment variables not loading
- Check `.devcontainer/.env.local` exists and has valid values
- Restart the dev container after editing env vars

## Customization

- **Add VS Code extensions**: Edit `devcontainer.json` → `customizations.vscode.extensions`
- **Change Node version**: Edit `devcontainer.json` → `image` version number
- **Add system packages**: Edit `Dockerfile` → `apt-get install` section
- **Modify ports**: Edit `devcontainer.json` → `forwardPorts` array

## Learn More

- [Dev Containers Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- [AI SDK Tools README](../README.md)
- [Example App README](../apps/example/README.md)

