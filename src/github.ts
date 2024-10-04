import { getOctokit, context } from '@actions/github';
import { getConfig } from './config';
import { logger } from './logger';

export const leaveComment = (comment: string) => {
    const config = getConfig();
    if (!config.githubToken) {
        logger.error('leaveComment', 'Github token not set');
        return Promise.resolve();
    }
    const pull_request_number = context?.payload?.pull_request?.number ?? 1;

    if (pull_request_number === undefined) {
        logger.error('leaveComment', 'Pull request number not found');
        return Promise.resolve();
    }

    const octokit = getOctokit(config.githubToken);
    return octokit.rest.issues.createComment({
        owner: config.githubOwner,
        repo: config.githubRepo,
        issue_number: pull_request_number,
        body: comment,
    }).then(() => {
        logger.info('leaveComment.success', comment);
    }).catch((error) => {
        logger.error('leaveComment.fail', error);
        throw error;
    });
}