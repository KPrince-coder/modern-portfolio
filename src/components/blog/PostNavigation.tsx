import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

interface Post {
  id: string;
  slug: string;
  title: string;
  featured_image_url?: string;
}

interface PostNavigationProps {
  prevPost: Post | null;
  nextPost: Post | null;
  className?: string;
}

/**
 * Navigation component for moving between blog posts
 */
const PostNavigation: React.FC<PostNavigationProps> = ({
  prevPost,
  nextPost,
  className = '',
}) => {
  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className={`${className}`} aria-label="Post navigation">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous post */}
        {prevPost ? (
          <motion.a
            href={`/blog/${prevPost.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <FiArrowLeft className="mr-2" />
              Previous Article
            </span>
            <div className="flex items-center gap-3">
              {prevPost.featured_image_url && (
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 hidden sm:block">
                  <img
                    src={prevPost.featured_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {prevPost.title}
              </h4>
            </div>
          </motion.a>
        ) : (
          <div className="hidden md:block" /> // Empty div for spacing when no previous post
        )}

        {/* Next post */}
        {nextPost ? (
          <motion.a
            href={`/blog/${nextPost.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors md:text-right md:ml-auto"
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <span className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400 mb-2">
              Next Article
              <FiArrowRight className="ml-2" />
            </span>
            <div className="flex items-center gap-3 flex-row-reverse">
              {nextPost.featured_image_url && (
                <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 hidden sm:block">
                  <img
                    src={nextPost.featured_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {nextPost.title}
              </h4>
            </div>
          </motion.a>
        ) : (
          <div className="hidden md:block" /> // Empty div for spacing when no next post
        )}
      </div>
    </nav>
  );
};

export default PostNavigation;
