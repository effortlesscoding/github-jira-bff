# What is this repository?

Github Jira BFF will help you automatically update Jira when your Github pull request merges.

git tag <tagname>

git push --follow-tags

# What kind of workflow yml should I set up?

Here's an example of a .github/workflows/<any_name>.yml:

```
name: Jira Integration

on:
  pull_request:
    types: [closed]

jobs:
  update-jira-ticket:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    steps:
      - name: Update jira ticket status
        id: github-jira-bff
        uses: effortlesscoding/github-jira-bff@a85b2aae3cb9b314828a9ae037a1d9aa0c5b3958
        with:
          jira-site: ${{ secrets.JIRA_SITE }}
          jira-username: ${{ secrets.JIRA_USERNAME }}
          jira-token: ${{ secrets.JIRA_TOKEN }}
          github-token: ${{ secrets.JGBFF_GITHUB_TOKEN }}
          github-owner: mikecandidly
          github-repo: test-repository

```