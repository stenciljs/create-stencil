import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

// mock fetch before importing the module under test
vi.mock('node-fetch', () => {
  const fn = vi.fn();
  (globalThis as any).__fetchMock = fn;
  return { default: fn };
});

// mock HttpsProxyAgent to assert agent creation
vi.mock('https-proxy-agent', () => {
  class MockHttpsProxyAgent {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  }
  return { HttpsProxyAgent: MockHttpsProxyAgent };
});

import { downloadStarter, verifyStarterExists } from './download';
import { Starter } from './starters';
import { HttpsProxyAgent } from 'https-proxy-agent';

const fetchMock = (globalThis as any).__fetchMock as ReturnType<typeof vi.fn>;

describe('download (mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env['https_proxy'];
  });

  afterEach(() => {
    fetchMock.mockReset();
    delete process.env['https_proxy'];
  });

  it('uses https proxy agent when https_proxy is set', async () => {
    process.env['https_proxy'] = 'http://proxy.example.com:8080';

    const buffer = new ArrayBuffer(1);
    fetchMock.mockResolvedValue({
      arrayBuffer: () => Promise.resolve(buffer),
    });

    const starter: Starter = { name: 'component', repo: 'stenciljs/component-starter' };
    await downloadStarter(starter);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [_url, options] = fetchMock.mock.calls[0] as [string, any];
    expect(options.agent).toBeInstanceOf(HttpsProxyAgent as unknown as typeof MockHttpsProxyAgent);
  });

  it('passes HEAD method for verifyStarterExists', async () => {
    fetchMock.mockResolvedValue({ status: 200 });

    const starter: Starter = { name: 'component', repo: 'stenciljs/component-starter' };
    await verifyStarterExists(starter);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [_url, options] = fetchMock.mock.calls[0] as [string, any];
    expect(options.method).toBe('HEAD');
  });

  it('accepts string URL in downloadStarter', async () => {
    const buffer = new ArrayBuffer(4);
    fetchMock.mockResolvedValue({
      arrayBuffer: () => Promise.resolve(buffer),
    });

    const url = 'https://example.com/archive.zip';
    await downloadStarter(url);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [passedUrl] = fetchMock.mock.calls[0] as [URL, any];
    expect(passedUrl.toString()).toBe(url);
  });
});


