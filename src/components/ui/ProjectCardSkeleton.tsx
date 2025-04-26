import React from 'react';
import { motion } from 'framer-motion';

interface ProjectCardSkeletonProps {
  delay?: number;
}

const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({ delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
    >
      {/* Image skeleton */}
      <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse">
        {/* Tags skeleton */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
          <div className="w-14 h-6 bg-gray-300 dark:bg-gray-600 rounded-md"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className="w-3/4 h-7 bg-gray-300 dark:bg-gray-600 rounded-md mb-4 animate-pulse"></div>
        
        {/* Description skeleton */}
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-md mb-2 animate-pulse"></div>
        <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"></div>
        
        {/* Button skeleton */}
        <div className="w-28 h-6 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -z-10 -bottom-6 -right-6 w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full blur-xl opacity-30"></div>
    </motion.div>
  );
};

export default ProjectCardSkeleton;
