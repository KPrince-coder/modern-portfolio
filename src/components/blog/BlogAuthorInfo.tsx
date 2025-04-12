import React from 'react';
import { motion } from 'framer-motion';
import { usePersonalData } from '../../hooks/useSupabase';

interface BlogAuthorInfoProps {
  aiGenerated?: boolean;
}

/**
 * Component for displaying author information in the blog sidebar
 */
const BlogAuthorInfo: React.FC<BlogAuthorInfoProps> = ({ aiGenerated = false }) => {
  const { data: personalData, isLoading } = usePersonalData();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <h3 className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700"></div>
          <div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (!personalData) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        About the Author
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden">
          {personalData.profile_image_url ? (
            <img
              src={personalData.profile_image_url}
              alt={personalData.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-gray-800 dark:text-white">
            {personalData.name}
          </h4>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {personalData.title}
          </p>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm">
        {aiGenerated 
          ? `This article was created with AI assistance by ${personalData.name}, who specializes in ${personalData.title}.` 
          : personalData.bio.split('.')[0] + '.'}
      </p>
    </motion.div>
  );
};

export default BlogAuthorInfo;
