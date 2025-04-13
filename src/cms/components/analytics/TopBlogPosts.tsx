import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  shares?: number;
  avgTimeSpent?: number;
  aiGenerated?: boolean;
}

interface TopBlogPostsProps {
  posts: BlogPost[];
  title: string;
  metric: 'views' | 'timeSpent';
}

const TopBlogPosts: React.FC<TopBlogPostsProps> = ({ posts, title, metric }) => {
  // Format time in minutes and seconds
  const formatTime = (seconds?: number): string => {
    if (!seconds || isNaN(seconds)) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Post
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {metric === 'views' ? 'Views' : 'Avg. Time'}
              </th>
              <th scope="col" className="px-2 sm:px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs">{post.title}</div>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs">
                    {post.slug}
                  </span>
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-center">
                  {post.aiGenerated ? (
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Manual
                    </span>
                  )}
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                  {metric === 'views'
                    ? post.views.toLocaleString()
                    : formatTime(post.avgTimeSpent)
                  }
                </td>
                <td className="px-2 sm:px-4 md:px-6 py-4 text-sm text-right">
                  <div className="flex justify-end space-x-1 sm:space-x-2">
                    <Link
                      to={`/cms/analytics/blog/${post.id}`}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-xs sm:text-sm"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 text-xs sm:text-sm"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TopBlogPosts;
