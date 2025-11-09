"use client";

import type { ComponentProps } from "react";
import { createContext, memo, useContext, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

// Types
export type LanguageModelUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cacheCreationInputTokens?: number;
  cacheReadInputTokens?: number;
};

export type ModelId = string;

type ContextData = {
  maxTokens: number;
  usedTokens: number;
  usage?: LanguageModelUsage;
  modelId?: ModelId;
};

// Context
const ContextContext = createContext<ContextData | null>(null);

function useContextData() {
  const context = useContext(ContextContext);
  if (!context) {
    throw new Error(
      "Context components must be used within a Context provider",
    );
  }
  return context;
}

// Helper function to format token numbers
function formatTokens(count: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(count);
}

// Synchronous helper for displaying costs (uses simple fallback)
function calculateCost(
  tokens: number,
  type: "input" | "output" | "reasoning" | "cache",
  modelId?: string,
): string {
  if (!modelId) return "$0.00";

  // Simple pricing model for Anthropic models (per million tokens)
  const pricing: Record<string, Record<string, number>> = {
    "anthropic:claude-sonnet-4.5": {
      input: 3.0,
      output: 15.0,
      reasoning: 15.0,
      cache: 0.3,
    },
    "anthropic:claude-haiku-4.5": {
      input: 0.8,
      output: 4.0,
      reasoning: 4.0,
      cache: 0.08,
    },
  };

  const modelPricing =
    pricing[modelId] || pricing["anthropic:claude-haiku-4.5"];
  const costPerToken = modelPricing[type] / 1_000_000;
  const cost = tokens * costPerToken;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(cost);
}

// Root Context Component
export type ContextProps = ComponentProps<typeof HoverCard> & {
  maxTokens: number;
  usedTokens: number;
  usage?: LanguageModelUsage;
  modelId?: ModelId;
};

export const Context = memo(
  ({
    maxTokens,
    usedTokens,
    usage,
    modelId,
    children,
    ...props
  }: ContextProps) => {
    const contextValue = useMemo(
      () => ({ maxTokens, usedTokens, usage, modelId }),
      [maxTokens, usedTokens, usage, modelId],
    );

    return (
      <ContextContext.Provider value={contextValue}>
        <HoverCard {...props}>{children}</HoverCard>
      </ContextContext.Provider>
    );
  },
);

Context.displayName = "Context";

// Context Trigger
export type ContextTriggerProps = ComponentProps<"button"> & {
  children?: React.ReactNode;
};

export const ContextTrigger = memo(
  ({ children, className, ...props }: ContextTriggerProps) => {
    const { maxTokens, usedTokens } = useContextData();
    const percentage = Math.min(
      100,
      Math.round((usedTokens / maxTokens) * 100),
    );

    if (children) {
      return (
        <HoverCardTrigger asChild>
          <button className={className} {...props}>
            {children}
          </button>
        </HoverCardTrigger>
      );
    }

    return (
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("text-xs gap-1.5", className)}
          {...props}
        >
          <span>{percentage}%</span>
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Context usage indicator"
          >
            <title>Context Usage</title>
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-20"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${percentage * 0.628} 62.8`}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
              className="transition-all duration-300"
            />
          </svg>
        </Button>
      </HoverCardTrigger>
    );
  },
);

ContextTrigger.displayName = "ContextTrigger";

// Context Content
export type ContextContentProps = ComponentProps<typeof HoverCardContent>;

export const ContextContent = memo(
  ({ className, children, ...props }: ContextContentProps) => {
    return (
      <HoverCardContent className={cn("w-72 p-0", className)} {...props}>
        {children}
      </HoverCardContent>
    );
  },
);

ContextContent.displayName = "ContextContent";

// Context Content Header
export type ContextContentHeaderProps = ComponentProps<"div"> & {
  children?: React.ReactNode;
};

