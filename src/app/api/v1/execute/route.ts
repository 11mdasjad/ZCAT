/**
 * Code Execution API
 * Executes code in supported languages with timeout and resource limits
 *
 * Uses exec() with shell command to avoid Turbopack's static analysis issues with spawn.
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';

const MAX_EXECUTION_TIME = 5000; // 5 seconds
const MAX_OUTPUT_SIZE = 10000; // 10KB

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTime: number;
  timedOut: boolean;
}

async function executeCode(language: string, code: string, stdin: string): Promise<ExecutionResult> {
  if (!['python', 'javascript'].includes(language)) {
    return { stdout: '', stderr: `Language "${language}" is not supported. Supported: python, javascript`, exitCode: 1, executionTime: 0, timedOut: false };
  }

  const id = randomUUID();
  const ext = language === 'python' ? '.py' : '.js';
  const tempDir = join(tmpdir(), 'zcat-exec');
  const filePath = join(tempDir, `${id}${ext}`);
  const stdinPath = join(tempDir, `${id}.stdin`);

  try {
    await mkdir(tempDir, { recursive: true });
    await writeFile(filePath, code, 'utf-8');

    // Write stdin to a temp file if provided, and pipe it
    let cmd = language === 'python' ? `python3 "${filePath}"` : `node "${filePath}"`;
    if (stdin && stdin.trim()) {
      await writeFile(stdinPath, stdin, 'utf-8');
      cmd = `cat "${stdinPath}" | ${cmd}`;
    }

    const startTime = Date.now();

    return new Promise<ExecutionResult>((resolve) => {
      exec(cmd, {
        timeout: MAX_EXECUTION_TIME,
        maxBuffer: MAX_OUTPUT_SIZE,
        env: { ...process.env },
        shell: '/bin/bash',
      }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        const timedOut = error?.killed === true;

        // Cleanup temp files (best effort)
        unlink(filePath).catch(() => {});
        unlink(stdinPath).catch(() => {});

        resolve({
          stdout: (stdout || '').trimEnd().substring(0, MAX_OUTPUT_SIZE),
          stderr: (stderr || '').trimEnd().substring(0, MAX_OUTPUT_SIZE),
          exitCode: timedOut ? null : (error ? error.code || 1 : 0),
          executionTime,
          timedOut,
        });
      });
    });
  } catch (err) {
    unlink(filePath).catch(() => {});
    unlink(stdinPath).catch(() => {});
    return { stdout: '', stderr: `Failed to execute: ${(err as Error).message}`, exitCode: 1, executionTime: 0, timedOut: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, stdin } = body;

    if (!language || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: language, code' },
        { status: 400 }
      );
    }

    const result = await executeCode(language, code, stdin || '');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Execution failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
