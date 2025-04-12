import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import AIGeneratedBadge from '../ui/AIGeneratedBadge';
import { BlogPost } from '../../lib/supabase';

interface BlogDetailHeaderProps {
  post: BlogPost;
}

const BlogDetailHeader: React.FC<BlogDetailHeaderProps> = ({ post }) => {
  // Format the date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      {/* Category and metadata */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
        {post.category && (
          <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full">
            {post.category.name}
          </span>
        )}
        <span>{formatDate(post.published_at || post.created_at)}</span>
        {post.reading_time_minutes && (
          <span>{post.reading_time_minutes} min read</span>
        )}
        {post.ai_generated && <AIGeneratedBadge size="sm" />}
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Summary */}
      {post.summary && (
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl">
          {post.summary}
        </p>
      )}

      {/* Featured image */}
      {post.featured_image_url && (
        <div className="aspect-[21/9] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-8">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default BlogDetailHeader;
