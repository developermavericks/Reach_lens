import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    subtext?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray' | 'indigo' | 'pink';
}

const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
};

export const StatsCard: React.FC<Props> = ({ title, value, icon: Icon, trend, subtext, color = "blue" }) => {
    const styles = colorMap[color];
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
                <div className={`p-2 rounded-lg ${styles.bg}`}>
                    <Icon className={`w-5 h-5 ${styles.text}`} />
                </div>
            </div>

            <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-gray-900">{value}</span>
                {trend && <span className="text-sm text-green-500 font-medium mb-1 ml-2">{trend}</span>}
            </div>

            {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
        </div>
    );
};
