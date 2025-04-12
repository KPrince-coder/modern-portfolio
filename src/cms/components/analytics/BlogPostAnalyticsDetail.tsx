import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useBlogPostAnalytics } from '../../../hooks/useSupabase';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import PostEngagementMetrics from './PostEngagementMetrics';
import PostAudienceInsights from './PostAudienceInsights';
import PostOptimizationTips from './PostOptimizationTips';
import AnalyticsExportOptions from './AnalyticsExportOptions';

interface BlogPostAnalyticsDetailProps {
  postId: string;
}

const BlogPostAnalyticsDetail: React.FC<BlogPostAnalyticsDetailProps> = ({ postId }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'audience' | 'optimization'>('overview');
  // Fetch blog post analytics
  const { data, isLoading, error } = useBlogPostAnalytics(postId);

  // Format time in minutes and seconds
  const formatTime = (seconds?: number): string => {
    if (!seconds || isNaN(seconds)) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading blog post analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-lg">
        <h3 className="text-lg font-medium">Error loading blog post analytics</h3>
        <p className="mt-2">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg">
        <h3 className="text-lg font-medium">No analytics data available</h3>
        <p className="mt-2">There is no analytics data available for this blog post.</p>
      </div>
    );
  }

  const { post, analytics, shares, feedback, audience, engagement, optimization } = data;

  return (
    <div className="space-y-8">
      {/* Post header */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {/* Tabs */}
        <div className="mb-6 flex space-x-4 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('engagement')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'engagement' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Content Engagement
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audience')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'audience' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Audience Insights
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('optimization')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'optimization' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Optimization
          </button>
        </div>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h2>
          <div className="flex space-x-2">
            <Link
              to={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors"
            >
              View Post
            </Link>
            <Link
              to={`/cms/blog/edit/${post.id}`}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Edit Post
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.ai_generated && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              AI Generated
            </span>
          )}
          {post.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {post.category}
            </span>
          )}
          {post.status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              post.status === 'published'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : post.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(post.published_at)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(post.updated_at)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Viewed</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(analytics.last_viewed_at)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Reading Time</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {post.reading_time_minutes || 0} min
            </p>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <>
          {/* Analytics metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
          >
            {/* Views */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{analytics.views.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Shares */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Shares</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{shares.total.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Average Time Spent */}
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Time on Post</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatTime(analytics.avg_time_spent)}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Share breakdown */}
          {shares.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Share Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(shares.byPlatform).map(([platform, count]) => (
                  <div key={platform} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{platform}</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AI Feedback (if applicable) */}
          {post.ai_generated && feedback && feedback.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mt-6"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                AI Content Feedback
              </h3>

              <div className="space-y-4">
                {feedback.map((item: { id: string; rating: number; feedback?: string; created_at: string }) => (
                  <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-5 h-5 ${
                                star <= item.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </div>

                    {item.feedback && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {item.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Export options */}
          <div className="mt-6">
            <AnalyticsExportOptions postId={post.id} postTitle={post.title} />
          </div>
        </>
      )}

      {/* Engagement tab */}
      {activeTab === 'engagement' && (
        <PostEngagementMetrics engagement={engagement} />
      )}

      {/* Audience tab */}
      {activeTab === 'audience' && (
        <PostAudienceInsights audience={audience} />
      )}

      {/* Optimization tab */}
      {activeTab === 'optimization' && (
        <PostOptimizationTips tips={optimization.tips} />
      )}
    </div>
  );
};

export default BlogPostAnalyticsDetail;
