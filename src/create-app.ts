import fs from 'node:fs';
import path from 'node:path';

import { bold, cyan, dim, green, yellow } from 'colorette';
import { log, spinner } from '@clack/prompts';

import { downloadStarter } from './download';
import { Starter } from './starters';
import { unZipBuffer } from './unzip';
import { npm, onlyUnix, printDuration, setTmpDirectory, terminalPrompt } from './utils';
import { replaceInFile } from 'replace-in-file';
import { commitAllFiles, hasGit, inExistingGitTree, initGit } from './git';

const starterCache = new Map<Starter, Promise<undefined | ((name: string) => Promise<void>)>>();

export async function createApp(starter: Starter, projectName: string, autoRun: boolean) {
  if (fs.existsSync(projectName)) {
    throw new Error(`Folder "./${projectName}" already exists, please choose a different project name.`);
  }

  projectName = projectName.toLowerCase().trim();

  if (!validateProjectName(projectName)) {
    throw new Error(`Project name "${projectName}" is not valid. It must be a kebab-case name without spaces.`);
  }

  const loading = spinner();
  loading.start(bold('Preparing starter'));

  const startT = Date.now();
  const moveTo = await prepareStarter(starter);
  if (!moveTo) {
    throw new Error('starter install failed');
  }
  await moveTo(projectName);
  loading.stop('Done!');

  const time = printDuration(Date.now() - startT);
  let didGitSucceed = initGitForStarter(projectName);

  if (didGitSucceed) {
    log.success(`${green('✔')} ${bold('All setup')} ${onlyUnix('🎉')} ${dim(time)}`);
  } else {
    // an error occurred setting up git for the project. log it, but don't block creating the project
    log.warn(`${yellow('❗')} We were unable to ensure git was configured for this project.`);
    log.success(`${green('✔')} ${bold('However, your project was still created')} ${onlyUnix('🎉')} ${dim(time)}`);
  }

  // newline here is intentional in relation to the previous logged statements
  console.log(`
  ${dim('We suggest that you begin by typing:')}
  
  ${dim(terminalPrompt())} ${green('cd')} ${projectName}
  ${dim(terminalPrompt())} ${green('npm install')}
  ${dim(terminalPrompt())} ${green('npm start')}

  ${dim('You may find the following commands will be helpful:')}

  ${dim(terminalPrompt())} ${green('npm start')}
    Starts the development server.

  ${dim(terminalPrompt())} ${green('npm run build')}
    Builds your project in production mode.

  ${dim(terminalPrompt())} ${green('npm test')}
    Starts the test runner.

${renderDocs(starter)}

  🗣️  ${dim(`Join the Stencil Community on Discord: `)}
     ${cyan('https://chat.stenciljs.com')}

  Happy coding! 🎈
`);

  if (autoRun) {
    await npm('start', projectName, 'inherit');
  }
}

function renderDocs(starter: Starter) {
  const docs = starter.docs;
  if (!docs) {
    return '';
  }
  return `
  📚 ${dim('Further reading:')}
   ${dim('-')} ${cyan(docs)}
   ${dim('-')} ${cyan('https://stenciljs.com/docs')}`;
}

export function prepareStarter(starter: Starter) {
  let promise = starterCache.get(starter);
  if (!promise) {
    promise = prepare(starter);
    // silent crash, we will handle later
    promise.catch((err: unknown) => {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`\n\nFailed to setup starter project "${starter.name}": ${error}\n\n`);
      return;
    });
    starterCache.set(starter, promise);
  }
  return promise;
}

async function prepare(starter: Starter) {
  const baseDir = process.cwd();
  const tmpPath = path.join(baseDir, '.tmp-stencil-starter');
  const buffer = await downloadStarter(starter);
  setTmpDirectory(tmpPath);

  await unZipBuffer(buffer, tmpPath);
  await npm('ci', tmpPath);

  return async (projectName: string) => {
    const filePath = path.join(baseDir, projectName);
    await fs.promises.rename(tmpPath, filePath);
    await replaceInFile({
      files: [path.join(filePath, '*'), path.join(filePath, 'src/*')],
      from: /stencil-starter-project-name/g,
      to: projectName,
      glob: {
        windowsPathsNoEscape: true,
      },
    });
    setTmpDirectory(null);
  };
}

function validateProjectName(projectName: string) {
  return !/[^a-zA-Z0-9-]/.test(projectName);
}

/**
 * Helper for performing the necessary steps to create a git repository for a new project
 * @param directory the name of the new project's directory
 * @returns true if no issues were encountered, false otherwise
 */
const initGitForStarter = (directory: string): boolean => {
  if (!changeDir(directory) || !hasGit()) {
    // we failed to swtich to the directory to check/create the repo
    // _or_ we didn't have `git` on the path
    return false;
  }

  if (inExistingGitTree()) {
    // we're already in a git tree, don't attempt to create one
    return true;
  }

  if (!initGit()) {
    // we failed to create a new git repo
    return false;
  }

  return commitAllFiles();
};

/**
 * Helper method for switching to a new directory on disk
 * @param moveTo the directory name to switch to
 * @returns true if the switch occurred successfully, false otherwise
 */
export function changeDir(moveTo: string): boolean {
  let wasSuccess = false;
  try {
    process.chdir(moveTo);
    wasSuccess = true;
  } catch (err: unknown) {
    console.error(err);
  }
  return wasSuccess;
}
