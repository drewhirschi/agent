# Use official Node.js 22 image as base (to match Vercel Sandbox node22)
FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

# Install additional tools to match Vercel Sandbox environment
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        redis-tools \
        curl \
        git \
        vim \
        jq \
        bzip2 \
        dnsutils \
        iputils-ping \
        libicu-dev \
        libjpeg-dev \
        libpng-dev \
        procps \
        tar \
        unzip \
        whois \
        zstd \
        sudo \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Switch to node user for the rest
USER node

# Install pnpm globally (Vercel Sandbox includes pnpm)
RUN npm install -g pnpm

# Install Bun (will be done in post-create script, but we can cache it here)
RUN curl -fsSL https://bun.sh/install | bash

# Set working directory
WORKDIR /development/sandbox