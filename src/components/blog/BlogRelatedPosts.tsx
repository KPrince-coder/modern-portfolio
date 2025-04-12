import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useRelatedBlogPosts } from '../../hooks/useSupabase';
import { BlogPost } from '../../lib/supabase';

interface BlogRelatedPostsProps {
  postId: string;
  limit?: number;
}

const BlogRelatedPosts: React.FC<BlogRelatedPostsProps> = ({ postId, limit = 3 }) => {
  const { data: relatedPosts = [], isLoading } = useRelatedBlogPosts(postId, limit);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="flex gap-3 animate-pulse">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-md flex-shrink-0"></div>
            <div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-40 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Posts</h3>
      <div className="space-y-4">
        {relatedPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex gap-3 group"
          >
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0 overflow-hidden">
              {post.featured_image_url ? (
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <Link to={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                {formatDate(post.published_at || post.created_at)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BlogRelatedPosts;
