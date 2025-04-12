import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useBlogAnalyticsSummary } from '../../../hooks/useSupabase';
import BlogAnalyticsSummary from './BlogAnalyticsSummary';
import TopBlogPosts from './TopBlogPosts';
import AIContentPerformance from './AIContentPerformance';
import BlogShareAnalytics from './BlogShareAnalytics';
import BlogAudienceInsights from './BlogAudienceInsights';
import BlogContentEngagement from './BlogContentEngagement';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

type TimeRange = '7d' | '30d' | '90d' | 'all' | 'custom';

interface DateRange {
  startDate: string;
  endDate: string;
}

const BlogAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'audience'>('overview');

  // Calculate the actual date range based on the selected time range
  const getDateRangeFromTimeRange = (): DateRange => {
    const today = new Date();
    const endDate = format(endOfDay(today), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");

    switch (timeRange) {
      case '7d':
        return {
          startDate: format(startOfDay(subDays(today, 7)), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          endDate
        };
      case '30d':
        return {
          startDate: format(startOfDay(subDays(today, 30)), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          endDate
        };
      case '90d':
        return {
          startDate: format(startOfDay(subDays(today, 90)), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          endDate
        };
      case 'custom':
        return {
          startDate: format(startOfDay(new Date(customDateRange.startDate)), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
          endDate: format(endOfDay(new Date(customDateRange.endDate)), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        };
      case 'all':
      default:
        return {
          startDate: '',
          endDate: ''
        };
    }
  };

  // Get the date range for the API call
  const dateRange = getDateRangeFromTimeRange();

  // Fetch blog analytics data
  const { data: analyticsData, isLoading, error } = useBlogAnalyticsSummary(
    timeRange === 'all' ? undefined : dateRange
  );

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
    if (range === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  // Handle custom date range change
  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    setCustomDateRange(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value
    }));
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    setShowDatePicker(false);
  };

  // Format time range for display
  const formatTimeRange = (range: TimeRange): string => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case 'custom': return `${format(new Date(customDateRange.startDate), 'MMM d, yyyy')} - ${format(new Date(customDateRange.endDate), 'MMM d, yyyy')}`;
      case 'all': return 'All Time';
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'overview' | 'engagement' | 'audience') => {
    setActiveTab(tab);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading blog analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
        <h3 className="text-lg font-medium">Error loading blog analytics</h3>
        <p className="mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg">
        <h3 className="text-lg font-medium">No analytics data available</h3>
        <p className="mt-2">There is no blog analytics data available yet. This could be because there are no blog posts or no views have been recorded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time range selector and tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Blog Analytics Dashboard
          </h2>
          <div className="mt-2 flex space-x-4">
            <button
              type="button"
              onClick={() => handleTabChange('overview')}
              className={`text-sm font-medium ${activeTab === 'overview' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('engagement')}
              className={`text-sm font-medium ${activeTab === 'engagement' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Content Engagement
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('audience')}
              className={`text-sm font-medium ${activeTab === 'audience' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Audience Insights
            </button>
          </div>
        </div>
        <div className="flex flex-col space-y-2 w-full md:w-auto">
          <div className="flex space-x-2">
            {(['7d', '30d', '90d', 'custom', 'all'] as TimeRange[]).map((range) => (
              <button
                type="button"
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-3 py-1 text-sm rounded-md ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {range === 'custom' ? 'Custom' : formatTimeRange(range)}
              </button>
            ))}
          </div>

          {/* Custom date picker */}
          {showDatePicker && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start-date"
                    value={customDateRange.startDate}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end-date"
                    value={customDateRange.endDate}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={applyCustomDateRange}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Export buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              type="button"
              onClick={() => {
                // In a real implementation, this would generate a CSV file
                alert('CSV export functionality would be implemented here');
              }}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Summary metrics */}
          <BlogAnalyticsSummary summary={analyticsData.summary} />

          {/* AI vs. Manual Content Performance */}
          {analyticsData.aiPerformance && analyticsData.aiPerformance.length > 0 && (
            <AIContentPerformance data={analyticsData.aiPerformance} />
          )}

          {/* Top posts by views and time spent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopBlogPosts
              posts={analyticsData.topPostsByViews}
              title="Top Posts by Views"
              metric="views"
            />
            <TopBlogPosts
              posts={analyticsData.topPostsByTimeSpent}
              title="Top Posts by Time Spent"
              metric="timeSpent"
            />
          </div>

          {/* Share analytics */}
          {analyticsData.shareDistribution && analyticsData.shareDistribution.length > 0 && (
            <BlogShareAnalytics
              shareDistribution={analyticsData.shareDistribution}
              totalShares={analyticsData.summary.totalShares}
            />
          )}
        </>
      )}

      {/* Content Engagement Tab */}
      {activeTab === 'engagement' && (
        <BlogContentEngagement
          analyticsData={analyticsData}
          timeRange={timeRange}
          dateRange={customDateRange}
        />
      )}

      {/* Audience Insights Tab */}
      {activeTab === 'audience' && (
        <BlogAudienceInsights
          analyticsData={analyticsData}
          timeRange={timeRange}
          dateRange={customDateRange}
        />
      )}
    </div>
  );
};

export default BlogAnalyticsDashboard;
