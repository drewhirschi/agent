'use client';

import { useEffect, useState } from 'react';
import { createSandboxSession, type SandboxSession } from '@/lib/sandbox-orchestrator';
import { createMCPClient, type MCPClient } from '@/lib/mcp-client';

export type SandboxState = 
  | 'idle'
  | 'creating'
  | 'installing'
  | 'starting'
  | 'connecting'
  | 'ready'
  | 'error';

interface SandboxStatusProps {
  onReady?: (mcpClient: MCPClient, session: SandboxSession) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
}

export function SandboxStatus({ onReady, onError, autoStart = false }: SandboxStatusProps) {
  const [state, setState] = useState<SandboxState>('idle');
  const [message, setMessage] = useState<string>('');
  const [session, setSession] = useState<SandboxSession | null>(null);
  const [mcpClient, setMcpClient] = useState<MCPClient | null>(null);

  const startSandbox = async () => {
    try {
      setState('creating');
      setMessage('Initializing sandbox environment...');

      // Create sandbox session
      const newSession = await createSandboxSession((progress) => {
        setMessage(progress);
        
        if (progress.includes('installing')) {
          setState('installing');
        } else if (progress.includes('starting')) {
          setState('starting');
        }
      });

      setSession(newSession);
      setState('connecting');
      setMessage('Connecting to MCP server...');

      // Connect MCP client
      const client = await createMCPClient(newSession.url);
      setMcpClient(client);

      setState('ready');
      setMessage(`Connected to sandbox at ${newSession.url}`);

      // Notify parent
      if (onReady) {
        onReady(client, newSession);
      }
    } catch (error: any) {
      setState('error');
      setMessage(`Error: ${error.message}`);
      
      if (onError) {
        onError(error);
      }
    }
  };

  useEffect(() => {
    if (autoStart && state === 'idle') {
      startSandbox();
    }
  }, [autoStart, state]);

  const getStateColor = () => {
    switch (state) {
      case 'idle':
        return 'text-gray-500';
      case 'creating':
      case 'installing':
      case 'starting':
      case 'connecting':
        return 'text-yellow-500';
      case 'ready':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'idle':
        return '○';
      case 'creating':
      case 'installing':
      case 'starting':
      case 'connecting':
        return '◐';
      case 'ready':
        return '●';
      case 'error':
        return '✕';
      default:
        return '○';
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg bg-card">
      <div className={`text-2xl ${getStateColor()} animate-pulse`}>
        {getStateIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Sandbox Status:</span>
          <span className={`capitalize ${getStateColor()}`}>{state}</span>
        </div>
        {message && (
          <div className="text-sm text-muted-foreground mt-1">{message}</div>
        )}
      </div>
      {state === 'idle' && !autoStart && (
        <button
          onClick={startSandbox}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Start Sandbox
        </button>
      )}
      {state === 'error' && (
        <button
          onClick={startSandbox}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function useSandbox(autoStart = false) {
  const [state, setState] = useState<SandboxState>('idle');
  const [session, setSession] = useState<SandboxSession | null>(null);
  const [mcpClient, setMcpClient] = useState<MCPClient | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleReady = (client: MCPClient, session: SandboxSession) => {
    setMcpClient(client);
    setSession(session);
    setState('ready');
  };

  const handleError = (err: Error) => {
    setError(err);
    setState('error');
  };

  return {
    state,
    session,
    mcpClient,
    error,
    SandboxStatus: (
      <SandboxStatus
        onReady={handleReady}
        onError={handleError}
        autoStart={autoStart}
      />
    ),
  };
}

