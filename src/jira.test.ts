import { getJiraIssueKey } from './jira';

describe('getJiraIssueKey', () => {
    const cases: [string, string | null][] = [
        ['CD-12323: Something with a jira issue key', 'CD-12323'],
        ['CD-12323asdsadasd', 'CD-12323'],
        ['not in the beginnin CD-12323asdsadasd', null],
        ['CD- incomplete', null],
        ['CD123123 without a dash', null],
        ['Something with a jira issue key CD-11111:', null],
        ['CD-11111: Something with a jira issue key CD-10000', 'CD-11111'],
    ]
    test.each(cases)('Given this title "%s", it will find jira issue key "%s"', (title, output) => {
        expect(getJiraIssueKey(title)).toEqual(output);
    })
})
