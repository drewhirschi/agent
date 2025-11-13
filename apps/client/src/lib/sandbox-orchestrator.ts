import { Sandbox } from '@vercel/sandbox';
import ms from 'ms';

export interface SandboxSession {
  sandbox: Sandbox;
  url: string;
  ready: boolean;
}

const USE_LOCAL = process.env.USE_LOCAL === 'true' || process.env.NEXT_PUBLIC_USE_LOCAL === 'true';
const LOCAL_URL = 'http://localhost:3002';

/**
 * Create a new sandbox session and deploy the MCP server
 */
export async function createSandboxSession(
  onProgress?: (message: string) => void
): Promise<SandboxSession> {
  // Local mode - skip sandbox creation
  if (USE_LOCAL) {
    onProgress?.('Using local MCP server');
    
    // Wait for local server to be ready
    const ready = await waitForHealth(LOCAL_URL);
    if (!ready) {
      throw new Error('Local MCP server is not responding at ' + LOCAL_URL);
    }
    
    return {
      sandbox: null as any, // No sandbox in local mode
      url: LOCAL_URL,
      ready: true,
    };
  }

  // Production mode - create Vercel Sandbox
  onProgress?.('Creating Vercel Sandbox...');

  const sandbox = await Sandbox.create({
    source: {
      // Clone the repo containing the MCP server
      url: process.env.NEXT_PUBLIC_REPO_URL || 'https://github.com/your-repo/agent.git',
      type: 'git',
    },
    resources: {
      vcpus: 4,
    },
    timeout: ms('45m'), // 45 minutes (hobby tier max)
    ports: [3002],
    runtime: 'node22',
  });

  onProgress?.('Sandbox created, installing dependencies...');

  // Navigate to the server directory
  const install = await sandbox.runCommand({
    cmd: 'npm',
    args: ['install', '--loglevel', 'info'],
    cwd: '/vercel/sandbox/apps/server',
    stderr: 'pipe',
    stdout: 'pipe',
  });

  if (install.exitCode !== 0) {
    throw new Error('Failed to install dependencies: ' + install.stderr);
  }

  onProgress?.('Dependencies installed, starting MCP server...');

  // Start the MCP server
  await sandbox.runCommand({
    cmd: 'npm',
    args: ['run', 'start'],
    cwd: '/vercel/sandbox/apps/server',
    stderr: 'pipe',
    stdout: 'pipe',
    detached: true,
  });

  // Wait a bit for the server to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const url = sandbox.domain(3002);

  onProgress?.('Waiting for MCP server to be ready...');

  // Poll health endpoint
  const ready = await waitForHealth(url);
  if (!ready) {
    throw new Error('MCP server failed to start');
  }

  onProgress?.('MCP server is ready!');

  return {
    sandbox,
    url,
    ready: true,
  };
}

/**
 * Stop a sandbox session
 */
export async function stopSandboxSession(session: SandboxSession): Promise<void> {
  if (session.sandbox) {
    await session.sandbox.stop();
  }
}

/**
 * Wait for the health endpoint to respond
 */
async function waitForHealth(baseUrl: string, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'ok') {
          return true;
        }
      }
    } catch (error) {
      // Ignore errors and retry
    }
    
    // Wait 1 second before next attempt
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  
  return false;
}

