import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BlogPost } from '../../lib/supabase';

interface BlogNavigationProps {
  prevPost?: Pick<BlogPost, 'slug' | 'title'> | null;
  nextPost?: Pick<BlogPost, 'slug' | 'title'> | null;
}

const BlogNavigation: React.FC<BlogNavigationProps> = ({ prevPost, nextPost }) => {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Previous post */}
      <div className={`${!prevPost ? 'md:col-start-2' : ''}`}>
        {prevPost && (
          <Link
            to={`/blog/${prevPost.slug}`}
            className="flex flex-col items-start group"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-2">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous Post
            </span>
            <span className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {prevPost.title}
            </span>
          </Link>
        )}
      </div>

      {/* Next post */}
      <div className="md:text-right">
        {nextPost && (
          <Link
            to={`/blog/${nextPost.slug}`}
            className="flex flex-col items-start md:items-end group"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-2">
              Next Post
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
            <span className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {nextPost.title}
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default BlogNavigation;
