import * as core from '@actions/core';
import * as github from '@actions/github';

try {
  // `who-to-greet` input defined in action metadata file
  const githubHeadRef = (github.context as any).githubHeadRef;
  console.log(`Debug:: githubHeadRef ${githubHeadRef}`);

  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const actor = JSON.stringify(github.context.actor, undefined, 2)

  console.log(`The event actor: ${actor}`);
} catch (error) {
  core.setFailed(error.message);
}
