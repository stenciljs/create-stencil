import { describe, it, expect, afterEach, vi } from 'vitest';

import { getPkgVersion } from './version';
import { getPackageJson } from './utils';

vi.mock('./utils', () => ({
  getPackageJson: vi.fn()
}));

describe('version', () => {
  describe('getPkgVersion', () => {
    afterEach(() => {
      vi.mocked(getPackageJson).mockRestore();
    });

    it('throws if package.json cannot be found', () => {
      vi.mocked(getPackageJson).mockImplementation(() => null);
      expect(() => getPkgVersion()).toThrow('the version of this package could not be determined');
    });

    it('throws if the version number cannot be found in package.json', () => {
      vi.mocked(getPackageJson).mockImplementation(() => ({}));
      expect(() => getPkgVersion()).toThrow('the version of this package could not be determined');
    });

    it('returns the version number found in package.json', () => {
      vi.mocked(getPackageJson).mockImplementation(() => ({ version: '0.0.0' }));
      expect(getPkgVersion()).toBe('0.0.0');
    });
  });
});
