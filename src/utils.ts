import fs from 'node:fs';
import url from 'node:url';
import path from 'node:path';
import { ChildProcess, spawn } from 'node:child_process';
import { yellow } from 'colorette';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const childrenProcesses: ChildProcess[] = [];
let tmpDirectory: string | null = null;

export function setTmpDirectory(dir: string | null) {
  tmpDirectory = dir;
  if (dir) {
    rimraf(dir);
    process.once('uncaughtException', () => cleanup(true));
    process.once('exit', () => cleanup());
    process.once('SIGINT', () => cleanup());
    process.once('SIGTERM', () => cleanup());
  }
}

export function cleanup(didError = false) {
  if (tmpDirectory) {
    killChildren();
  }
  setTimeout(() => {
    if (tmpDirectory) {
      rimraf(tmpDirectory);
      tmpDirectory = null;
    }
    process.exit(didError ? 1 : 0);
  }, 200);
}

export function killChildren() {
  childrenProcesses.forEach((p) => p.kill('SIGINT'));
}

export function npm(command: string, projectPath: string, stdio: any = 'ignore') {
  return new Promise<void>((resolve, reject) => {
    const p = spawn('npm', [command], {
      shell: true,
      stdio,
      cwd: projectPath,
    });
    p.once('exit', () => resolve());
    p.once('error', reject);
    childrenProcesses.push(p);
  });
}

export function rimraf(dir_path: string) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach((entry) => {
      const entry_path = path.join(dir_path, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path);
      } else {
        fs.unlinkSync(entry_path);
      }
    });
    fs.rmdirSync(dir_path);
  }
}

export function onlyUnix(str: string) {
  return isWin() ? str : '';
}

export function printDuration(duration: number) {
  if (duration > 1000) {
    return `in ${(duration / 1000).toFixed(2)} s`;
  } else {
    const ms = parseFloat(duration.toFixed(3));
    return `in ${ms} ms`;
  }
}

export function isWin() {
  return process.platform === 'win32';
}

export function terminalPrompt() {
  return isWin() ? '>' : '$';
}

export function nodeVersionWarning() {
  try {
    const v = process.version.replace('v', '').split('.');
    // assume a major version number of '0' if for some reason the major version is parsed as `undefined`
    const major = parseInt(v[0] ?? '0', 10);
    if (major < 10) {
      console.log(
        yellow(
          `Your current version of Node is ${process.version}, however the recommendation is a minimum of Node v10. Note that future versions of Stencil will eventually remove support for non-LTS Node versions.`,
        ),
      );
    }
  } catch (e) {}
}

/**
 * Returns the result of attempting to read and parse the project's `package.json`
 */
export const getPackageJson = () => {
  const packageJsonPath = path.join(__dirname, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath).toString());
};
