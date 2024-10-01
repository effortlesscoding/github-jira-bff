export function getJiraIssueKey(title: string | undefined) {
    if (!title) {
        return null;
    }
    return title.match(/^([a-zA-Z]+-[\d]+)/)?.[0] ?? null;
}