import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Types
interface PageView {
  date: string;
  views: number;
}

interface PageData {
  path: string;
  views: number;
  title: string;
}

interface AnalyticsPageViewsProps {
  pageViews: PageView[];
  topPages: PageData[];
  timeRange: '7d' | '30d' | '90d' | 'all';
}

const AnalyticsPageViews: React.FC<AnalyticsPageViewsProps> = ({
  pageViews,
  topPages,
  timeRange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'path'>('views');
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

  // Prepare chart data
  const chartData = {
    labels: pageViews.map(item => item.date),
    datasets: [
      {
        label: 'Page Views',
        data: pageViews.map(item => item.views),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  // Filter and sort pages
  const filteredAndSortedPages = [...topPages]
    .filter(page => 
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'views') {
        return sortOrder === 'asc' ? a.views - b.views : b.views - a.views;
      } else {
        return sortOrder === 'asc' 
          ? a.path.localeCompare(b.path) 
          : b.path.localeCompare(a.path);
      }
    });

  // Toggle sort order
  const toggleSort = (field: 'views' | 'path') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Calculate total page views
  const totalViews = pageViews.reduce((sum, item) => sum + item.views, 0);

  return (
    <div className="space-y-6">
      {/* Page Views Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Daily Page Views - {formatTimeRange(timeRange)}
        </h2>
        <div className="h-80">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Page Views Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Pages
          </h2>
          <div className="mt-3 md:mt-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pages..."
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
                  onClick={() => toggleSort('path')}
                >
                  <div className="flex items-center">
                    Page
                    {sortBy === 'path' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('views')}
                >
                  <div className="flex items-center justify-end">
                    Views
                    {sortBy === 'views' && (
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
              {filteredAndSortedPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="font-medium">{page.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{page.path}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {totalViews > 0 ? ((page.views / totalViews) * 100).toFixed(1) + '%' : '0%'}
                  </td>
                </tr>
              ))}
              {filteredAndSortedPages.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No pages found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Page Views Insights */}
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
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Top Performing Pages</h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              Your homepage and projects page are your most visited pages. Consider optimizing these pages further to improve user engagement.
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Growth Opportunities</h3>
            <p className="mt-1 text-sm text-green-700 dark:text-green-400">
              Your blog section has shown steady growth. Consider publishing more content to capitalize on this trend.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Recommendations</h3>
            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
              Add more internal links between your pages to encourage visitors to explore more of your portfolio.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsPageViews;
