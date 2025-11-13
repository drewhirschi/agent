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

export async function tailTool(params: { path: string; lines?: number }) {
    try {
        const actualPath = resolvePath(params.path);
        const numLines = params.lines || 20;

        const { stdout } = await execAsync(`tail -n ${numLines} "${actualPath}"`, {
            maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        });

        const lines = stdout.split('\n');

        return {
            path: params.path,
            absolutePath: actualPath,
            requestedLines: numLines,
            actualLines: lines.length,
            content: stdout,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to read file tail';
        return {
            error: message,
            content: '',
        };
    }
}

