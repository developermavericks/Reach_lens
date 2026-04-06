import { ScraperService } from './services/ScraperService.js';
import { SocialScraperService } from './services/SocialScraperService.js';

const scraper = new ScraperService();
const social = new SocialScraperService();

(async () => {
    const url = 'https://techcrunch.com/2024/02/09/example-article';
    // Use a real URL that likely has mentions or just test functionality
    // Better: use a well known one like:
    // https://www.theverge.com/2023/12/6/23990466/google-gemini-llm-ai-model
    const testUrl = 'https://www.theverge.com/2023/12/6/23990466/google-gemini-llm-ai-model';

    console.log('Testing Scrapers for:', testUrl);

    try {
        console.log('--- Reddit ---');
        const reddit = await social.scrapeReddit(testUrl);
        console.log('Reddit Result:', JSON.stringify(reddit, null, 2));

        console.log('--- Google ---');
        const google = await scraper.scrapeUrl(testUrl);
        console.log('Google Result:', JSON.stringify(google, null, 2));

    } catch (e) {
        console.error(e);
    }
})();
