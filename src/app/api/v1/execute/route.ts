/**
 * Code Execution API
 * Executes code in supported languages with timeout and resource limits.
 * Features a seamless online sandbox (Piston API) fallback for serverless deployments (Vercel)
 * and hosts without local runtime compilers (python3, g++, javac).
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';
import { promisify } from 'util';
import { logger } from '@/lib/logger/logger';

const execPromise = promisify(exec);

const MAX_EXECUTION_TIME = 5000; // 5 seconds
const MAX_OUTPUT_SIZE = 10000; // 10KB

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  executionTime: number;
  timedOut: boolean;
}

/**
 * Execute user solution via secure, sandboxed Piston API
 */
async function executeViaPiston(language: string, code: string, stdin: string): Promise<ExecutionResult> {
  const startTime = Date.now();
  try {
    const langMap: Record<string, string> = {
      'python': 'python',
      'javascript': 'javascript',
      'cpp': 'cpp',
      'java': 'java'
    };

    const fileExts: Record<string, string> = {
      'python': 'py',
      'javascript': 'js',
      'cpp': 'cpp',
      'java': 'java'
    };

    const pistonLang = langMap[language] || language;
    const ext = fileExts[language] || 'txt';
    const fileName = language === 'java' ? 'Main.java' : `solution.${ext}`;

    logger.info('Forwarding code execution request to Piston Sandbox API', { language, stdinLength: stdin.length });

    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: '*',
        files: [
          {
            name: fileName,
            content: code
          }
        ],
        stdin: stdin
      })
    });

    if (!response.ok) {
      throw new Error(`Piston API returned status ${response.status}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;
    
    return {
      stdout: data.run?.stdout || '',
      stderr: data.run?.stderr || '',
      exitCode: data.run?.code !== undefined ? data.run.code : (data.run?.stderr ? 1 : 0),
      executionTime,
      timedOut: data.run?.signal === 'SIGKILL',
    };
  } catch (err: any) {
    logger.error('Piston API execution failed:', err);
    return {
      stdout: '',
      stderr: `Code Execution Pipeline Error: ${err.message}`,
      exitCode: 1,
      executionTime: Date.now() - startTime,
      timedOut: false,
    };
  }
}

async function executeCode(language: string, code: string, stdin: string): Promise<ExecutionResult> {
  const normalizedLang = language.toLowerCase().trim();
  if (!['python', 'javascript', 'cpp', 'java'].includes(normalizedLang)) {
    return {
      stdout: '',
      stderr: `Language "${language}" is not supported. Supported: python, javascript, cpp, java`,
      exitCode: 1,
      executionTime: 0,
      timedOut: false,
    };
  }

  // Force Vercel deployment to route directly to Piston to avoid resource leak in lambdas
  if (process.env.VERCEL === '1') {
    return executeViaPiston(normalizedLang, code, stdin);
  }

  const id = randomUUID();
  const tempDir = join(tmpdir(), 'zcat-exec', id);

  let ext = '';
  let className = 'Main';
  if (normalizedLang === 'python') ext = '.py';
  else if (normalizedLang === 'javascript') ext = '.js';
  else if (normalizedLang === 'cpp') ext = '.cpp';
  else if (normalizedLang === 'java') {
    const match = code.match(/public\s+class\s+(\w+)/);
    className = match ? match[1] : 'Main';
    ext = '.java';
  }

  const fileName = normalizedLang === 'java' ? `${className}${ext}` : `${id}${ext}`;
  const filePath = join(tempDir, fileName);
  const stdinPath = join(tempDir, `${id}.stdin`);

  try {
    await mkdir(tempDir, { recursive: true });
    await writeFile(filePath, code, 'utf-8');

    let runCmd = '';
    let compileCmd = '';

    if (normalizedLang === 'python') {
      runCmd = `python3 "${filePath}"`;
    } else if (normalizedLang === 'javascript') {
      runCmd = `node "${filePath}"`;
    } else if (normalizedLang === 'cpp') {
      const outPath = join(tempDir, `${id}.out`);
      compileCmd = `g++ -O3 "${filePath}" -o "${outPath}"`;
      runCmd = `"${outPath}"`;
    } else if (normalizedLang === 'java') {
      compileCmd = `javac "${filePath}"`;
      runCmd = `java -cp "${tempDir}" "${className}"`;
    }

    const startTime = Date.now();

    // Compile if necessary
    if (compileCmd) {
      const compileResult = await new Promise<{ success: boolean; stderr: string }>((resolve) => {
        exec(compileCmd, { timeout: 8000, shell: '/bin/bash' }, (error, stdout, stderr) => {
          if (error) {
            resolve({ success: false, stderr: stderr || error.message || 'Compilation failed.' });
          } else {
            resolve({ success: true, stderr: '' });
          }
        });
      });

      if (!compileResult.success) {
        const isCompilerNotFound =
          compileResult.stderr.includes('command not found') ||
          compileResult.stderr.includes('not found');

        if (isCompilerNotFound) {
          // Trigger Piston sandbox fallback directly
          const result = await executeViaPiston(normalizedLang, code, stdin);
          await execPromise(`rm -rf "${tempDir}"`).catch(() => {});
          return result;
        }

        // Cleanup immediately
        await execPromise(`rm -rf "${tempDir}"`).catch(() => {});
        return {
          stdout: '',
          stderr: `Compilation Error:\n${compileResult.stderr}`,
          exitCode: 1,
          executionTime: Date.now() - startTime,
          timedOut: false,
        };
      }
    }

    if (stdin && stdin.trim()) {
      await writeFile(stdinPath, stdin, 'utf-8');
      runCmd = `cat "${stdinPath}" | ${runCmd}`;
    }

    return new Promise<ExecutionResult>((resolve) => {
      exec(runCmd, {
        timeout: MAX_EXECUTION_TIME,
        maxBuffer: MAX_OUTPUT_SIZE,
        env: { ...process.env },
        shell: '/bin/bash',
      }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;
        const timedOut = error?.killed === true;

        const isCommandNotFound =
          (error && error.code === 127) ||
          stderr.includes('command not found') ||
          stderr.includes('not found') ||
          (error && error.message.includes('not found'));

        // Async cleanup of the isolated directory
        execPromise(`rm -rf "${tempDir}"`).catch(() => {});

        if (isCommandNotFound) {
          // Trigger Piston fallback
          executeViaPiston(normalizedLang, code, stdin).then(resolve);
          return;
        }

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
    execPromise(`rm -rf "${tempDir}"`).catch(() => {});
    return {
      stdout: '',
      stderr: `Failed to execute: ${(err as Error).message}`,
      exitCode: 1,
      executionTime: 0,
      timedOut: false,
    };
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
