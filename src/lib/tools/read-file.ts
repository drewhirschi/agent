import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tool } from "ai";
import { z } from "zod";
import { SERVERS_ROOT } from "./constants";

/**
 * Convert a simulated path (relative to /servers) to an actual filesystem path
 */
function resolveServerPath(simulatedPath: string): string {
  const cleanPath = simulatedPath.startsWith("/")
    ? simulatedPath.slice(1)
    : simulatedPath;
  return join(SERVERS_ROOT, cleanPath);
}

export const readFileTool = tool({
  description:
    "Read the complete contents of a file. Paths are relative to the servers root directory. Use analyzeFunctions instead if you only need function signatures.",
  inputSchema: z.object({
    path: z
      .string()
      .describe(
        'The file path to read (relative to servers root, e.g., "/weather-channel/get-weather.ts")'
      ),
  }),
  execute: async ({ path }: { path: string }) => {
    try {
      const actualPath = resolveServerPath(path);
      const content = await readFile(actualPath, "utf-8");
      return {
        path,
        content,
        size: content.length,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to read file",
        content: "",
      };
    }
  },
});
