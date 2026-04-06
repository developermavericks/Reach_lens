import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
    onSearch: (url: string) => void;
    loading: boolean;
}

export const SearchBar: React.FC<Props> = ({ onSearch, loading }) => {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) onSearch(url);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto relative">
            <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter article URL to analyze..."
                className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg shadow-sm pl-14 transition-all"
                disabled={loading}
                required
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <button
                type="submit"
                disabled={loading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Analyzing...' : 'Analyze'}
            </button>
        </form>
    );
};
