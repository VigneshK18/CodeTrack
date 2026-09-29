import { execFile, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { env } from '../config/env.js';

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const JUDGE_SOURCE_DIR = path.resolve(here, '../../judge');
const DRIVER_FILE = 'CodeTrackDriver.java';

// Child processes get a minimal environment (no DB password or JWT secret).
const childEnv = () => ({ PATH: process.env.PATH, HOME: os.tmpdir(), LANG: 'C.UTF-8' });

// ------------------------------------------------------------------ setup

let harnessPromise = null;

/** Compile the judge harness once (cached by source hash) and detect the Java version. */
export function ensureHarness() {
  if (!harnessPromise) {
    harnessPromise = (async () => {
      const javaMajor = await detectJavaMajor();

      if (process.env.JUDGE_CLASSES_DIR && existsSync(path.join(process.env.JUDGE_CLASSES_DIR, 'CodeTrackJudge.class'))) {
        return { classesDir: process.env.JUDGE_CLASSES_DIR, javaMajor };
      }

      const files = (await readdir(JUDGE_SOURCE_DIR)).filter((f) => f.endsWith('.java')).sort();
      const hash = createHash('sha1');
      for (const f of files) hash.update(f).update(await readFile(path.join(JUDGE_SOURCE_DIR, f)));
      const classesDir = path.join(os.tmpdir(), `codetrack-judge-${hash.digest('hex').slice(0, 12)}`);

      if (!existsSync(path.join(classesDir, 'CodeTrackJudge.class'))) {
        await mkdir(classesDir, { recursive: true });
        await execFileAsync(env.runner.javacBin, ['-nowarn', '-encoding', 'UTF-8', '-d', classesDir, ...files], {
          cwd: JUDGE_SOURCE_DIR,
          env: childEnv(),
          timeout: 180_000
        });
      }
      return { classesDir, javaMajor };
    })().catch((err) => {
      harnessPromise = null;
      throw err;
    });
  }
  return harnessPromise;
}

async function detectJavaMajor() {
  try {
    const { stderr, stdout } = await execFileAsync(env.runner.javaBin, ['-version'], { env: childEnv(), timeout: 30_000 });
    const match = /version "(\d+)(?:\.(\d+))?/.exec(stderr + stdout);
    if (!match) return 17;
    const major = Number(match[1]);
    return major === 1 ? Number(match[2]) : major;
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error('Java is not installed on the server (java not found in PATH)');
    throw err;
  }
}

// ------------------------------------------------------------ concurrency

// Each judge run starts a JVM with up to 256 MB of heap, so limit how many run at once.
let running = 0;
const waiting = [];

async function withSlot(fn) {
  if (running >= env.runner.concurrency) await new Promise((resolve) => waiting.push(resolve));
  running += 1;
  try {
    return await fn();
  } finally {
    running -= 1;
    waiting.shift()?.();
  }
}

// ---------------------------------------------------------------- helpers

/** File name for the submitted code: a public class must live in a file of the same name. */
export function sourceFileName(code) {
  const match = /public\s+(?:final\s+|abstract\s+)*(?:class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/.exec(code);
  return `${match ? match[1] : 'Solution'}.java`;
}

/** For full-program problems: the class that declares main(). */
export function mainClassName(code) {
  const pub = /public\s+(?:final\s+)*class\s+([A-Za-z_$][\w$]*)/.exec(code);
  if (pub) return pub[1];
  const any = /class\s+([A-Za-z_$][\w$]*)[^{]*\{[\s\S]*?static\s+void\s+main\s*\(/.exec(code);
  return any ? any[1] : 'Main';
}

const propEscape = (value) => String(value).replace(/\\/g, '\\\\').replace(/\n/g, '\\n');

async function writeProgram(dir, code, driverCode) {
  await mkdir(dir, { recursive: true });
  const fileName = sourceFileName(code);
  await writeFile(path.join(dir, fileName), code, 'utf8');
  const files = [fileName];
  if (driverCode) {
    await writeFile(path.join(dir, DRIVER_FILE), driverCode, 'utf8');
    files.push(DRIVER_FILE);
  }
  return { files, entry: driverCode ? 'CodeTrackDriver' : mainClassName(code) };
}

function runProcess(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { env: childEnv(), stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    let killed = false;
    child.stderr.on('data', (d) => {
      if (stderr.length < 20_000) stderr += d.toString();
    });
    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stderr: err.code === 'ENOENT' ? `${command} not found on the server` : err.message, killed });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stderr, killed });
    });
  });
}

