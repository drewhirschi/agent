"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BrainIcon, ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";

type ModelType = "Sonnet 4.5" | "Haiku 4.5";

export type ModelPickerProps = Omit<ComponentProps<typeof Popover>, "open" | "onOpenChange"> & {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  thinkingEnabled: boolean;
  onThinkingChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export function ModelPicker({
  selectedModel,
  onModelChange,
  thinkingEnabled,
  onThinkingChange,
  disabled = false,
  ...props
}: ModelPickerProps) {
  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-8 gap-2 px-2 text-xs text-muted-foreground hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <BrainIcon className="size-3.5" />
          <span>{selectedModel}</span>
          {thinkingEnabled && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              Extended Thinking
            </span>
          )}
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">
              Model
            </label>
            <Select
              value={selectedModel}
              onValueChange={(value) => onModelChange(value as ModelType)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sonnet 4.5">
                  Sonnet 4.5 (Intelligent)
                </SelectItem>
                <SelectItem value="Haiku 4.5">
                  Haiku 4.5 (Fast)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-medium text-foreground">
                  Extended Thinking
                </label>
                <p className="text-[10px] text-muted-foreground">
                  Enable deeper reasoning for complex tasks
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={thinkingEnabled}
                disabled={disabled}
                onClick={() => onThinkingChange(!thinkingEnabled)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  thinkingEnabled ? "bg-primary" : "bg-input"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    thinkingEnabled ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

