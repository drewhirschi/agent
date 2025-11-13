"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type InferAgentUIMessage } from "ai";
import { Brain, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from "@/components/ai-elements/chain-of-thought";
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
  type LanguageModelUsage,
} from "@/components/ai-elements/context";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  Task,
  TaskContent,
  TaskItem,
  TaskTrigger,
} from "@/components/ai-elements/task";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { sonnetAgent } from "@/lib/agent";
import { cn } from "@/lib/utils";

type ModelName = "Sonnet 4.5" | "Haiku 4.5";

type DeveloperAgentUIMessage = InferAgentUIMessage<typeof sonnetAgent>;

// Context window sizes for models (in tokens)
const MODEL_CONTEXT_WINDOWS: Record<ModelName, number> = {
  "Sonnet 4.5": 200_000,
  "Haiku 4.5": 200_000,
};

// Model IDs for cost calculation
const MODEL_IDS: Record<ModelName, string> = {
  "Sonnet 4.5": "anthropic:claude-sonnet-4.5",
  "Haiku 4.5": "anthropic:claude-haiku-4.5",
};

const models = [
  { id: "Sonnet 4.5", name: "Claude Sonnet 4.5" },
  { id: "Haiku 4.5", name: "Claude Haiku 4.5" },
];

export default function Page() {
  const [selectedModel, setSelectedModel] = useState<ModelName>("Haiku 4.5");
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track cumulative token usage
  const [cumulativeUsage, setCumulativeUsage] = useState<LanguageModelUsage>({
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    reasoningTokens: 0,
    cacheCreationInputTokens: 0,
    cacheReadInputTokens: 0,
  });

  const { messages, status, sendMessage, setMessages } =
    useChat<DeveloperAgentUIMessage>({
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: {
          model: selectedModel,
          thinkingEnabled,
        },
      }),
      onError: (error: Error) => {
        console.error("Chat error:", error);
      },
    });

  const isLoading = status === "streaming" || status === "submitted";

  // Extract and accumulate usage from messages
  useEffect(() => {
    // Calculate cumulative usage from all messages
    const totalUsage: LanguageModelUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
    };

    // Extract usage from message metadata if available
    for (const message of messages) {
      // Check if message has usage metadata (AI SDK v6 pattern)
      // biome-ignore lint/suspicious/noExplicitAny: Message metadata types are dynamic
      const metadata = (message as any).metadata;
      if (metadata?.usage) {
        totalUsage.promptTokens += metadata.usage.promptTokens || 0;
        totalUsage.completionTokens += metadata.usage.completionTokens || 0;
        totalUsage.totalTokens += metadata.usage.totalTokens || 0;
        totalUsage.reasoningTokens =
          (totalUsage.reasoningTokens || 0) +
          (metadata.usage.reasoningTokens || 0);
        totalUsage.cacheCreationInputTokens =
          (totalUsage.cacheCreationInputTokens || 0) +
          (metadata.usage.cacheCreationInputTokens || 0);
        totalUsage.cacheReadInputTokens =
          (totalUsage.cacheReadInputTokens || 0) +
          (metadata.usage.cacheReadInputTokens || 0);
      }

      // Estimate tokens from message parts as fallback
      if (!metadata?.usage && message.role === "assistant") {
        const textParts = message.parts.filter((p) => p.type === "text");
        const estimatedTokens = textParts.reduce((sum, part) => {
          // biome-ignore lint/suspicious/noExplicitAny: Part types are dynamic
          const text = (part as any).text || "";
          // Rough estimate: 1 token ≈ 4 characters
          return sum + Math.ceil(text.length / 4);
        }, 0);
        totalUsage.completionTokens += estimatedTokens;
        totalUsage.totalTokens += estimatedTokens;
      }
    }

    setCumulativeUsage(totalUsage);
  }, [messages]);

  // Calculate used tokens (for context window display)
  const usedTokens = useMemo(() => {
    return cumulativeUsage.totalTokens || 0;
  }, [cumulativeUsage]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    if (!hasText || isLoading || !message.text) return;

    sendMessage({
      role: "user",
      parts: [{ type: "text", text: message.text }],
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    setCumulativeUsage({
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
      cacheCreationInputTokens: 0,
      cacheReadInputTokens: 0,
    });
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold">AI Developer Agent</h1>
            <p className="ml-4 text-sm text-muted-foreground">
              Powered by Claude & AI SDK
            </p>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              disabled={isLoading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 max-w-md text-center">
              <h2 className="text-xl font-semibold mb-2">
                Welcome to the Developer Agent
              </h2>
              <p className="text-muted-foreground mb-4">
                I can explore the servers/ directory, write TypeScript code, and
                execute it using bun. Try asking me to use one of the available
                server functions!
              </p>
              <div className="text-sm text-muted-foreground">
                <strong>Current Model:</strong>{" "}
                {selectedModel === "Sonnet 4.5"
                  ? "Sonnet 4.5 (Intelligent)"
                  : "Haiku 4.5 (Fast)"}
              </div>
            </Card>
          </div>
        )}

        {messages.map((msg) => {
          // DEBUG: Log entire message structure
          console.log("=== MESSAGE DEBUG ===");
          console.log("Message ID:", msg.id);
          console.log("Message Role:", msg.role);
          console.log("Total Parts:", msg.parts.length);
          console.log("All Parts:", msg.parts);

          // Filter for different part types
          const toolParts = msg.parts.filter((part) =>
            part.type.startsWith("tool-"),
          );
          const reasoningPart = msg.parts.find(
            (part) => part.type === "reasoning",
          );

          // Get ALL text parts, not just the first one
          const textParts = msg.parts.filter((part) => part.type === "text");

          // Separate text parts: before tools and after tools (final message)
          const firstToolIndex = msg.parts.findIndex((part) =>
            part.type.startsWith("tool-"),
          );
          const lastToolIndex =
            msg.parts
              .map((p, i) => (p.type.startsWith("tool-") ? i : -1))
              .filter((i) => i !== -1)
              .pop() ?? -1;

          const preToolTexts = textParts.filter((_, _i) => {
            const partIndex = msg.parts.indexOf(_);
            return firstToolIndex === -1 || partIndex < firstToolIndex;
          });

          const postToolTexts = textParts.filter((_, _i) => {
            const partIndex = msg.parts.indexOf(_);
            return lastToolIndex !== -1 && partIndex > lastToolIndex;
          });

          // DEBUG: Log filtered parts
          console.log("Tool Parts Count:", toolParts.length);
          console.log("Tool Parts:", toolParts);
          console.log("Reasoning Part:", reasoningPart);
          console.log("Text Parts Count:", textParts.length);
          console.log("Pre-tool Texts:", preToolTexts.length);
          console.log("Post-tool Texts:", postToolTexts.length);
          console.log("===================\n");

          return (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <Card
                className={cn(
                  "p-4 max-w-[80%]",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted",
                )}
              >
                {/* DEBUG: Visual indicator */}
                <div className="text-xs text-muted-foreground mb-2 font-mono">
                  Parts: {toolParts.length} tool, {textParts.length} text (
                  {preToolTexts.length} pre, {postToolTexts.length} post),{" "}
                  {reasoningPart ? "1" : "0"} reasoning
                </div>

                {/* Show reasoning if present */}
                {reasoningPart && reasoningPart.type === "reasoning" && (
                  <div className="mb-3">
                    <Reasoning defaultOpen={false}>
                      <ReasoningTrigger />
                      <ReasoningContent>
                        {/* biome-ignore lint/suspicious/noExplicitAny: Part types are dynamic */}
                        {(reasoningPart as any).text || "Thinking..."}
                      </ReasoningContent>
                    </Reasoning>
                  </div>
                )}

                {/* Show initial text content (before tools) */}
                {preToolTexts.length > 0 && (
                  <div className="mb-3">
                    {preToolTexts.map((textPart) => {
                      // biome-ignore lint/suspicious/noExplicitAny: Part types are dynamic
                      const text = (textPart as any).text || "";
                      return (
                        <div
                          key={`pre-${text.substring(0, 50)}`}
                          className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*]:text-foreground mb-2"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {text}
                          </ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Show tool calls if present */}
                {toolParts.length > 0 && (
                  <div className="mb-3">
                    <ChainOfThought defaultOpen={true}>
                      <ChainOfThoughtHeader>Tool Calls</ChainOfThoughtHeader>
                      <ChainOfThoughtContent>
                        {toolParts.map((part) => {
                          if (part.type.startsWith("tool-")) {
                            // biome-ignore lint/suspicious/noExplicitAny: Part types are dynamic
                            const toolPart = part as any;
                            return (
                              <Task
                                key={toolPart.toolCallId}
                                defaultOpen={false}
                              >
                                <TaskTrigger
                                  title={`Tool: ${toolPart.toolName || toolPart.type}`}
                                />
                                <TaskContent>
                                  <TaskItem>
                                    <strong>Status:</strong>{" "}
                                    <span className="text-green-600">
                                      {toolPart.state || "completed"}
                                    </span>
                                  </TaskItem>
                                  {toolPart.input && (
                                    <TaskItem>
                                      <strong>Input:</strong>
                                      <pre className="mt-1 text-xs bg-background/50 p-2 rounded overflow-x-auto">
                                        {JSON.stringify(
                                          toolPart.input,
                                          null,
                                          2,
                                        )}
                                      </pre>
                                    </TaskItem>
                                  )}
                                  {toolPart.output !== undefined && (
                                    <TaskItem>
                                      <strong>Output:</strong>
                                      <pre className="mt-1 text-xs bg-background/50 p-2 rounded overflow-x-auto">
                                        {typeof toolPart.output === "string"
                                          ? toolPart.output
                                          : JSON.stringify(
                                              toolPart.output,
                                              null,
                                              2,
                                            )}
                                      </pre>
                                    </TaskItem>
                                  )}
                                </TaskContent>
                              </Task>
                            );
                          }
                          return null;
                        })}
                      </ChainOfThoughtContent>
                    </ChainOfThought>
                  </div>
                )}

                {/* Show final text content (after tools) - This is the important final message! */}
                {postToolTexts.length > 0 && (
                  <div>
                    {postToolTexts.map((textPart) => {
                      // biome-ignore lint/suspicious/noExplicitAny: Part types are dynamic
                      const text = (textPart as any).text || "";
                      return (
                        <div
                          key={`post-${text.substring(0, 50)}`}
                          className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*]:text-foreground mb-2"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {text}
                          </ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* If no tools were used, show all text parts */}
                {toolParts.length === 0 && textParts.length > 0 && (
                  <div>
                    {textParts.map((textPart) => {
                      // biome-ignore lint/suspicious/noExplicitAny: Part types are dynamic
                      const text = (textPart as any).text || "";
                      return (
                        <div
                          key={`text-${text.substring(0, 50)}`}
                          className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*]:text-foreground mb-2"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {text}
                          </ReactMarkdown>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          );
        })}

        {/* Show loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-4 max-w-[80%] bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="container max-w-3xl mx-auto">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                ref={textareaRef}
                placeholder="Ask me to explore servers or execute code..."
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton
                  onClick={() => setThinkingEnabled(!thinkingEnabled)}
                  variant={thinkingEnabled ? "default" : "ghost"}
                  type="button"
                >
                  <Brain className="size-4" />
                  <span>Thinking</span>
                </PromptInputButton>
                <ModelSelector
                  open={modelSelectorOpen}
                  onOpenChange={setModelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <PromptInputButton className="min-w-[160px]">
                      <ModelSelectorName>
                        {models.find((m) => m.id === selectedModel)?.name}
                      </ModelSelectorName>
                    </PromptInputButton>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                      {models.map((model) => (
                        <ModelSelectorItem
                          key={model.id}
                          value={model.id}
                          onSelect={() => {
                            setSelectedModel(model.id as ModelName);
                            setModelSelectorOpen(false);
                          }}
                        >
                          <ModelSelectorName>{model.name}</ModelSelectorName>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>

              {/* Token Usage Context Display */}
              <div className="flex items-center gap-2">
                <Context
                  maxTokens={MODEL_CONTEXT_WINDOWS[selectedModel]}
                  usedTokens={usedTokens}
                  usage={cumulativeUsage}
                  modelId={MODEL_IDS[selectedModel]}
                >
                  <ContextTrigger />
                  <ContextContent>
                    <ContextContentHeader />
                    <ContextContentBody>
                      <ContextInputUsage />
                      <ContextOutputUsage />
                      <ContextReasoningUsage />
                      <ContextCacheUsage />
                    </ContextContentBody>
                    <ContextContentFooter />
                  </ContextContent>
                </Context>

                <PromptInputSubmit status={status} />
              </div>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