export const ContextContentHeader = memo(
  ({ children, className, ...props }: ContextContentHeaderProps) => {
    const { maxTokens, usedTokens } = useContextData();
    const percentage = Math.min(
      100,
      Math.round((usedTokens / maxTokens) * 100),
    );

    if (children) {
      return (
        <div className={cn("p-4", className)} {...props}>
          {children}
        </div>
      );
    }

    return (
      <div className={cn("p-4 space-y-2", className)} {...props}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium">{percentage}%</span>
          <span className="text-xs text-muted-foreground">
            {formatTokens(usedTokens)} / {formatTokens(maxTokens)}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  },
);

ContextContentHeader.displayName = "ContextContentHeader";

// Context Content Body
export type ContextContentBodyProps = ComponentProps<"div">;

export const ContextContentBody = memo(
  ({ className, children, ...props }: ContextContentBodyProps) => {
    return (
      <div className={cn("px-4 pb-4 space-y-2", className)} {...props}>
        {children}
      </div>
    );
  },
);

ContextContentBody.displayName = "ContextContentBody";

// Context Content Footer
export type ContextContentFooterProps = ComponentProps<"div"> & {
  children?: React.ReactNode;
};

export const ContextContentFooter = memo(
  ({ children, className, ...props }: ContextContentFooterProps) => {
    const { usage, modelId } = useContextData();

    if (children) {
      return (
        <div
          className={cn("border-t bg-secondary/50 px-4 py-3", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (!usage || !modelId) {
      return null;
    }

    const totalCost =
      parseFloat(
        calculateCost(usage.promptTokens || 0, "input", modelId).replace(
          /[$,]/g,
          "",
        ),
      ) +
      parseFloat(
        calculateCost(usage.completionTokens || 0, "output", modelId).replace(
          /[$,]/g,
          "",
        ),
      ) +
      parseFloat(
        calculateCost(usage.reasoningTokens || 0, "reasoning", modelId).replace(
          /[$,]/g,
          "",
        ),
      ) +
      parseFloat(
        calculateCost(
          usage.cacheReadInputTokens || 0,
          "cache",
          modelId,
        ).replace(/[$,]/g, ""),
      );

    return (
      <div
        className={cn("border-t bg-secondary/50 px-4 py-3", className)}
        {...props}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Total Cost</span>
          <span className="font-mono">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            }).format(totalCost)}
          </span>
        </div>
      </div>
    );
  },
);

ContextContentFooter.displayName = "ContextContentFooter";

// Usage Components
type UsageComponentProps = ComponentProps<"div"> & {
  children?: React.ReactNode;
};

export const ContextInputUsage = memo(
  ({ children, className, ...props }: UsageComponentProps) => {
    const { usage, modelId } = useContextData();

    if (!usage) return null;

    if (children) {
      return (
        <div
          className={cn("flex items-center justify-between text-xs", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    const tokens = usage.promptTokens || 0;
    const cost = calculateCost(tokens, "input", modelId);

    return (
      <div
        className={cn("flex items-center justify-between text-xs", className)}
        {...props}
      >
        <span className="text-muted-foreground">Input</span>
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatTokens(tokens)}</span>
          {modelId && (
            <span className="text-muted-foreground font-mono">{cost}</span>
          )}
        </div>
      </div>
    );
  },
);

ContextInputUsage.displayName = "ContextInputUsage";

export const ContextOutputUsage = memo(
  ({ children, className, ...props }: UsageComponentProps) => {
    const { usage, modelId } = useContextData();

    if (!usage) return null;

    if (children) {
      return (
        <div
          className={cn("flex items-center justify-between text-xs", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    const tokens = usage.completionTokens || 0;
    const cost = calculateCost(tokens, "output", modelId);

    return (
      <div
        className={cn("flex items-center justify-between text-xs", className)}
        {...props}
      >
        <span className="text-muted-foreground">Output</span>
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatTokens(tokens)}</span>
          {modelId && (
            <span className="text-muted-foreground font-mono">{cost}</span>
          )}
        </div>
      </div>
    );
  },
);

ContextOutputUsage.displayName = "ContextOutputUsage";

export const ContextReasoningUsage = memo(
  ({ children, className, ...props }: UsageComponentProps) => {
    const { usage, modelId } = useContextData();

    if (!usage || !usage.reasoningTokens) return null;

    if (children) {
      return (
        <div
          className={cn("flex items-center justify-between text-xs", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    const tokens = usage.reasoningTokens;
    const cost = calculateCost(tokens, "reasoning", modelId);

    return (
      <div
        className={cn("flex items-center justify-between text-xs", className)}
        {...props}
      >
        <span className="text-muted-foreground">Reasoning</span>
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatTokens(tokens)}</span>
          {modelId && (
            <span className="text-muted-foreground font-mono">{cost}</span>
          )}
        </div>
      </div>
    );
  },
);

ContextReasoningUsage.displayName = "ContextReasoningUsage";

export const ContextCacheUsage = memo(
  ({ children, className, ...props }: UsageComponentProps) => {
    const { usage, modelId } = useContextData();

    if (!usage || !usage.cacheReadInputTokens) return null;

    if (children) {
      return (
        <div
          className={cn("flex items-center justify-between text-xs", className)}
          {...props}
        >
          {children}
        </div>
      );
    }

    const tokens = usage.cacheReadInputTokens;
    const cost = calculateCost(tokens, "cache", modelId);

    return (
      <div
        className={cn("flex items-center justify-between text-xs", className)}
        {...props}
      >
        <span className="text-muted-foreground">Cache</span>
        <div className="flex items-center gap-2">
          <span className="font-mono">{formatTokens(tokens)}</span>
          {modelId && (
            <span className="text-muted-foreground font-mono">{cost}</span>
          )}
        </div>
      </div>
    );
  },
);

ContextCacheUsage.displayName = "ContextCacheUsage";
