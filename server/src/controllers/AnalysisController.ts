import type { Request, Response } from 'express';
import { SmartScraper } from '../services/SmartScraper.js';
import { SocialScraperService } from '../services/SocialScraperService.js';
import { ReachEstimator } from '../services/ReachEstimator.js';
// import db from '../db.js'; // Removed for stateless deployment


const smartScraper = new SmartScraper();
const socialScraper = new SocialScraperService();

export const analyzeUrl = async (req: Request, res: Response) => {
    let { url, version } = req.body;

    if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
    }

    // Default to v5 if not specified
    if (!version) version = 'v5';
    // Validate version
    if (!['v2', 'v3', 'v4', 'v5', 'v6'].includes(version)) version = 'v5';

    try {
        const [smartResult, redditResult] = await Promise.all([
            smartScraper.scrapeUrl(url),
            socialScraper.scrapeReddit(url)
        ]);

        const googleCount = smartResult.totalMentions || 0;
        const redditCount = redditResult.count || 0;
        const totalMentions = googleCount + redditCount;

        let estimatedReach = 0;
        let confidenceScore = 0;
        let sentimentScore = 0;

        // --- Versioned Logic ---
        let uv = 0;
        let upv = 0;

        if (smartResult.source === 'Estimator') {
            // CORE 2: The "Estimator" Path
            const estimate = ReachEstimator.estimate(url, smartResult.title || '', version, smartResult);
            estimatedReach = estimate.reach;
            confidenceScore = estimate.confidence;
            sentimentScore = estimate.sentimentScore;
            // @ts-ignore
            if (estimate.uv) uv = estimate.uv;
            // @ts-ignore
            if (estimate.upv) upv = estimate.upv;

        } else {
            // ... (Stealth logic omitted for brevity, no changes needed there as UV/UPV is for Estimator/v6)
            // CORE 1: The "Stealth" Path (Real Data)
            confidenceScore = 100;

            // 1. Domain Authority Weight (Common)
            let avgDomainWeight = 1;
            if (smartResult.domains && smartResult.domains.length > 0) {
                const weights = smartResult.domains.map(d => ReachEstimator.getDomainWeight(d));
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                avgDomainWeight = totalWeight / weights.length;
            }

            // 2. Base Value & Positional Logic
            let baseVal = 500; // v2 default
            let positionalWeight = 1.0;
            if (version === 'v4') baseVal = 425;
            if (version === 'v5') baseVal = 380;
            if (version === 'v6') baseVal = 350; // v6 default (Grounded Base simulation)

            if (version !== 'v2') {
                // v3+ uses Heat Map
                positionalWeight = smartResult.prominenceScore || 1.0;
            }

            // 3. Indexing Bonus
            let indexingBonus = 5000;
            if (smartResult.domains.some(d => d.includes('news') || d.includes('times') || d.includes('post'))) {
                indexingBonus = 10000;
            }

            // v4/v5/v6 GEO Boost
            if ((version === 'v4' || version === 'v5' || version === 'v6') &&
                smartResult.domains.some(d => d.includes('perplexity') || d.includes('gemini') || d.includes('chatgpt'))) {
                indexingBonus += 25000;
            }

            // Stealth Formula
            estimatedReach = ((googleCount + redditCount) * baseVal * avgDomainWeight * positionalWeight) + indexingBonus;

            // Sentiment (v4+) - Weighted Analysis
            if ((version === 'v4' || version === 'v5' || version === 'v6')) {
                sentimentScore = ReachEstimator.analyzeSentiment(
                    smartResult.title || '', 
                    smartResult.metaDescription, 
                    smartResult.snippet
                );
            }
        }

        // --- Universal Modifiers (Versioned) ---

        // v9.0: Content Provenance Graph (CPG) & 5-Tier Classification
        let provenanceTier = 'T0';
        if (version === 'v9') {
            const topDomains = smartResult.domains.slice(0, 5);
            const targetDomain = new URL(url).hostname.replace('www.', '');
            const isTargetInTop3 = topDomains.slice(0, 3).some(d => targetDomain.includes(d));
            
            if (isTargetInTop3) {
                provenanceTier = 'T0'; // Origin
            } else if (topDomains.some(d => d.includes('msn.com') || d.includes('yahoo.com') || d.includes('apnews.com') || d.includes('reuters.com'))) {
                provenanceTier = 'T1'; // Licensed Syndication
            } else if (topDomains.length > 0) {
                provenanceTier = 'T2'; // Indexed Reprint
            } else {
                provenanceTier = 'T3'; // Probable Scraper/Thin
            }
        }

        // v8.0/v9.0 integration for reprint flag
        const isReprint = provenanceTier !== 'T0';

        const modifiers = ReachEstimator.applyModifiers(estimatedReach, version, new Date(), smartResult.domains, {
            ...smartResult,
            isReprint,
            provenanceTier,
            url
        });
        estimatedReach = modifiers.finalReach;
        const velocity = modifiers.velocity;
        const agenticStatus = modifiers.agenticStatus;
        const deviation = (modifiers as any).deviation;
        const uvr = (modifiers as any).uv; // v9 UVR (Unique Verified Reach)

        // Save to DB - REMOVED for stateless deployment
        /*
        const stmt = db.prepare(`
          INSERT INTO snapshots (target_url, total_mentions, google_mentions, reddit_mentions, raw_data)
          VALUES (?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
            url,
            totalMentions,
            googleCount,
            redditCount,
            JSON.stringify({
                google: smartResult,
                reddit: redditResult,
                source: smartResult.source,
                confidence: confidenceScore,
                version: version, // Store version used
                sentiment: sentimentScore
            })
        );
        */


        res.json({
            id: Math.floor(Math.random() * 1000000), // Random ID for stateless response

            url,
            totalMentions,
            estimatedReach,
            confidenceScore,
            sentimentScore,
            velocity,
            agenticStatus,
            version,
            breakdown: {
                google: { ...smartResult, totalMentions: googleCount },
                reddit: redditResult,
                meta: {
                    agenticStatus: agenticStatus,
                    logic: getVersionName(version),
                    uv: uvr || uv || (modifiers as any).uv || undefined,
                    upv: (modifiers as any).upv || undefined,
                    socialProof: smartResult.socialProof,
                    deviation: deviation,
                    isReprint: isReprint,
                    provenanceTier: provenanceTier,
                    entropy: (modifiers as any).entropy || undefined
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Analysis failed' });
    }
};

function getVersionName(v: string) {
    if (v === 'v2') return 'Dual-Core (Verified + Drift)';
    if (v === 'v3') return 'Contextual (Heat Map + Industry)';
    if (v === 'v4') return 'Causal (Sentiment + GEO Detection)';
    if (v === 'v5') return 'Behavioral (Agentic + SISI)';
    return 'Integrated (Grounded + Stickiness)';
}
