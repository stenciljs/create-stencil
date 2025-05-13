import { describe, expect, it } from 'vitest';
import { getStarterRepo, Starter } from './starters';

describe('starters', () => {
  describe('getStarterRepo', () => {
    it('returns the correct starter info for a custom repo', () => {
      const starterRepo = 'github.com/custom-stencil-starter';

      const starterInfo = getStarterRepo(starterRepo);

      expect(starterInfo).toEqual<Starter>({
        name: starterRepo,
        repo: starterRepo,
      });
    });

    it('returns a known starter project when specified by name', () => {
      const starterInfo = getStarterRepo('component');

      expect(starterInfo).toEqual<Starter>({
        description: 'Collection of web components that can be used anywhere',
        docs: 'https://github.com/stenciljs/component-starter',
        name: 'component',
        repo: 'stenciljs/component-starter',
      });
    });

    it('throws an error for an unknown starter project', () => {
      expect(() => getStarterRepo('unknown')).toThrow('Starter "unknown" does not exist.');
    });
  });
});
