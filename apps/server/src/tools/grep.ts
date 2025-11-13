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

export async function grepTool(params: {
  pattern: string;
  path: string;
  caseInsensitive?: boolean;
  lineNumbers?: boolean;
}) {
  try {
    const actualPath = resolvePath(params.path);
    const caseFlag = params.caseInsensitive ? '-i' : '';
    const lineFlag = params.lineNumbers !== false ? '-n' : '';

    const command = `grep ${caseFlag} ${lineFlag} -r "${params.pattern}" "${actualPath}" || true`;

    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    const lines = stdout.split('\n').filter((line) => line.trim());

    return {
      pattern: params.pattern,
      path: params.path,
      matches: lines.length,
      results: lines,
      summary:
        lines.length > 20
          ? `Found ${lines.length} matches. Showing first 20:\n${lines
              .slice(0, 20)
              .join('\n')}`
          : stdout,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Grep search failed',
      matches: 0,
      results: [],
    };
  }
}

