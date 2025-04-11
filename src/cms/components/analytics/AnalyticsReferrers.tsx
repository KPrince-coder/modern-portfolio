import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Types
interface ReferrerData {
  source: string;
  visits: number;
}

interface AnalyticsReferrersProps {
  referrers: ReferrerData[];
  timeRange: '7d' | '30d' | '90d' | 'all';
}

const AnalyticsReferrers: React.FC<AnalyticsReferrersProps> = ({
  referrers,
  timeRange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'visits' | 'source'>('visits');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Format time range for display
  const formatTimeRange = (range: string): string => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'all': return 'All Time';
      default: return '';
    }
  };

  // Generate colors for chart
  const generateColors = (count: number) => {
    const baseColors = [
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Amber
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(20, 184, 166, 0.8)',   // Teal
      'rgba(249, 115, 22, 0.8)',   // Orange
      'rgba(6, 182, 212, 0.8)',    // Cyan
    ];
    
    // If we need more colors than in our base set, generate them
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    } else {
      const colors = [...baseColors];
      for (let i = baseColors.length; i < count; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.8)`);
      }
      return colors;
    }
  };

  // Prepare chart data
  const chartData = {
    labels: referrers.map(item => item.source),
    datasets: [
      {
        data: referrers.map(item => item.visits),
        backgroundColor: generateColors(referrers.length),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          boxWidth: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Filter and sort referrers
  const filteredAndSortedReferrers = [...referrers]
    .filter(referrer => 
      referrer.source.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'visits') {
        return sortOrder === 'asc' ? a.visits - b.visits : b.visits - a.visits;
      } else {
        return sortOrder === 'asc' 
          ? a.source.localeCompare(b.source) 
          : b.source.localeCompare(a.source);
      }
    });

  // Toggle sort order
  const toggleSort = (field: 'visits' | 'source') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Calculate total visits
  const totalVisits = referrers.reduce((sum, item) => sum + item.visits, 0);

  return (
    <div className="space-y-6">
      {/* Referrers Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Traffic Sources - {formatTimeRange(timeRange)}
        </h2>
        <div className="h-80 flex items-center justify-center">
          <div className="w-full max-w-md">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      </motion.div>

      {/* Referrers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Referrers
          </h2>
          <div className="mt-3 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search referrers..."
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('source')}
                >
                  <div className="flex items-center">
                    Source
                    {sortBy === 'source' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('visits')}
                >
                  <div className="flex items-center justify-end">
                    Visits
                    {sortBy === 'visits' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAndSortedReferrers.map((referrer, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {referrer.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {referrer.visits.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {totalVisits > 0 ? ((referrer.visits / totalVisits) * 100).toFixed(1) + '%' : '0%'}
                  </td>
                </tr>
              ))}
              {filteredAndSortedReferrers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No referrers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Referrers Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Insights
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Top Traffic Sources</h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Google is your primary traffic source, followed by direct visits. This indicates good search engine visibility.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Social Media Performance</h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              LinkedIn and Twitter are your top social referrers. Consider focusing more on these platforms for sharing your content.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Recommendations</h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              Increase your presence on GitHub to attract more developer traffic. Consider contributing to open-source projects or sharing more of your code.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsReferrers;
