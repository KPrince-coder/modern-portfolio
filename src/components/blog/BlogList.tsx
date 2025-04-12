import React from 'react';
import { motion } from 'framer-motion';
import BlogListItem from './BlogListItem';
import { BlogPost } from '../../lib/supabase';

interface BlogListProps {
  posts: BlogPost[];
  isLoading: boolean;
}

const BlogList: React.FC<BlogListProps> = ({ posts, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm animate-pulse flex flex-col md:flex-row"
          >
            <div className="md:w-1/3 lg:w-1/4 aspect-video md:aspect-auto bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-6 md:w-2/3 lg:w-3/4">
              <div className="flex gap-3 mb-3">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-full w-20"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
              </div>
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
    <div className="space-y-6">
      {posts.map((post, index) => (
        <BlogListItem key={post.id} post={post} index={index} />
      ))}
    </div>
  );
};

export default BlogList;
