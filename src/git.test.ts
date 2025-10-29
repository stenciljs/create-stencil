import { execSync } from 'node:child_process';

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { commitAllFiles, hasGit, inExistingGitTree, initGit } from './git';
import { getPkgVersion } from './version';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

const MOCK_PKG_JSON_VERSION = '3.0.0';
vi.mock('./version', () => ({
  getPkgVersion: vi.fn().mockReturnValue('3.0.0'),
}));

vi.mock('@clack/prompts', () => ({
  log: {
    warn: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
  intro: vi.fn(),
  outro: vi.fn(),
}));

describe('git', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('hasGit', () => {
    it('returns true when git is on the path', () => {
      vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
        console.log('cmd', cmd);
        switch (cmd) {
          case 'git --version':
            return Buffer.alloc(0);
          default:
            throw new Error(`unmocked command ${cmd}`);
        }
      });

      expect(hasGit()).toBe(true);
    });

    it('returns false when git is not on the path', () => {
      vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
        switch (cmd) {
          case 'git --version':
            throw new Error('`git` could not be found');
          default:
            throw new Error(`unmocked command ${cmd}`);
        }
      });

      expect(hasGit()).toBe(false);
    });
  });

  describe('inExistingGitTree', () => {
    it('returns status of true when a project is in existing git repo', () => {
      vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
        switch (cmd) {
          case 'git rev-parse --is-inside-work-tree':
            return Buffer.alloc(0);
          default:
            throw new Error(`unmocked command ${cmd}`);
        }
      });

      expect(inExistingGitTree()).toBe(true);
    });

    it('returns status of false when a project is not in existing git repo', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('fatal: not a git repository (or any of the parent directories): .git');
      });
      expect(inExistingGitTree()).toBe(false);
    });
  });

  describe('initGit', () => {
    it('returns true when git is successfully initialized', () => {
      vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
        switch (cmd) {
          case 'git init':
            return Buffer.alloc(0);
          default:
            throw new Error(`unmocked command ${cmd}`);
        }
      });
      expect(initGit()).toBe(true);
    });

    it('returns false when git repo initialization fails', () => {
      vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
        switch (cmd) {
          case 'git init':
            throw new Error('`git init` failed for some reason');
          default:
            throw new Error(`unmocked command ${cmd}`);
        }
      });
      expect(initGit()).toBe(false);
    });

    it('returns false when git init throws non-Error exception', () => {
      vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
        switch (cmd) {
          case 'git init':
            throw 'string error message'; // Non-Error exception
          default:
            throw new Error(`unmocked command ${cmd}`);
        }
      });
      expect(initGit()).toBe(false);
    });
  });

  describe('commitGit', () => {
    beforeEach(() => {
      vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
        switch (cmd) {
          case 'git add -A':
            return Buffer.alloc(0);
          case `git commit -m "init with create-stencil v${MOCK_PKG_JSON_VERSION}"`:
          case `git commit -m "init with create-stencil"`:
            return Buffer.alloc(0);
          default:
            throw new Error(`unmocked command ${cmd}`);
        }
      });
    });

    it('returns true when files are committed', () => {
      vi.mocked(getPkgVersion).mockReturnValue('3.0.0');
      expect(commitAllFiles()).toBe(true);
    });

    it('returns true when files are committed even if version retrieval fails', () => {
      vi.mocked(getPkgVersion).mockImplementation(() => {
        throw new Error('Could not determine version');
      });
      expect(commitAllFiles()).toBe(true);
    });

    describe("'git add' fails", () => {
      beforeEach(() => {
        vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
          switch (cmd) {
            case 'git add -A':
              throw new Error('git add has failed for some reason');
            case `git commit -m "init with create-stencil v${MOCK_PKG_JSON_VERSION}"`:
              throw new Error('git commit should not have been reached!');
            default:
              throw new Error(`unmocked command ${cmd}`);
          }
        });
      });

      it('returns false ', () => {
        expect(commitAllFiles()).toBe(false);
      });

      it('does not attempt to commit files', () => {
        commitAllFiles();

        expect(vi.mocked(execSync)).toHaveBeenCalledTimes(1);
        expect(vi.mocked(execSync)).toHaveBeenCalledWith('git add -A', { stdio: 'ignore' });
      });
    });

    describe("'git commit' fails", () => {
      it("returns false when 'git commit' fails", () => {
        vi.mocked(execSync).mockImplementation((cmd: string, _options: unknown | undefined) => {
          switch (cmd) {
            case 'git add -A':
              return Buffer.alloc(0);
            case `git commit -m "init with create-stencil v${MOCK_PKG_JSON_VERSION}"`:
              throw new Error('git commit has failed for some reason');
            default:
              throw new Error(`unmocked command ${cmd}`);
          }
        });
        expect(commitAllFiles()).toBe(false);
      });
    });
  });
});
