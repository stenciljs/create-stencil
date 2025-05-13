import { describe, expect, it, afterEach } from 'vitest';
import { Starter } from './starters';
import { getGitHubUrl, getStarterUrl, verifyStarterExists } from './download';

describe('download', () => {
  describe('verifyStarterExists', () => {
    it('returns false if starter does not exist', async () => {
      expect(
        await verifyStarterExists({
          repo: 'foo/bar',
          name: 'foo-bar-starter',
        }),
      ).toBe(false);
    });

    it('returns true if starter does exist', async () => {
      expect(
        await verifyStarterExists({
          repo: 'stenciljs/core',
          name: 'stencil',
        }),
      ).toBe(true);
    });
  });

  describe('getStarterUrl', () => {
    it('returns a well formed URL from the given starter', () => {
      const repo = 'ionic-team/mock-stencil-template';
      const starter: Starter = {
        name: 'test-starter',
        repo,
      };

      expect(getStarterUrl(starter)).toBe(`https://github.com/${repo}/archive/main.zip`);
    });

    describe('self-hosted url', () => {
      afterEach(() => {
        delete process.env['npm_config_stencil_self_hosted_url'];
        delete process.env['stencil_self_hosted_url'];
      });

      it.each(['https://ionic.io/', 'https://ionic.io'])(
        "returns a well formed self-hosted URL '(%s)' when npm_config_stencil_self_hosted_url is set",
        (selfHostedUrl) => {
          process.env['npm_config_stencil_self_hosted_url'] = selfHostedUrl;

          expect(getGitHubUrl()).toBe(selfHostedUrl);
        },
      );

      it.each(['https://ionic.io/', 'https://ionic.io'])(
        "returns a well formed self-hosted URL '(%s)' when stencil_self_hosted_url is set",
        (selfHostedUrl) => {
          process.env['stencil_self_hosted_url'] = selfHostedUrl;

          expect(getGitHubUrl()).toBe(selfHostedUrl);
        },
      );

      it('uses stencil_self_hosted_url over npm_config_stencil_self_hosted_url', () => {
        const npmConfigUrl = 'https://ionic.io/opt-1';

        process.env['stencil_self_hosted_url'] = npmConfigUrl;
        process.env['npm_config_stencil_self_hosted_url'] = 'https://ionic.io/opt-2';

        expect(getGitHubUrl()).toBe(npmConfigUrl);
      });
    });
  });

  describe('getGitHubUrl', () => {
    describe('self-hosted url', () => {
      afterEach(() => {
        delete process.env['stencil_self_hosted_url'];
      });

      it('returns a self-hosted url when one is provided', () => {
        const mockSelfHostedUrl = 'https://ionic.io/';
        process.env['stencil_self_hosted_url'] = mockSelfHostedUrl;

        expect(getGitHubUrl()).toBe(mockSelfHostedUrl);
      });
    });

    it('returns the default GitHub host when no self-hosted option is provided', () => {
      expect(getGitHubUrl()).toBe('https://github.com/');
    });
  });
});
