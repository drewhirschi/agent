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

let jqInstalled: boolean | null = null;

async function ensureJq() {
    if (jqInstalled !== null) return jqInstalled;

    try {
        await execAsync('which jq');
        jqInstalled = true;
        return true;
    } catch {
        // Try to install jq
        try {
            await execAsync('sudo dnf install -y jq', { timeout: 60000 });
            jqInstalled = true;
            return true;
        } catch {
            jqInstalled = false;
            return false;
        }
    }
}

export async function parseJsonTool(params: { path: string; query: string }) {
    try {
        const actualPath = resolvePath(params.path);

        // Ensure jq is installed
        const hasJq = await ensureJq();
        if (!hasJq) {
            return {
                error:
                    'jq is not installed and could not be installed automatically. Please install jq manually.',
                result: null,
            };
        }

        const { stdout } = await execAsync(
            `jq '${params.query}' "${actualPath}"`,
            {
                maxBuffer: 10 * 1024 * 1024, // 10MB buffer
            }
        );

        // Try to parse as JSON if possible
        let result: unknown;
        try {
            result = JSON.parse(stdout);
        } catch {
            result = stdout.trim();
        }

        return {
            path: params.path,
            query: params.query,
            result,
            raw: stdout.trim(),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to parse JSON';
        return {
            error: message,
            result: null,
        };
    }
}

