import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const execAsync = promisify(exec);

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || '/workspace';
const OUTPUTS_DIR = join(WORKSPACE_ROOT, 'outputs');

// Ensure outputs directory exists
async function ensureOutputsDir() {
  await mkdir(OUTPUTS_DIR, { recursive: true });
}

export async function executeCommandTool(params: {
  command: string;
  workingDir?: string;
}) {
  try {
    await ensureOutputsDir();

    const timestamp = Date.now();
    const stdoutFile = join(OUTPUTS_DIR, `cmd-${timestamp}-stdout.txt`);
    const stderrFile = join(OUTPUTS_DIR, `cmd-${timestamp}-stderr.txt`);

    const workingDir = params.workingDir
      ? join(WORKSPACE_ROOT, params.workingDir)
      : WORKSPACE_ROOT;

    let exitCode = 0;
    let stdout = '';
    let stderr = '';

    try {
      const result = await execAsync(params.command, {
        cwd: workingDir,
        timeout: 30000, // 30 second timeout
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (error: any) {
      exitCode = error.code || 1;
      stdout = error.stdout || '';
      stderr = error.stderr || error.message || '';
    }

    // Write outputs to files
    await writeFile(stdoutFile, stdout, 'utf-8');
    await writeFile(stderrFile, stderr, 'utf-8');

    // Create a summary for the context
    const stdoutLines = stdout.split('\n').filter((line) => line.trim());
    const stderrLines = stderr.split('\n').filter((line) => line.trim());
    const stdoutPreview =
      stdoutLines.length > 10
        ? stdoutLines.slice(0, 10).join('\n') + '\n... (truncated)'
        : stdout;
    const stderrPreview =
      stderrLines.length > 10
        ? stderrLines.slice(0, 10).join('\n') + '\n... (truncated)'
        : stderr;

    return {
      success: exitCode === 0,
      exitCode,
      command: params.command,
      workingDir,
      outputFiles: {
        stdout: stdoutFile.replace(WORKSPACE_ROOT, ''),
        stderr: stderrFile.replace(WORKSPACE_ROOT, ''),
      },
      summary: {
        stdoutLines: stdoutLines.length,
        stderrLines: stderrLines.length,
        stdoutPreview,
        stderrPreview,
      },
      message:
        exitCode === 0
          ? 'Command executed successfully'
          : 'Command failed with errors',
    };
  } catch (error: any) {
    return {
      success: false,
      exitCode: 1,
      error: error.message || 'Failed to execute command',
    };
  }
}

