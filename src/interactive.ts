import fs from 'node:fs';

import { select, isCancel, cancel, text, confirm, outro } from '@clack/prompts'
import { dim, bold } from 'colorette';

import { verifyStarterExists } from './download';
import { createApp, prepareStarter } from './create-app';
import { STARTERS, Starter, getStarterRepo } from './starters';

/**
 * A prefix for community-driven projects
 */
const COMMUNITY_PREFIX = '[community]';

export async function runInteractive(starterName: string | undefined, autoRun: boolean) {
  // Get starter's repo
  if (!starterName) {
    starterName = await askStarterName();
  }
  const starter = getStarterRepo(starterName);

  // verify that the starter exists
  const starterExist = await verifyStarterExists(starter);
  if (!starterExist) {
    throw new Error(`Starter template "${starter.repo}" not found`);
  }

  // start downloading in the background
  prepareStarter(starter);

  // Get project name
  const projectName = await askProjectName();

  // Ask for confirmation
  const confirm = await askConfirm(starter, projectName);
  if (confirm) {
    await createApp(starter, projectName, autoRun);
    outro(`Project "${projectName}" created successfully! 🎉`);
  } else {
    outro(`Aborting!\n\nBye! 👋`);
  }
}

/**
 * Prompt the user for the name of a starter project to bootstrap with
 * @returns the name of the starter project to use
 */
async function askStarterName(): Promise<string> {
  let starterName = await select({
    /**
     * the width of this message is intentionally kept to ~80 characters. this is a slightly arbitrary decision to
     * prevent one long single line message in wide terminal windows. this _should_ be changeable without any
     * negative impact on the code.
     */
    message: 'Select a starter project.',
    options: [
      ...getChoices(),
      {
        value: 'custom',
        label: 'Type a custom starter',
      }
    ]
  });

  if (isCancel(starterName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  if (starterName === 'custom') {
    starterName = await text({
      message: 'Type a custom starter',
      placeholder: 'e.g. https://github.com/stencil-community/stencil-app-starter',
    });
  }

  if (isCancel(starterName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  if (!starterName) {
    throw new Error(`No starter was provided, try again.`);
  }

  return starterName;
}

/**
 * Generate a terminal-friendly list of options for the user to select from
 * @returns a formatted list of starter options
 */
function getChoices(): { label: string; value: string }[] {
  const maxLength = Math.max(...STARTERS.map((s) => generateStarterName(s).length)) + 1;
  return [
    ...STARTERS.filter((s) => s.hidden !== true).map((s) => {
      const description = s.description ? dim(s.description) : '';
      return {
        label: `${padEnd(generateStarterName(s), maxLength)}   ${description}`,
        value: s.name,
        hint: s.isCommunity ? 'Community-driven starter project' : undefined,
      };
    }),
  ];
}

/**
 * Generate the user-displayed name of the starter project
 * @param starter the starter project to format
 * @returns the formatted name
 */
function generateStarterName(starter: Starter): string {
  // ensure that community packages are differentiated from those supported by Ionic/the Stencil team
  return starter.isCommunity ? `${starter.name} ${COMMUNITY_PREFIX}` : starter.name;
}

async function askProjectName() {
  const projectName = await text({
    message: 'Project name',
    validate: (value) => {
      if (!value) {
        return 'Project name is required';
      }
      if (fs.existsSync(value)) {
        return `Project "${value}" name already exists`;
      }
    },
  });

  if (isCancel(projectName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return projectName;
}

async function askConfirm(starter: Starter, projectName: string) {
  const ok = await confirm({
    message: `Create ${bold(starter.name)} project with name "${projectName}"?
    
Confirm?`,
    initialValue: true,
  });

  if (isCancel(ok)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return ok;
}

function padEnd(str: string, targetLength: number, padString = ' ') {
  targetLength = targetLength >> 0;
  if (str.length > targetLength) {
    return str;
  }

  targetLength = targetLength - str.length;
  if (targetLength > padString.length) {
    padString += padString.repeat(targetLength / padString.length);
  }

  return String(str) + padString.slice(0, targetLength);
}
