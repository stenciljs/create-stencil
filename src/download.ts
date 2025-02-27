import fetch, { type RequestInit } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { Starter } from './starters';

/**
 * Build a URL to retrieve a starter template from a GitHub instance
 *
 * This function assumes that the starter will always be in a GitHub instance, as it returns a URL in string form that
 * is specific to GitHub.
 *
 * @param starter metadata for the starter template to build a URL for
 * @returns the generated URL to pull the template from
 */
export function getStarterUrl(starter: Starter): string {
  return new URL(`${starter.repo}/archive/main.zip`, getGitHubUrl()).toString();
}

/**
 * Retrieve the URL for the GitHub instance to pull the starter template from
 *
 * This function searches for the following environment variables (in order), using the first one that is found:
 * 1. stencil_self_hosted_url
 * 2. npm_config_stencil_self_hosted_url
 * 3. None - default to the publicly available GitHub instance
 *
 * @returns the URL for GitHub
 */
export function getGitHubUrl(): string {
  return (
    process.env['stencil_self_hosted_url'] ?? process.env['npm_config_stencil_self_hosted_url'] ?? 'https://github.com/'
  );
}

function getRequestOptions(starter: string | Starter) {
  const url = new URL(typeof starter === 'string' ? starter : getStarterUrl(starter));
  const options: RequestInit = {
    follow: Infinity
  }
  if (process.env['https_proxy']) {
    const agent = new HttpsProxyAgent(process.env['https_proxy']);
    options.agent = agent;
  }
  return { url, options };
}

export async function downloadStarter(starter: Starter | string): Promise<ArrayBuffer> {
  const { url, options } = getRequestOptions(starter);
  const response = await fetch(url, options);
  return response.arrayBuffer();
}

export async function verifyStarterExists(starter: Starter | string) {
  const { url, options } = getRequestOptions(starter);
  options.method = 'HEAD';
  const response = await fetch(url, options);
  return response.status === 200;
}
