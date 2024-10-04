import JiraClient from 'jira-client';
import { getConfig } from './config';
import { logger } from './logger';


let _client: JiraClient;

const getJiraClient = () => {
    if (!_client) {
        _client = new JiraClient({
            protocol: 'https',
            host: getConfig().jiraSite,
            username: getConfig().jiraUsername,
            password: getConfig().jiraToken,
            apiVersion: '2',
            strictSSL: true,
            timeout: 15000,
        });
    }
    return _client;
}

interface JiraTransition {
    id: string;
    name: string;
    isAvailable: boolean;
}

const transitionIssue = (issueId: string, transition: JiraTransition) => {
    return getJiraClient().transitionIssue(issueId, { transition: { id: transition.id } }).catch((error) => {
        logger.error('transitionIssue', error);
        throw error;
    });
}

export const getToNextJiraStatus = async (issueId: string) => {
    const jiraClient = getJiraClient();
    try {
        let [jiraIssue, transitionResponse] = await Promise.all([jiraClient.getIssue(issueId), jiraClient.listTransitions(issueId)]);
        const status = jiraIssue.fields.status;
        if (status?.name.toLocaleLowerCase() === 'in progress') {
            const transitions: JiraTransition[] = transitionResponse.transitions;

            const nextTransition = transitions.find((transition) => transition.name.toLocaleLowerCase() === 'to code review');

            if (!nextTransition) {
                throw new Error(`Failed to transition from "${status}". Available transitions ${transitions.map((t) => t.name).join(', ')}`);
            }
            await transitionIssue(issueId, nextTransition);
            [jiraIssue, transitionResponse] = await Promise.all([jiraClient.getIssue(issueId), jiraClient.listTransitions(issueId)]);
        }

        // Expected to be "In Code Review"
        const transitions: JiraTransition[] = transitionResponse.transitions;
        const nextTransition = transitions.find((transition) => transition.name.toLocaleLowerCase() === 'to in nightly' || transition.name.toLocaleLowerCase() === 'to in epic');

        if (!nextTransition) {
            const allowedTransitions = transitions.map(t => t.name);
            const currentStatus = jiraIssue.fields?.status?.name ?? 'unknown';
            if (!currentStatus) {
              logger.info('tryTransitionIssue', JSON.stringify(jiraIssue));
            }
            const errorMessage = `No valid transitions found from merging ${issueId}. Current Jira ticket status is "${currentStatus}", and we are allowed to transition to ${allowedTransitions.join(', ')}`; 
            throw new Error(errorMessage);
        }
        await transitionIssue(issueId, nextTransition);
        logger.info('tryTransitionIssue', `${issueId} was successfully transitioned to ${nextTransition.name}`);
    } catch (error) {
        logger.error('getNextTransition', error);
        throw error;
    }
}

export function getJiraIssueKey(title: string | undefined) {
    if (!title) {
        return null;
    }
    return title.match(/^([a-zA-Z]+-[\d]+)/)?.[0] ?? null;
}
