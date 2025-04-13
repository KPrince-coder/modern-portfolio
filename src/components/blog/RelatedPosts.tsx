import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRelatedBlogPosts } from '../../hooks/useSupabase';
import AIGeneratedBadge from '../ui/AIGeneratedBadge';

interface RelatedPostsProps {
  postId: string;
  limit?: number;
  className?: string;
}

/**
 * Component to display related blog posts
 */
const RelatedPosts: React.FC<RelatedPostsProps> = ({ postId, limit = 3, className = '' }) => {
  const { data: relatedPosts = [], isLoading } = useRelatedBlogPosts(postId, limit);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="flex gap-4 animate-pulse">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post, index) => (
          <motion.a
            key={post.id}
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
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
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-indigo-600/80 text-white text-xs rounded-full backdrop-blur-sm">
                    {post.category.name}
                  </span>
                </div>
              )}

              {/* AI Generated badge */}
              {post.ai_generated && (
                <div className="absolute top-2 left-2">
                  <AIGeneratedBadge size="xs" />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs mb-2">
                <span>{formatDate(post.published_at || post.created_at)}</span>
                {post.reading_time_minutes && (
                  <>
                    <span>•</span>
                    <span>{post.reading_time_minutes} min read</span>
                  </>
                )}
              </div>

              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.title}
              </h4>

              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                {post.summary}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
