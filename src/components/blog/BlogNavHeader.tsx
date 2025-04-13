import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import BlogThemeToggler from './BlogThemeToggler';
import ShareWidget from './ShareWidget';

interface BlogNavHeaderProps {
  title: string;
  url: string;
  imageUrl?: string;
  summary?: string;
}

/**
 * Navigation header component for blog posts with scrolling title
 */
const BlogNavHeader: React.FC<BlogNavHeaderProps> = ({ title, url, imageUrl, summary }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle scroll events for progress bar and header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollTop / scrollHeight;
      
      setProgress(scrollProgress * 100);
      setIsScrolled(scrollTop > 300); // Show title after scrolling past the main title
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Progress bar */}
      <div 
        className="h-1 bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />

      {/* Header content */}
      <div className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Back button */}
            <Link 
              to="/blog" 
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              <span className="hidden sm:inline">Back to Blog</span>
            </Link>

            {/* Title (visible when scrolled) */}
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 transform -translate-x-1/2 max-w-md"
                >
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate text-center">
                    {title}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Share widget (compact mode) */}
              <ShareWidget
                url={url}
                title={title}
                summary={summary}
                imageUrl={imageUrl}
                compact
              />

              {/* Theme toggler */}
              <BlogThemeToggler />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default BlogNavHeader;
