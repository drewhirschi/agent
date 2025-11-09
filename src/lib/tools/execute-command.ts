import { exec } from "node:child_process";
import { promisify } from "node:util";
import { tool } from "ai";
import { z } from "zod";
import { ACTIONS_ROOT } from "./constants";

const execAsync = promisify(exec);

export const executeCommandTool = tool({
  description:
    'Execute a shell command. For running TypeScript files from actions, just use "bun run [filename].ts"',
  inputSchema: z.object({
    command: z
      .string()
      .describe(
        'The shell command to execute (e.g., "bun run 1234567890-weather-check.ts")'
      ),
  }),
  execute: async ({ command }: { command: string }) => {
    try {
      // If the command is running a bun script, execute it from the actions directory
      const { stdout, stderr } = await execAsync(command, {
        cwd: ACTIONS_ROOT,
        timeout: 30000, // 30 second timeout
      });

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout?.trim() || "",
        stderr: error.stderr?.trim() || "",
      };
    }
  },
});
