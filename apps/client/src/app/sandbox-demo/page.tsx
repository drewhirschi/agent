'use client';

import { useState } from 'react';
import { useSandbox } from '@/components/sandbox-status';
import { createAgentWithMCP } from '@/lib/agent';
import type { ToolLoopAgent } from 'ai';

export default function SandboxDemoPage() {
  const { state, mcpClient, SandboxStatus } = useSandbox(true);
  const [agent, setAgent] = useState<ToolLoopAgent | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Create agent when sandbox is ready
  const initializeAgent = async () => {
    if (mcpClient && !agent) {
      const newAgent = await createAgentWithMCP(mcpClient, 'Sonnet 4.5');
      setAgent(newAgent);
    }
  };

  // Handle user message
  const handleSend = async () => {
    if (!agent || !input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Execute agent task
      const result = await agent.executeTask(userMessage);
      
      // Add agent response
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.text || 'Task completed' },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize agent when sandbox becomes ready
  if (state === 'ready' && mcpClient && !agent) {
    initializeAgent();
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">MCP Sandbox Demo</h1>

      {/* Sandbox Status */}
      <div className="mb-6">{SandboxStatus}</div>

      {/* Chat Interface */}
      {state === 'ready' && agent && (
        <div className="border rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p className="text-lg">Sandbox is ready! Try asking the agent to:</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>• List files in the workspace</li>
                  <li>• Create a simple Node.js script</li>
                  <li>• Execute a shell command</li>
                  <li>• Search for patterns in files</li>
                </ul>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : msg.role === 'error'
                      ? 'bg-red-500/10 text-red-500 border border-red-500'
                      : 'bg-card border'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1 opacity-70">
                    {msg.role === 'user' ? 'You' : msg.role === 'error' ? 'Error' : 'Agent'}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-lg p-3">
                  <div className="text-sm font-semibold mb-1 opacity-70">Agent</div>
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">Thinking...</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4 bg-card">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Ask the agent to do something..."
                className="flex-1 px-4 py-2 border rounded-md bg-background"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waiting State */}
      {state !== 'ready' && (
        <div className="text-center text-muted-foreground py-12">
          <p>Waiting for sandbox to be ready...</p>
        </div>
      )}
    </div>
  );
}

