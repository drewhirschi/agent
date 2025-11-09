#!/bin/bash
set -e

echo "🚀 Setting up AI SDK Tools Dev Container..."

# Install Bun
echo "📦 Installing Bun..."
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install pnpm (alternative package manager)
echo "📦 Installing pnpm..."
npm install -g pnpm

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build all packages
echo "🔨 Building packages..."
bun run build

# Copy env example if .env.local doesn't exist
if [ ! -f "apps/example/.env.local" ]; then
  echo "📝 Creating .env.local from template..."
  cp apps/example/.env.local.example apps/example/.env.local
  echo ""
  echo "⚠️  IMPORTANT: Edit apps/example/.env.local and add your OPENAI_API_KEY"
  echo "   You can also copy .devcontainer/env.local.template and customize it"
fi

# Setup git hooks (optional)
echo "🪝 Setting up git..."
git config --local core.autocrlf false

echo ""
echo "✅ Dev Container setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit apps/example/.env.local and add your OPENAI_API_KEY"
echo "   2. Run: bun run dev (in apps/example directory)"
echo "   3. Open http://localhost:3000"
echo ""
echo "🛠️  Available commands:"
echo "   bun run build        - Build all packages"
echo "   bun run dev          - Start development servers"
echo "   bun run changeset    - Create a changeset"
echo ""

