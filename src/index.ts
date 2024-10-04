import * as core from '@actions/core';
import * as Jira from './jira';
import * as Github from './github';
import * as github from '@actions/github';
import { logger } from './logger';
import { setConfig } from './config';
import { config } from 'dotenv';


let attempts = 0;
const env = globalThis.process?.env ?? {};
const MAX_ATTEMPTS = 2;
const DELAY_MS_PER_ATTEMPT = 1000;

if (env.NODE_ENV === 'development') {
  config();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryTransitionIssue() {
  const prTitle = github.context.payload.pull_request?.title ?? 'CD-20309';
  const jiraIssueKey = Jira.getJiraIssueKey(prTitle);
  if (!jiraIssueKey) {
    throw new Error('Jira issue key was not found in "' + prTitle + '"');
  }
  try {
    await Jira.getToNextJiraStatus(jiraIssueKey);
  } catch (error) {

    if (error.message.includes('ERR_SOCKET_CONNECTION_TIMEOUT') && attempts < MAX_ATTEMPTS) {
      logger.info('tryTransitionIssue', `Failed attempt #${attempts} out of ${MAX_ATTEMPTS} due to ERR_SOCKET_CONNECTION_TIMEOUT`);
      attempts++;
      await wait(attempts * DELAY_MS_PER_ATTEMPT + DELAY_MS_PER_ATTEMPT);
      tryTransitionIssue();
      return;
    }

    logger.error('tryTransitionIssue', error?.message ?? error);
    await Github.leaveComment(`The Jira-Github action failed. Please check the logs.`).catch((_err) => {
      logger.error('tryTransitionIssue', _err?.message ?? _err);
    });
    core.setFailed(error.message);
  }
}

function configure() {
  const jiraSite = core.getInput('jira-site') || env.JGBFF_JIRA_SITE!;
  const jiraUsername = core.getInput('jira-username') || env.JGBFF_JIRA_USERNAME!;
  const jiraToken = core.getInput('jira-token') || env.JGBFF_JIRA_TOKEN!;
  const githubToken = core.getInput('github-token') || env.JGBFF_GITHUB_TOKEN!;
  const githubOwner = core.getInput('github-owner') || env.JGBFF_GITHUB_OWNER!;
  const githubRepo = core.getInput('github-repo') || env.JGBFF_GITHUB_REPO!;
  setConfig({
    jiraSite,
    jiraToken,
    jiraUsername,
    githubToken,
    githubRepo,
    githubOwner,
  });
}

async function run() {
  try {
    configure();
    await tryTransitionIssue();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().catch((error) => {
  core.setFailed(error.message);
});
