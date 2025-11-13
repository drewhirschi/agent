import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || '/workspace';

/**
 * Resolve a path relative to workspace root
 */
function resolvePath(userPath: string): string {
  const cleanPath = userPath.startsWith('/') ? userPath.slice(1) : userPath;
  return join(WORKSPACE_ROOT, cleanPath);
}

export async function writeFileTool(params: { path: string; content: string }) {
  try {
    const actualPath = resolvePath(params.path);
    
    // Ensure directory exists
    await mkdir(dirname(actualPath), { recursive: true });
    
    await writeFile(actualPath, params.content, 'utf-8');

    return {
      success: true,
      path: params.path,
      absolutePath: actualPath,
      size: params.content.length,
      message: `File written successfully`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to write file',
    };
  }
}

