import React from 'react';
import { motion } from 'framer-motion';
import BlogCard from './BlogCard';
import { BlogPost } from '../../lib/supabase';

interface BlogGridProps {
  posts: BlogPost[];
  isLoading: boolean;
}

const BlogGrid: React.FC<BlogGridProps> = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse"
          >
            <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mt-6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          No blog posts found. Try adjusting your filters.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <BlogCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
};

export default BlogGrid;
