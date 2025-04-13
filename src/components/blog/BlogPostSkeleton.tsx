import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton loader for blog post while content is loading
 * Mimics the actual blog post layout for a smoother transition
 */
const BlogPostSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Fake header */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <div className="h-1 bg-indigo-600 dark:bg-indigo-500 w-[60%]" />
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center">
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20">
        {/* Cover image skeleton */}
        <div className="w-full h-[40vh] md:h-[50vh] bg-gray-200 dark:bg-gray-700 mb-8 animate-pulse" />

        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content area */}
            <div className="lg:col-span-3">
              {/* Title skeleton */}
              <div className="mb-10">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>

              {/* Content skeleton */}
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg my-8 animate-pulse" />
                
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mx-auto animate-pulse" />
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer skeleton */}
      <footer className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        </div>
      </footer>
    </div>
  );
};

export default BlogPostSkeleton;
