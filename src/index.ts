import * as core from '@actions/core';
import * as github from '@actions/github';
import { getJiraIssueKey } from './jira';

try {
  const prTitle = github.context.payload.pull_request?.title;
  const issueKey = getJiraIssueKey(prTitle);

  console.log(`Debug:: JIRA issueKey ${issueKey}`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
