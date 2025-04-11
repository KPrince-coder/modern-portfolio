import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import AnalyticsPageViews from '../components/analytics/AnalyticsPageViews';
import AnalyticsReferrers from '../components/analytics/AnalyticsReferrers';
import AnalyticsDevices from '../components/analytics/AnalyticsDevices';
import AnalyticsSettings from '../components/analytics/AnalyticsSettings';

// Types
type AnalyticsTab = 'dashboard' | 'pageViews' | 'referrers' | 'devices' | 'settings';
type TimeRange = '7d' | '30d' | '90d' | 'all';

const AnalyticsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useCMS();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  // Calculate date range based on selected time range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch analytics summary data
  const {
    data: analyticsSummary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ['analyticsSummary', timeRange],
    queryFn: async () => {
      // In a real implementation, this would fetch actual analytics data from Supabase
      // For now, we'll return mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        totalPageViews: 12458,
        uniqueVisitors: 4872,
        averageTimeOnSite: '2m 34s',
        bounceRate: '42%',
        topPages: [
          { path: '/', views: 3245, title: 'Home' },
          { path: '/projects', views: 1876, title: 'Projects' },
          { path: '/blog', views: 1543, title: 'Blog' },
          { path: '/about', views: 987, title: 'About' },
          { path: '/contact', views: 654, title: 'Contact' },
        ],
        topReferrers: [
          { source: 'Google', visits: 2134 },
          { source: 'Direct', visits: 1876 },
          { source: 'GitHub', visits: 543 },
          { source: 'LinkedIn', visits: 432 },
          { source: 'Twitter', visits: 321 },
        ],
        deviceBreakdown: {
          desktop: 65,
          mobile: 30,
          tablet: 5,
        },
        dailyPageViews: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          views: Math.floor(Math.random() * 500) + 100,
        })),
      };
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Loading state
  if (authLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  // Error state
  if (summaryError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(summaryError as Error)?.message || 'An error occurred while fetching analytics data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
          
          {/* Time Range Selector */}
          <div className="mt-4 sm:mt-0">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  timeRange === '7d'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border border-gray-300 dark:border-gray-600`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-2 text-sm font-medium ${
                  timeRange === '30d'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border-t border-b border-gray-300 dark:border-gray-600`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('90d')}
                className={`px-4 py-2 text-sm font-medium ${
                  timeRange === '90d'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border-t border-b border-gray-300 dark:border-gray-600`}
              >
                90 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('all')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  timeRange === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                } border border-gray-300 dark:border-gray-600`}
              >
                All Time
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('pageViews')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pageViews'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Page Views
            </button>
            <button
              onClick={() => setActiveTab('referrers')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'referrers'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Referrers
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'devices'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Devices
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'dashboard' && analyticsSummary && (
            <AnalyticsDashboard data={analyticsSummary} timeRange={timeRange} />
          )}
          
          {activeTab === 'pageViews' && analyticsSummary && (
            <AnalyticsPageViews 
              pageViews={analyticsSummary.dailyPageViews} 
              topPages={analyticsSummary.topPages}
              timeRange={timeRange}
            />
          )}
          
          {activeTab === 'referrers' && analyticsSummary && (
            <AnalyticsReferrers 
              referrers={analyticsSummary.topReferrers}
              timeRange={timeRange}
            />
          )}
          
          {activeTab === 'devices' && analyticsSummary && (
            <AnalyticsDevices 
              deviceData={analyticsSummary.deviceBreakdown}
              timeRange={timeRange}
            />
          )}
          
          {activeTab === 'settings' && (
            <AnalyticsSettings />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
