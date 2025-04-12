import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import AIGeneratedBadge from '../ui/AIGeneratedBadge';

interface BlogListItemProps {
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

const BlogListItem: React.FC<BlogListItemProps> = ({ post, index }) => {
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
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6"
    >
      <Link to={`/blog/${post.slug}`} className="flex flex-col md:flex-row">
        <div className="md:w-1/3 lg:w-1/4 bg-gray-200 dark:bg-gray-700 relative">
          {post.featured_image_url ? (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover aspect-video md:aspect-auto"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full aspect-video md:aspect-auto flex items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="w-1/4 h-1/4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* AI Generated badge */}
          {post.ai_generated && (
            <div className="absolute top-4 left-4">
              <AIGeneratedBadge size="sm" />
            </div>
          )}
        </div>

        <div className="p-6 md:w-2/3 lg:w-3/4 flex flex-col">
          <div className="flex items-center gap-3 mb-3">
            {post.category && (
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-sm rounded-full">
                {post.category.name}
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {formatDate(post.published_at || post.created_at)}
            </span>
            {post.reading_time_minutes && (
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {post.reading_time_minutes} min read
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
            {post.title}
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
            {post.summary}
          </p>

          <div className="mt-auto">
            <span className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Read More →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogListItem;
