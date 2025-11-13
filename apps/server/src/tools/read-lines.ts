import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';

const execAsync = promisify(exec);

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || '/workspace';

/**
 * Resolve a path relative to workspace root
 */
function resolvePath(userPath: string): string {
  const cleanPath = userPath.startsWith('/') ? userPath.slice(1) : userPath;
  return join(WORKSPACE_ROOT, cleanPath);
}

export async function readLinesTool(params: {
  path: string;
  start: number;
  end: number;
}) {
  try {
    const actualPath = resolvePath(params.path);

    // Use sed to extract specific line range
    const { stdout } = await execAsync(
      `sed -n '${params.start},${params.end}p' "${actualPath}"`,
      {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      }
    );

    const lines = stdout.split('\n');

    return {
      path: params.path,
      absolutePath: actualPath,
      start: params.start,
      end: params.end,
      lineCount: lines.length,
      content: stdout,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to read line range',
      content: '',
    };
  }
}

