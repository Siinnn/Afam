import { formatDate } from '../src/lib/utils';

describe('formatDate', () => {
    it('formats a date string correctly in French', () => {
        const date = '2023-10-25';
        // Note: The output depends on the system locale if not forced, but we forced 'fr-FR' in the utility.
        // However, Node's ICU data might vary. Let's expect the standard format.
        expect(formatDate(date)).toBe('25 octobre 2023');
    });

    it('formats a Date object correctly', () => {
        const date = new Date('2023-01-01');
        expect(formatDate(date)).toBe('1 janvier 2023');
    });
});
