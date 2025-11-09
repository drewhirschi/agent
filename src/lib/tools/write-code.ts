import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tool } from "ai";
import { z } from "zod";
import { ACTIONS_ROOT } from "./constants";

export const writeCodeTool = tool({
  description:
    "Write TypeScript code to the actions directory. The file will be saved with a timestamp prefix automatically.",
  inputSchema: z.object({
    filename: z
      .string()
      .describe(
        'The filename (without extension) for the code file (e.g., "weather-check")'
      ),
    code: z.string().describe("The TypeScript code to write"),
  }),
  execute: async ({ filename, code }: { filename: string; code: string }) => {
    try {
      const timestamp = Date.now();
      const fullFilename = `${timestamp}-${filename}.ts`;
      const fullPath = join(ACTIONS_ROOT, fullFilename);

      await writeFile(fullPath, code, "utf-8");

      return {
        success: true,
        filename: fullFilename,
        message: `Code written to ${fullFilename}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to write file",
      };
    }
  },
});
