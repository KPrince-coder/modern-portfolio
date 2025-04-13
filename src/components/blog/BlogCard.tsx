import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
// AI badge import removed

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    summary: string;
    featured_image_url?: string;
    category?: { id: string; name: string; slug: string };
    reading_time_minutes?: number;
    published_at?: string;
    ai_generated: boolean;
    created_at: string;
  };
  index: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, index }) => {
  // Format the date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <a href={`/blog/${post.slug}`} className="block" target="_blank" rel="noopener noreferrer">
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

          {/* AI Generated badge removed for public view */}
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

          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2">
            {post.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {post.summary}
          </p>

          <div className="mt-6">
            <span className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Read More →
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
};

export default BlogCard;