// ------------------------------------------------------------------- main

/**
 * Compile and run a submission against a list of stdin inputs in a single JVM.
 * Optionally also runs the reference solution on some inputs to compute expected output.
 *
 * @returns {{ compile: {ok, errors?}, refCompile?: {ok, errors?}, user: object[], ref: Record<number, object>, crashed: boolean, detail?: string }}
 */
export async function runJudge({ code, driverCode = null, inputs, refCode = null, refIndexes = [], timeLimitMs = env.runner.runTimeoutMs }) {
  const { classesDir, javaMajor } = await ensureHarness();

  return withSlot(async () => {
    const workDir = await mkdtemp(path.join(os.tmpdir(), 'codetrack-run-'));
    try {
      const user = await writeProgram(path.join(workDir, 'user'), code, driverCode);
      const props = {
        libDir: classesDir,
        userDir: path.join(workDir, 'user'),
        userFiles: user.files.join(','),
        userEntry: user.entry,
        cases: inputs.length,
        timeLimitMs,
        wallLimitMs: Math.max(timeLimitMs * 4, 8000),
        resultFile: path.join(workDir, 'result.jsonl')
      };

      await mkdir(path.join(workDir, 'cases'));
      for (let i = 0; i < inputs.length; i++) {
        const file = path.join(workDir, 'cases', `${i}.in`);
        await writeFile(file, inputs[i].endsWith('\n') ? inputs[i] : `${inputs[i]}\n`, 'utf8');
        props[`case.${i}`] = file;
      }

      if (refCode && refIndexes.length) {
        const ref = await writeProgram(path.join(workDir, 'ref'), refCode, driverCode);
        Object.assign(props, {
          refDir: path.join(workDir, 'ref'),
          refFiles: ref.files.join(','),
          refEntry: ref.entry,
          refCases: refIndexes.join(',')
        });
      }

      const jobFile = path.join(workDir, 'job.properties');
      await writeFile(jobFile, Object.entries(props).map(([k, v]) => `${k}=${propEscape(v)}`).join('\n'), 'utf8');

      const jvmArgs = ['-Xmx256m', '-Xss8m', '-XX:+UseSerialGC', '-XX:TieredStopAtLevel=1', '-XX:ReservedCodeCacheSize=64m', '-XX:-UsePerfData', '-Dfile.encoding=UTF-8'];
      if (javaMajor >= 17 && javaMajor < 24) jvmArgs.push('-Djava.security.manager=allow');
      const budget = env.runner.compileTimeoutMs * 2 + (inputs.length + refIndexes.length) * props.wallLimitMs + 5000;
      const proc = await runProcess(env.runner.javaBin, [...jvmArgs, '-cp', classesDir, 'CodeTrackJudge', jobFile], budget);

      const text = existsSync(props.resultFile) ? await readFile(props.resultFile, 'utf8') : '';
      const out = { compile: null, refCompile: null, user: [], ref: {}, crashed: false };
      for (const line of text.split('\n')) {
        if (!line.trim()) continue;
        const rec = JSON.parse(line);
        if (rec.type === 'compile') out.compile = rec;
        else if (rec.type === 'refcompile') out.refCompile = rec;
        else if (rec.type === 'case' && rec.which === 'user') out.user[rec.index] = rec;
        else if (rec.type === 'case' && rec.which === 'ref') out.ref[rec.index] = rec;
      }

      if (!out.compile) {
        out.crashed = true;
        out.detail = proc.killed ? 'The judge took too long to respond' : proc.stderr.split('\n').filter((l) => !/^(WARNING|Picked up)/.test(l)).join('\n').trim();
      }
      return out;
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  });
}

/** Normalise output before comparing: unify line endings, ignore trailing spaces and blank lines. */
export function normalizeOutput(text) {
  return String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}
