import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { tool } from "ai";
import { z } from "zod";
import { SERVERS_ROOT } from "./constants";

/**
 * Convert a simulated path (relative to /servers) to an actual filesystem path
 */
function resolveServerPath(simulatedPath: string): string {
  // Remove leading slash and join with servers root
  const cleanPath = simulatedPath.startsWith("/")
    ? simulatedPath.slice(1)
    : simulatedPath;
  return cleanPath ? join(SERVERS_ROOT, cleanPath) : SERVERS_ROOT;
}

export const listFilesTool = tool({
  description:
    'List files and directories in a given path. Paths are relative to the servers root directory. Use "/" to list all servers.',
  inputSchema: z.object({
    path: z
      .string()
      .describe(
        'The directory path to list (relative to servers root, e.g., "/" or "/weather-channel")'
      ),
  }),
  execute: async ({ path }: { path: string }) => {
    try {
      const actualPath = resolveServerPath(path);
      const entries = await readdir(actualPath, { withFileTypes: true });

      const files = entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
        path: path === "/" ? `/${entry.name}` : `${path}/${entry.name}`,
      }));

      return {
        path,
        files,
        count: files.length,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to list files",
        files: [],
      };
    }
  },
});
