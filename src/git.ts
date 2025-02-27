import { execSync } from 'node:child_process';

import { log } from '@clack/prompts';
import { green, red, yellow } from 'colorette';
import { getPkgVersion } from './version';

/**
 * Verify that git is available on the user's path.
 *
 * @returns true if git is available on the user's path, false otherwise
 */
export const hasGit = (): boolean => {
  let wasSuccess = false;
  try {
    // if `git` is not on the user's path, this will return a non-zero exit code
    // also returns a non-zero exit code if it times out
    execSync('git --version', { stdio: 'ignore' });
    wasSuccess = true;
  } catch (err: unknown) {
    console.error(err);
  }

  return wasSuccess;
};

/**
 * Check whether the current process is in a git work tree.
 *
 * This is desirable for detecting cases where a user is creating a directory inside a larger repository (e.g. monorepo)
 *
 * This function assumes that the process that invokes it is already in the desired directory. It also assumes that git
 * is on the user's path.
 *
 * @returns true if the process is in a git repository already, false otherwise
 */
export const inExistingGitTree = (): boolean => {
  let isInTree = false;
  try {
    // we may be in a subtree of an existing git repository (e.g. a monorepo), this call performs that check.
    // this call is expected fail if we are _not_ in an existing repo (I.E we go all the way up the dir tree and can't
    // find a git repo)
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });

    log.warn(`${yellow('❗')} An existing git repo was detected, a new one will not be created`);
    isInTree = true;
  } catch (_err: unknown) {
    log.success(`${green('✔')} A new git repo was initialized`);
  }
  return isInTree;
};

/**
 * Initialize a new git repository for the current working directory of the current process.
 *
 * This function assumes that the process that invokes it is already in the desired directory and that the repository
 * should be created. It also assumes that git is on the user's path.
 *
 * @returns true if the repository was successfully created, false otherwise
 */
export const initGit = (): boolean => {
  let wasSuccess = false;
  try {
    // init can fail for reasons like a malformed git config, permissions, etc.
    execSync('git init', { stdio: 'ignore' });
    wasSuccess = true;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    log.error(`${red('❌')} Failed to initialize git repository: ${errorMessage}`);
  }

  return wasSuccess;
};

/**
 * Stage all files and commit them for the current working directory of the current process.
 *
 * This function assumes that the process that invokes it is in the desired directory. It also assumes that git is on
 * the user's path.
 *
 * @returns true if the files are committed successfully, false otherwise
 */
export const commitAllFiles = (): boolean => {
  let wasSuccess = false;
  let createStencilVersion = null;
  try {
    createStencilVersion = ` v${getPkgVersion()}`;
  } catch (err: unknown) {
    // do nothing - determining the CLI version isn't strictly needed for a commit message
  }

  try {
    // add all files (including dotfiles)
    execSync('git add -A', { stdio: 'ignore' });
    // commit them
    const commitMessage = `init with create-stencil${createStencilVersion ?? ''}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'ignore' });
    wasSuccess = true;
  } catch (err: unknown) {
    console.error(err);
  }
  return wasSuccess;
};
