import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBlogPosts } from '../../hooks/useSupabase';
import { formatDistanceToNow } from 'date-fns';
import AIGeneratedBadge from '../ui/AIGeneratedBadge';

/**
 * Component for displaying featured blog posts on the home page
 */
const FeaturedBlogPosts: React.FC = () => {
  // Fetch featured blog posts
  const { data: blogData, isLoading } = useBlogPosts({
    featured: true,
    limit: 3,
  });

  const posts = blogData?.posts || [];

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse"
          >
            <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mt-6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <Link to={`/blog/${post.slug}`} className="block">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <svg className="w-1/4 h-1/4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Category badge */}
              {post.category && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-indigo-600/80 text-white text-sm rounded-full backdrop-blur-sm">
                    {post.category.name}
                  </span>
                </div>
              )}

              {/* AI Generated badge */}
              {post.ai_generated && (
                <div className="absolute top-4 left-4">
                  <AIGeneratedBadge size="sm" />
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-3">
                <span>{formatDate(post.published_at || post.created_at)}</span>
                {post.reading_time_minutes && (
                  <>
                    <span>•</span>
                    <span>{post.reading_time_minutes} min read</span>
                  </>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2">
                {post.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {post.summary}
              </p>

              <div className="mt-6">
                <span className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Read More →
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturedBlogPosts;
