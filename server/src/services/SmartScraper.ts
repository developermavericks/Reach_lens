// @ts-ignore
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// @ts-ignore
import UserAgent from 'user-agents';
import { ReachEstimator } from './ReachEstimator.js';

const puppeteerExtra = (puppeteer as any).default || puppeteer;
puppeteerExtra.use(StealthPlugin());

export class SmartScraper {
    private isProcessing = false; // Simple lock for Render memory safety

    // Random delay between 2-5 seconds
    private async delay(min = 2000, max = 5000) {
        const time = Math.floor(Math.random() * (max - min + 1)) + min;
        return new Promise(resolve => setTimeout(resolve, time));
    }

    // Get random user agent
    private getRandomUserAgent(): string {
        const userAgent = new UserAgent({ deviceCategory: 'desktop' });
        return userAgent.toString();
    }

    async scrapeUrl(url: string, title?: string): Promise<{
        title: string;
        url: string;
        totalMentions: number;
        domains: string[];
        prominenceScore: number; // v3.0 Heat Map Score
        source: 'Direct' | 'Title' | 'Estimator';
        status: 'Success' | 'Blocked' | 'Fallback';
        metaDescription?: string | undefined;
        snippet?: string | undefined;
    }> {

        // Memory safety: Only allow one scrape at a time on limited free tiers
        while (this.isProcessing) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        this.isProcessing = true;
        let browser;
        try {
            console.log(`[SmartScraper] Launching stealth browser for ${url}`);
            browser = await (puppeteerExtra as any).launch({
                headless: true,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--single-process',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080'
                ]
            });

            const page = await browser.newPage();
            const ua = this.getRandomUserAgent();
            await page.setUserAgent(ua);
            await page.setViewport({ width: 1920, height: 1080 });

            // --- PHASE 1: Google Search for URL (Verification) ---
            const result1 = await this.searchGoogle(page, `"${url}"`);

            if (result1 && result1.count > 0) {
                // --- PHASE 2: Direct Page Analysis (Content Extraction) ---
                const meta = await this.scrapeDirectPage(page, url);
                
                await browser.close();
                return {
                    title: meta.title || title || '',
                    url,
                    totalMentions: result1.count,
                    domains: result1.domains,
                    prominenceScore: result1.avgRankScore,
                    source: 'Direct',
                    status: 'Success',
                    metaDescription: meta.description,
                    snippet: meta.snippet
                };
            }

            await this.delay();

            // Attempt 2: Title Search
            if (title) {
                const part1 = title.split(' - ')[0] || '';
                const cleanTitle = (part1.split(' | ')[0] || '').trim();

                const hostname = new URL(url).hostname;
                const query = `"${cleanTitle}" -site:${hostname}`;

                const result2 = await this.searchGoogle(page, query);
                if (result2) {
                    await browser.close();
                    return {
                        title,
                        url,
                        totalMentions: result2.count,
                        domains: result2.domains,
                        prominenceScore: result2.avgRankScore,
                        source: 'Title',
                        status: 'Success'
                    };
                }
            }

            await browser.close();
            throw new Error("All scraping attempts failed");

        } catch (error) {
            console.error(`[SmartScraper] Blocked or Failed: ${error}`);
            if (browser) await browser.close();

            console.log(`[SmartScraper] Switching to ReachEstimator`);
            const estimate = ReachEstimator.estimate(url, title || '');
            return {
                title: title || '',
                url,
                totalMentions: estimate.mentions,
                domains: [],
                prominenceScore: 0,
                source: 'Estimator',
                status: 'Fallback'
            };
        } finally {
            this.isProcessing = false; // Always release the lock
        }
    }

    private async searchGoogle(page: any, query: string): Promise<{ count: number, domains: string[], avgRankScore: number } | null> {
        try {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

            // Check for Captcha
            if (await page.$('#captcha-form') || await page.$('iframe[src*="google.com/recaptcha"]')) {
                console.warn("[SmartScraper] CAPTCHA detected!");
                return null; // Force fallback
            }

            // Extract Domains & Rank from Top Results (v3.0 Positional Weighting)
            const matches = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('.g a'));
                return anchors.map((a, index) => {
                    try {
                        return {
                            host: new URL((a as HTMLAnchorElement).href).hostname,
                            rank: index + 1
                        };
                    } catch { return null; }
                })
                    .filter(item => item && item.host && !item.host.includes('google') && !item.host.includes('youtube'))
                    .slice(0, 5); // Analyze top 5
            });

            // Calculate "Heat Map" Score
            // Rank 1: 2.0 (Hero)
            // Rank 2-3: 1.0 (Body)
            // Rank 4+: 0.5 (Footer/Deep)
            let totalScore = 0;
            const uniqueDomains: string[] = [];

            (matches as any[]).forEach(m => {
                if (!uniqueDomains.includes(m.host)) {
                    uniqueDomains.push(m.host);
                    if (m.rank === 1) totalScore += 2.0;
                    else if (m.rank <= 3) totalScore += 1.0;
                    else totalScore += 0.5;
                }
            });

            const avgRankScore = uniqueDomains.length > 0 ? totalScore / uniqueDomains.length : 1;

            // Extract results stats
            const statsHandle = await page.$('#result-stats');
            if (statsHandle) {
                const text = await page.evaluate((el: any) => el.innerText, statsHandle);
                const match = text.match(/([\d,]+)/);
                if (match) {
                    const count = parseInt(match[1].replace(/,/g, ''), 10);
                    return { count, domains: uniqueDomains, avgRankScore };
                }
            }

            // Alternative count
            const results = await page.$$('.g');
            if (results.length > 0) return { count: results.length, domains: uniqueDomains, avgRankScore };

            return { count: 0, domains: [], avgRankScore: 0 };
        } catch (e) {
            console.warn(`[SmartScraper] Search failed for ${query}: ${e}`);
            return null;
        }
    }

    private async scrapeDirectPage(page: any, url: string): Promise<{ title?: string, description?: string, snippet?: string }> {
        try {
            console.log(`[SmartScraper] Visiting direct page: ${url}`);
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
            
            const meta = await page.evaluate(() => {
                const getMeta = (name: string) => {
                    const el = document.querySelector(`meta[name="${name}"], meta[property="og:${name}"]`);
                    return el ? (el as HTMLMetaElement).content : undefined;
                };

                const getSnippet = () => {
                    // Try article first
                    const article = document.querySelector('article, .article-content, .post-content');
                    if (article) return article.textContent?.trim().slice(0, 1000);
                    // Fallback to body
                    return document.body.textContent?.trim().slice(0, 1000).replace(/\s+/g, ' ');
                };

                return {
                    title: document.title,
                    description: getMeta('description'),
                    snippet: getSnippet()
                };
            });

            return meta;
        } catch (e) {
            console.warn(`[SmartScraper] Direct scrape failed: ${e}`);
            return {};
        }
    }
}
