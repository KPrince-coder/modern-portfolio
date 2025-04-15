import React from 'react';
import { Link } from 'react-router-dom';
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
  // Function to force scroll to top
  const handleClick = () => {
    // Force scroll to top immediately
    window.scrollTo(0, 0);

    // Also schedule another scroll after a short delay to ensure it works
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);
  };

  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className={`${className}`} aria-label="Post navigation">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous post */}
        {prevPost ? (
          <motion.div
            whileHover={{ x: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={`/blog/${prevPost.slug}`}
              onClick={handleClick}
              className="group block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
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
            </Link>
          </motion.div>
        ) : (
          <div className="hidden md:block" /> // Empty div for spacing when no previous post
        )}

        {/* Next post */}
        {nextPost ? (
          <motion.div
            whileHover={{ x: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Link
              to={`/blog/${nextPost.slug}`}
              onClick={handleClick}
              className="group block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors md:text-right md:ml-auto"
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
            </Link>
          </motion.div>
        ) : (
          <div className="hidden md:block" /> // Empty div for spacing when no next post
        )}
      </div>
    </nav>
  );
};

export default PostNavigation;
