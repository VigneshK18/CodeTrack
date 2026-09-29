import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { env } from '../config/env.js';

const MAX_OUTPUT_BYTES = 64 * 1024; // stop collecting output after 64 KB
const JVM_FLAGS = ['-Xmx128m', '-Xss16m', '-XX:+UseSerialGC', '-XX:TieredStopAtLevel=1'];

// Child processes get a minimal environment (no DB passwords or JWT secret).
const childEnv = () => ({ PATH: process.env.PATH, HOME: os.tmpdir(), LANG: 'C.UTF-8' });

/** JVM notices like "Picked up JAVA_TOOL_OPTIONS" are not program errors. */
const cleanStderr = (text) =>
  text
    .split('\n')
    .filter((line) => !/^Picked up (JAVA_TOOL_OPTIONS|_JAVA_OPTIONS|JDK_JAVA_OPTIONS)/.test(line))
    .join('\n')
    .trim();

/** Normalise output before comparing: unify line endings and ignore trailing spaces. */
const normalise = (text) =>
  String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

export function extractClassName(code) {
  const match = /public\s+(?:final\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)/.exec(code);
  return match ? match[1] : null;
}

/** Run a process with stdin, a hard timeout and capped output. */
function runProcess(command, args, { cwd, input = '', timeoutMs }) {
  return new Promise((resolve) => {
    const started = process.hrtime.bigint();
    const child = spawn(command, args, { cwd, env: childEnv() });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let truncated = false;

    const collect = (chunk, target) => {
      if (target.length >= MAX_OUTPUT_BYTES) {
        truncated = true;
        return target;
      }
      return target + chunk.toString('utf8');
    };

    child.stdout.on('data', (c) => (stdout = collect(c, stdout)));
    child.stderr.on('data', (c) => (stderr = collect(c, stderr)));

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stdout, stderr: err.code === 'ENOENT' ? `${command} not found on the server` : err.message, timedOut, runtimeMs: 0 });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      const runtimeMs = Number((process.hrtime.bigint() - started) / 1_000_000n);
      if (truncated) stdout += '\n...[output truncated]';
      resolve({ code, stdout, stderr: cleanStderr(stderr), timedOut, runtimeMs });
    });

    child.stdin.on('error', () => {}); // program may exit before reading stdin
    child.stdin.end(input);
  });
}

/**
 * Compile a Java program and run it against test cases.
 * Returns the same shape the React editor expects.
 */
export async function runJava({ code, testCases = [], stdin = '' }) {
  const className = extractClassName(code);
  if (!className) {
    return { output: '', error: 'Could not find a public class in your code. Example: public class Main { ... }', success: false, allPassed: false, testResults: [], runtimeMs: 0 };
  }

  const workDir = await mkdtemp(path.join(os.tmpdir(), 'codetrack-'));
  try {
    await writeFile(path.join(workDir, `${className}.java`), code, 'utf8');

    // 1. Compile
    const compile = await runProcess(env.runner.javacBin, ['-J-Xmx256m', '-encoding', 'UTF-8', `${className}.java`], {
      cwd: workDir,
      timeoutMs: env.runner.compileTimeoutMs
    });
    if (compile.timedOut || compile.code !== 0) {
      const reason = compile.timedOut ? 'Compilation timed out' : compile.stderr || compile.stdout;
      return { output: '', error: `Compilation Error:\n${reason}`, success: false, allPassed: false, testResults: [], runtimeMs: 0 };
    }

    const run = (input) =>
      runProcess(env.runner.javaBin, [...JVM_FLAGS, '-cp', workDir, className], {
        cwd: workDir,
        input,
        timeoutMs: env.runner.runTimeoutMs
      });

    // 2a. No test cases: run once with the user's custom input
    if (!testCases.length) {
      const result = await run(stdin);
      if (result.timedOut) return { output: result.stdout, error: 'Time Limit Exceeded', success: false, allPassed: false, testResults: [], runtimeMs: result.runtimeMs };
      if (result.code !== 0) return { output: result.stdout, error: `Runtime Error:\n${result.stderr}`, success: false, allPassed: false, testResults: [], runtimeMs: result.runtimeMs };
      return { output: result.stdout, error: '', success: true, allPassed: true, testResults: [], runtimeMs: result.runtimeMs };
    }

    // 2b. Run every test case
    const testResults = [];
    let maxRuntime = 0;
    let lastOutput = '';
    let lastError = '';

    for (const tc of testCases) {
      const result = await run(tc.input);
      maxRuntime = Math.max(maxRuntime, result.runtimeMs);

      if (result.timedOut) {
        testResults.push({ input: tc.input, expectedOutput: tc.output, actualOutput: 'Time Limit Exceeded', passed: false });
        lastError = 'Time Limit Exceeded';
      } else if (result.code !== 0) {
        testResults.push({ input: tc.input, expectedOutput: tc.output, actualOutput: `Runtime Error:\n${result.stderr}`, passed: false });
        lastError = 'Runtime Error';
      } else {
        const passed = normalise(result.stdout) === normalise(tc.output);
        testResults.push({ input: tc.input, expectedOutput: tc.output, actualOutput: result.stdout, passed });
        lastOutput = result.stdout;
      }
    }

    const allPassed = testResults.every((t) => t.passed);
    return { output: lastOutput, error: lastError, success: true, allPassed, testResults, runtimeMs: maxRuntime };
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
