import React, { useState } from 'react';
import { SearchBar } from './SearchBar';
import { StatsCard } from './StatsCard';
import { analyzeUrl } from '../api';
import { BarChart3, Globe, MessageCircle, Share2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [version, setVersion] = useState('v5');

    const handleSearch = async (url: string) => {
        setLoading(true);
        setError('');
        setData(null);
        try {
            // @ts-ignore
            const result = await analyzeUrl(url, version);
            setData(result);
        } catch (err) {
            setError('Failed to analyze URL. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const versions = [
        { id: 'v2', name: 'v2.0 Dual-Core', desc: 'Standard Verified Data + Linear Decay' },
        { id: 'v3', name: 'v3.0 Contextual', desc: 'Positional Heat Map + Industry Scaling' },
        { id: 'v4', name: 'v4.0 Causal', desc: 'AI/GEO Detection + Sentiment Analysis' },
        { id: 'v5', name: 'v5.0 Agentic', desc: 'Behavioral Engine + Social Influence Index' },
        { id: 'v6', name: 'v6.0 Integrated', desc: 'Grounded Base + Engagement Stickiness' },
    ];

    // Logic Explanations Data
    const logicExplanations: Record<string, { title: string, points: string[] }> = {
        'v2': {
            title: "Dual-Core Estimation (v2.0)",
            points: [
                "1. Check Domain Authority: We first identify if the site is a 'Premier' (e.g., NYT), 'Authority', or 'Growth' domain.",
                "2. Assign Base Reach: Each tier gets a starting reach number (e.g., 75k for Premier).",
                "3. Viral Keyword Boost: we search the title for words like 'Exclusive', 'Breaking', or 'Secret' and boost reach by up to 50%.",
                "4. Time Decay: Is the article old? We reduce the reach by 20% for every week that has passed."
            ]
        },
        'v3': {
            title: "Contextual Analysis (v3.0)",
            points: [
                "1. Industry Context: We analyze the topic. Tech/AI articles get a 1.2x boost; Entertainment gets 1.5x (pop culture spreads faster).",
                "2. Platform Heat Map: If the article is trending on Reddit or Hacker News, we apply a 'Viral Platform' multiplier (1.2x).",
                "3. Power Law Decay: We use a more realistic 'Power Law' formula for time decay, where reach drops fast initially then stabilizes.",
                "4. Base Reach: Standard domain-based estimation is the foundation."
            ]
        },
        'v4': {
            title: "Causal & Sentiment Engine (v4.0)",
            points: [
                "1. Sentiment Analysis: We read the headline's emotion. Controversy (negative score) gets a 1.5x multiplier because 'bad news travels fast'.",
                "2. AI & GEO Detection: If the article is referenced by AI search engines (Perplexity, Gemini), we add a flat +25k reach bonus.",
                "3. Sigmoid Decay: We use a sophisticated 'S-Curve' decay. Reach holds steady for 4 days, then drops off sharply.",
                "4. Viral Platforms: If shared on 2+ major social networks, we boost reach by 30%."
            ]
        },
        'v5': {
            title: "Behavioral & Agentic Model (v5.0)",
            points: [
                "1. Agentic Gatekeepers: A 'Gold' status is awarded if cited by top AI (ChatGPT, Claude). This doubles (2x) the reach.",
                "2. S.I.S.I. (Social Influence): 3+ social platform mentions trigger a 1.5x multiplier.",
                "3. Velocity Check: We calculate a 'velocity' score. If it's > 80/100, we apply a 'Tipping Point' bonus of 1.4x.",
                "4. Frozen Decay: High-quality 'Agentic' content does NOT decay for the first 14 days (Evergreen status)."
            ]
        },
        'v6': {
            title: "Integrated Reality Model (v6.0)",
            points: [
                "1. Grounded Base: We estimate real Unique Visitors (UV) and Pageviews (UPV) to start with a realistic baseline, not just a guess.",
                "2. Stickiness Factor: If readers view > 1.8 pages/visit, we assume high engagement and boost reach by 15%.",
                "3. Logic Integration: We combine Sentiment (Impact), Industry (Relevance), and Agentic (Authority) multipliers together.",
                "4. Echo Chamber Check: detailed verification to ensure AI citations are backed by real human traffic.",
            ]
        }
    };

    const [showLogic, setShowLogic] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl tracking-tight">
                        Reach<span className="text-blue-600">Lens</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Track the true impact of your content across the web and social media.
                    </p>
                </div>

                <SearchBar onSearch={handleSearch} loading={loading} />

                {/* Version Selector */}
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Select Engine Version</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {versions.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setVersion(v.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${version === v.id
                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {v.name}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 italic">
                        {versions.find(v => v.id === version)?.desc}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center max-w-2xl mx-auto border border-red-100">
                        {error}
                    </div>
                )}

                {data && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-left">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 truncate">{data.breakdown?.google?.title || data.url}</h2>
                            <p className="text-sm text-gray-500 truncate pb-1 border-b border-gray-100">{data.url}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <StatsCard
                                title="Total Mentions"
                                value={data.totalMentions}
                                icon={Globe}
                                color="blue"
                            />
                            <StatsCard
                                title="Google Mentions"
                                value={data.breakdown?.google?.totalMentions || 0}
                                icon={BarChart3}
                                color="orange"
                            />
                            <StatsCard
                                title="Reddit Mentions"
                                value={data.breakdown?.reddit?.count || 0}
                                icon={MessageCircle}
                                color="purple"
                            />
                            <StatsCard
                                title="Estimated Reach"
                                value={data.estimatedReach ? data.estimatedReach.toLocaleString() : '0'}
                                icon={Share2}
                                color="green"
                                subtext={data.confidenceScore ? `${data.confidenceScore}% Confidence` : undefined}
                                trend={data.estimatedReach > 10000 ? "High Impact 🚀" : undefined}
                            />
                            <StatsCard
                                title="Sentiment Impact"
                                value={data.sentimentScore > 1 ? "Positive" : data.sentimentScore < -1 ? "Controversial" : "Neutral"}
                                icon={Globe}
                                color={data.sentimentScore > 1 ? "blue" : data.sentimentScore < -1 ? "orange" : "purple"}
                                subtext={`Score: ${data.sentimentScore}`}
                                trend={Math.abs(data.sentimentScore) > 2 ? "Driving Viral Reach" : undefined}
                            />
                            <StatsCard
                                title="Agentic Rank"
                                value={data.agenticStatus || "None"}
                                icon={BarChart3}
                                color={data.agenticStatus === 'Gold' ? 'orange' : 'gray'}
                                subtext={data.agenticStatus === 'Gold' ? 'AI Citation (2.0x)' : 'Standard Indexing'}
                                trend={data.velocity > 80 ? "Viral Tipping Point 🔥" : undefined}
                            />

                            {/* v6 Specific Metrics */}
                            {version === 'v6' && data.breakdown?.meta?.uv && (
                                <>
                                    <StatsCard
                                        title="Est. Unique Visitors"
                                        value={data.breakdown.meta.uv.toLocaleString()}
                                        icon={Globe}
                                        color="indigo"
                                        subtext="Simulated Traffic Base"
                                    />
                                    <StatsCard
                                        title="Pageviews/Visit"
                                        value={data.breakdown.meta.upv ? (data.breakdown.meta.upv / data.breakdown.meta.uv).toFixed(2) : "1.0"}
                                        icon={Share2}
                                        color="pink"
                                        subtext={(data.breakdown.meta.upv / data.breakdown.meta.uv) > 1.8 ? "High Stickiness (>1.8)" : "Standard Engagement"}
                                        trend={(data.breakdown.meta.upv / data.breakdown.meta.uv) > 1.8 ? "Reach Boosted x1.15" : undefined}
                                    />
                                </>
                            )}
                        </div>

                        {/* Logic Explanation Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => setShowLogic(!showLogic)}
                                className="w-full flex justify-between items-center p-5 bg-blue-50/50 hover:bg-blue-50 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">How We Calculated This ({version})</h3>
                                        <p className="text-xs text-gray-500">Click to see the math behind the magic</p>
                                    </div>
                                </div>
                                <svg
                                    className={`w-5 h-5 text-gray-400 transform transition-transform ${showLogic ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showLogic && (
                                <div className="p-6 bg-white border-t border-blue-50 animate-fade-in">
                                    <h4 className="font-semibold text-blue-800 mb-4 text-sm uppercase tracking-wide">
                                        {logicExplanations[version]?.title}
                                    </h4>
                                    <ul className="space-y-3">
                                        {logicExplanations[version]?.points.map((point, idx) => (
                                            <li key={idx} className="flex items-start text-gray-600 text-sm">
                                                <span className="mr-2 mt-1 text-green-500 flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Reddit Posts List */}
                        {data.breakdown?.reddit?.posts?.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Reddit Discussions</h3>
                                </div>
                                <ul className="divide-y divide-gray-100">
                                    {data.breakdown.reddit.posts.slice(0, 5).map((post: any, idx: number) => (
                                        <li key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                                            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                                                        <p className="text-sm text-gray-500 mt-1">r/{post.subreddit}</p>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        {post.score} upvotes
                                                    </span>
                                                </div>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
