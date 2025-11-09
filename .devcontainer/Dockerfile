# Use official Node.js image as base
FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        redis-tools \
        curl \
        git \
        vim \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Switch to node user for the rest
USER node

# Install Bun (will be done in post-create script, but we can cache it here)
RUN curl -fsSL https://bun.sh/install | bash



# Set working directory
WORKDIR /workspaces/ai-sdk-tools

