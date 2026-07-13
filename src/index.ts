/// <reference types="node" />
import { spawn } from 'child_process';

// Temporary v5 shim: forwards straight to `stencil init` (@stencil/cli).
// Published under the `next` dist-tag so `npm init stencil@next` can preview
// the future `npx stencil init` flow ahead of the v5 release, while
// `npm init stencil` (latest) keeps using the existing create-app flow.
const args = process.argv.slice(2);

// This process is itself a nested child of `npm init stencil@next`, so it inherits that
// outer npm invocation's `npm_config_*` env vars. Left alone, the child @stencil/cli process
// (and the npm installs it runs internally) inherits and gets confused by that stale config
// instead of computing its own fresh from cwd - strip it before spawning.
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/^npm_config_/i.test(key)));

const child = spawn('npx', ['--yes', '@stencil/cli@latest', 'init', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env,
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
