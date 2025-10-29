import fs from 'node:fs';
import { spawn } from 'node:child_process';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setTmpDirectory,
  cleanup,
  npm,
  rimraf,
  killChildren,
  onlyUnix,
  printDuration,
  isWin,
  terminalPrompt,
  nodeVersionWarning,
  getPackageJson,
} from './utils';
import * as utils from './utils';

// Mock the fs module
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    lstatSync: vi.fn(),
    unlinkSync: vi.fn(),
    rmdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

// Mock child_process
vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('setTmpDirectory', () => {
    it('should set tmp directory and register cleanup handlers', () => {
      const processOn = vi.spyOn(process, 'once');
      setTmpDirectory('/tmp/test');
      expect(processOn).toHaveBeenCalledTimes(4);
    });

    it('should not register cleanup handlers when set to null', () => {
      const processOn = vi.spyOn(process, 'once');
      setTmpDirectory(null);
      expect(processOn).not.toHaveBeenCalled();
    });

    it('registered handlers should trigger cleanup with appropriate exit codes', () => {
      const processOn = vi.spyOn(process, 'once');
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      vi.useFakeTimers();

      setTmpDirectory('/tmp/test');

      // collect callbacks registered via process.once
      const calls = (processOn as unknown as { mock: { calls: [string, (...args: any[]) => void][] } }).mock.calls;
      expect(calls.length).toBe(4);

      const cbMap = new Map<string, (...args: any[]) => void>(calls);

      // uncaughtException should exit with code 1
      cbMap.get('uncaughtException')?.(new Error('boom'));
      vi.runAllTimers();
      expect(exitSpy).toHaveBeenLastCalledWith(1);

      // exit should exit with code 0
      exitSpy.mockClear();
      cbMap.get('exit')?.();
      vi.runAllTimers();
      expect(exitSpy).toHaveBeenLastCalledWith(0);

      // SIGINT should exit with code 0
      exitSpy.mockClear();
      cbMap.get('SIGINT')?.();
      vi.runAllTimers();
      expect(exitSpy).toHaveBeenLastCalledWith(0);

      // SIGTERM should exit with code 0
      exitSpy.mockClear();
      cbMap.get('SIGTERM')?.();
      vi.runAllTimers();
      expect(exitSpy).toHaveBeenLastCalledWith(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup and exit with code 0 on success', () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      vi.useFakeTimers();

      cleanup(false);
      vi.runAllTimers();

      expect(exitSpy).toHaveBeenCalledWith(0);
    });

    it('should cleanup and exit with code 1 on error', () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      vi.useFakeTimers();

      cleanup(true);
      vi.runAllTimers();

      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('exits cleanly when tmpDirectory is set', () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      vi.useFakeTimers();

      setTmpDirectory('/tmp/cover');
      cleanup(false);
      vi.runAllTimers();

      expect(exitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('npm', () => {
    it('should spawn npm process with correct arguments', async () => {
      const mockSpawn = vi.mocked(spawn);
      const mockProcess: any = {
        once: vi.fn().mockImplementation((event, cb) => {
          if (event === 'exit') cb();
          return mockProcess;
        }),
      };
      mockSpawn.mockReturnValue(mockProcess);

      await npm('install', '/project/path');

      expect(mockSpawn).toHaveBeenCalledWith(
        'npm',
        ['install'],
        expect.objectContaining({
          shell: true,
          stdio: 'ignore',
          cwd: '/project/path',
        }),
      );
    });
  });

  describe('killChildren', () => {
    it('should send SIGINT to all tracked child processes', async () => {
      // reset module state so childrenProcesses is empty for this test
      await vi.resetModules();

      const { npm: freshNpm, killChildren: freshKillChildren } = await import('./utils');

      const mockSpawn = vi.mocked(spawn);
      const mockProcess: any = {
        once: vi.fn().mockImplementation((event, cb) => {
          if (event === 'exit') cb();
          return mockProcess;
        }),
        kill: vi.fn(),
      };
      mockSpawn.mockReturnValue(mockProcess);

      await freshNpm('install', '/tmp/project');
      freshKillChildren();

      expect(mockProcess.kill).toHaveBeenCalledWith('SIGINT');
    });
  });

  describe('rimraf', () => {
    it('should remove directory recursively', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['file1', 'dir1'] as unknown as fs.Dirent[])
        .mockReturnValueOnce([]);
      vi.mocked(fs.lstatSync).mockImplementation(
        (path) =>
          ({
            isDirectory: () => (path as string).endsWith('dir1'),
          }) as any,
      );

      rimraf('/test/dir');

      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(fs.rmdirSync).toHaveBeenCalled();
    });
  });

  describe('onlyUnix', () => {
    it('should return string on Windows', () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
      expect(onlyUnix('test')).toBe('test');
    });

    it('should return empty string on Unix', () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
      expect(onlyUnix('test')).toBe('');
    });
  });

  describe('printDuration', () => {
    it('should format duration in seconds', () => {
      expect(printDuration(1500)).toBe('in 1.50 s');
    });

    it('should format duration in milliseconds', () => {
      expect(printDuration(500)).toBe('in 500 ms');
    });
  });

  describe('isWin', () => {
    it('should detect Windows platform', () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
      expect(isWin()).toBe(true);
    });

    it('should detect non-Windows platform', () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
      expect(isWin()).toBe(false);
    });
  });

  describe('terminalPrompt', () => {
    it('should return ">" on Windows', () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
      expect(terminalPrompt()).toBe('>');
    });

    it('should return "$" on Unix', () => {
      vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
      expect(terminalPrompt()).toBe('$');
    });
  });

  describe('nodeVersionWarning', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    it('should show warning for Node version < 10', () => {
      vi.spyOn(process, 'version', 'get').mockReturnValue('v8.0.0');
      nodeVersionWarning();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not show warning for Node version >= 10', () => {
      vi.spyOn(process, 'version', 'get').mockReturnValue('v10.0.0');
      nodeVersionWarning();
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined version part gracefully', () => {
      vi.spyOn(process, 'version', 'get').mockReturnValue('v');
      expect(() => nodeVersionWarning()).not.toThrow();
    });

    it('should handle exceptions during version parsing', () => {
      vi.spyOn(process, 'version', 'get').mockImplementation(() => {
        throw new Error('version error');
      });
      expect(() => nodeVersionWarning()).not.toThrow();
    });

    it("uses fallback '0' when version parts array is empty", () => {
      // Return a mock object that behaves like a string only for methods we use
      vi.spyOn(process, 'version', 'get').mockReturnValue({
        replace: () => ({
          split: () => [], // ensures v[0] is undefined -> fallback '0'
        }),
      } as unknown as string);

      nodeVersionWarning();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getPackageJson', () => {
    it('should read and parse package.json', () => {
      const mockData = { name: 'test-package' };
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockData));

      expect(getPackageJson()).toEqual(mockData);
      expect(fs.readFileSync).toHaveBeenCalledWith(expect.stringContaining('package.json'));
    });
  });
});
