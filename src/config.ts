const config = {
    jiraSite: '',
    jiraUsername: '',
    jiraToken: '',
    githubToken: '',
    githubOwner: '',
    githubRepo: '',
};

export const getConfig = () => config;

export const setConfig = (values: typeof config) => {
    config.jiraSite = values.jiraSite;
    config.jiraUsername = values.jiraUsername;
    config.jiraToken = values.jiraToken;
    config.githubToken = values.githubToken;
    config.githubOwner = values.githubOwner;
    config.githubRepo = values.githubRepo;
}