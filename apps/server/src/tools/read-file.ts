import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || '/workspace';

/**
 * Resolve a path relative to workspace root
 */
function resolvePath(userPath: string): string {
  const cleanPath = userPath.startsWith('/') ? userPath.slice(1) : userPath;
  return join(WORKSPACE_ROOT, cleanPath);
}

export async function readFileTool(params: { path: string }) {
  try {
    const actualPath = resolvePath(params.path);
    const content = await readFile(actualPath, 'utf-8');
    
    return {
      path: params.path,
      absolutePath: actualPath,
      content,
      size: content.length,
      lines: content.split('\n').length,
    };
  } catch (error: any) {
    return {
      error: error.message || 'Failed to read file',
      content: '',
      size: 0,
    };
  }
}

