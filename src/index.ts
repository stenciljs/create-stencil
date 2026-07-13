/// <reference types="node" />
import { spawn } from 'child_process';

// Temporary v5 shim: forwards straight to `stencil init` (@stencil/cli).
// Published under the `next` dist-tag so `npm init stencil@next` can preview
// the future `npx stencil init` flow ahead of the v5 release, while
// `npm init stencil` (latest) keeps using the existing create-app flow.
const args = process.argv.slice(2);

const child = spawn('npx', ['--yes', '@stencil/cli@latest', 'init', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.once('error', (err) => {
  console.error(err);
  process.exit(1);
});

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
