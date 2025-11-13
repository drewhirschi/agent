import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || '/workspace';

/**
 * Resolve a path relative to workspace root
 */
function resolvePath(userPath: string): string {
    const cleanPath = userPath.startsWith('/') ? userPath.slice(1) : userPath;
    return cleanPath ? join(WORKSPACE_ROOT, cleanPath) : WORKSPACE_ROOT;
}

export async function listFilesTool(params: { path: string }) {
    try {
        const actualPath = resolvePath(params.path);
        const entries = await readdir(actualPath, { withFileTypes: true });

        const files = entries.map((entry) => ({
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            path:
                params.path === '/'
                    ? `/${entry.name}`
                    : `${params.path}/${entry.name}`,
        }));

        return {
            path: params.path,
            absolutePath: actualPath,
            files,
            count: files.length,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to list files';
        return {
            error: message,
            files: [],
            count: 0,
        };
    }
}

