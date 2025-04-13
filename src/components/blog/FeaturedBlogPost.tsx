import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import AIGeneratedBadge from '../ui/AIGeneratedBadge';
import { BlogPost } from '../../lib/supabase';

interface FeaturedBlogPostProps {
  post: BlogPost;
}

const FeaturedBlogPost: React.FC<FeaturedBlogPostProps> = ({ post }) => {
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
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md mb-12"
    >
      <div className="relative">
        <a href={`/blog/${post.slug}`} className="block" target="_blank" rel="noopener noreferrer">
          <div className="aspect-[21/9] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
            {post.featured_image_url ? (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <svg className="w-1/6 h-1/6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-indigo-600/90 text-white text-sm rounded-full backdrop-blur-sm">
                Featured
              </span>
              {post.category && (
                <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full backdrop-blur-sm">
                  {post.category.name}
                </span>
              )}
              {post.ai_generated && <AIGeneratedBadge size="sm" />}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              {post.title}
            </h2>

            <p className="text-gray-200 mb-4 line-clamp-2 max-w-3xl">
              {post.summary}
            </p>

            <div className="flex items-center gap-4 text-gray-200 text-sm">
              <span>{formatDate(post.published_at || post.created_at)}</span>
              {post.reading_time_minutes && (
                <>
                  <span>•</span>
                  <span>{post.reading_time_minutes} min read</span>
                </>
              )}
            </div>
          </div>
        </a>
      </div>
    </motion.div>
  );
};

export default FeaturedBlogPost;
