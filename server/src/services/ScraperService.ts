import puppeteer from 'puppeteer';
import googleIt from 'google-it';

export class ScraperService {
    async scrapeUrl(url: string) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        });
        const page = await browser.newPage();

        // Set User Agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        try {
            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            const title = await page.title();
            console.log(`Title found: ${title}`);

            const mentions = await this.searchMentions(url, title);

            return { title, url, totalMentions: mentions };
        } catch (error) {
            console.error('Scraping failed:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }

    async searchMentions(url: string, title?: string) {
        console.log(`Searching mentions for: ${url}`);

        // 1. Direct URL Search
        try {
            // @ts-ignore
            const results = await googleIt({ query: `"${url}"`, limit: 10, 'disableConsole': true });
            if (results && results.length > 0) return results.length * 5 + 20;
        } catch (e) {
            console.warn("Direct URL search failed", e);
        }

        // 2. Title Search (Cleaned)
        if (title) {
            const part1 = title.split(' - ')[0] || '';
            const cleanTitle = (part1.split(' | ')[0] || '').trim();
            console.log(`Searching clean title: "${cleanTitle}"`);

            let hostname = '';
            try {
                hostname = new URL(url).hostname;
            } catch (e) { }

            try {
                let query = `"${cleanTitle}"`;
                if (hostname) query += ` -site:${hostname}`;

                // @ts-ignore
                const results = await googleIt({ query, limit: 20, 'disableConsole': true });
                if (results && results.length > 0) return results.length * 2 + 10;

                // 3. Relaxed Title Search
                console.log(`Relaxed search for: ${cleanTitle}`);
                query = `${cleanTitle}`;
                if (hostname) query += ` -site:${hostname}`;

                // @ts-ignore
                const relaxedResults = await googleIt({ query, limit: 20, 'disableConsole': true });
                if (relaxedResults && relaxedResults.length > 0) return relaxedResults.length;

            } catch (e) {
                console.warn("Title search failed", e);
            }
        }

        return 0;
    }
}
