import fs from 'node:fs';
import { spawn } from 'node:child_process';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    setTmpDirectory,
    cleanup,
    npm,
    rimraf,
    onlyUnix,
    printDuration,
    isWin,
    terminalPrompt,
    nodeVersionWarning,
    getPackageJson,
} from './utils';

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
    });

    describe('npm', () => {
        it('should spawn npm process with correct arguments', async () => {
            const mockSpawn = vi.mocked(spawn)
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
                })
            );
        });
    });

    describe('rimraf', () => {
        it('should remove directory recursively', () => {
            vi.mocked(fs.existsSync).mockReturnValue(true);
            vi.mocked(fs.readdirSync)
                .mockReturnValueOnce(['file1', 'dir1'] as unknown as fs.Dirent[])
                .mockReturnValueOnce([])
            vi.mocked(fs.lstatSync).mockImplementation((path) => ({
                isDirectory: () => (path as string).endsWith('dir1'),
            }) as any);

            rimraf('/test/dir');

            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(fs.rmdirSync).toHaveBeenCalled();
        });
    });

    describe('onlyUnix', () => {
        it('should return empty string on Windows', () => {
            vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');
            expect(onlyUnix('test')).toBe('test');
        });

        it('should return string on Unix', () => {
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
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

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
