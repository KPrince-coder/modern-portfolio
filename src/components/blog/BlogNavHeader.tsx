import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Function to truncate long titles with responsive behavior
  const truncateTitle = (text: string): string => {
    // Different max lengths for different screen sizes
    const getMaxLength = () => {
      if (windowWidth < 640) return 20; // Small screens
      if (windowWidth < 768) return 30; // Medium screens
      if (windowWidth < 1024) return 40; // Large screens
      return 50; // Extra large screens
    };

    const maxLength = getMaxLength();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handle scroll events for progress bar and header
  useEffect(() => {
    // Find the blog title element to determine when to show the header title
    const findTitleElement = () => {
      // Look for the main h1 title in the blog content
      const titleElement = document.querySelector('h1.text-3xl.md\\:text-4xl.lg\\:text-5xl.font-bold');
      return titleElement;
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollTop / scrollHeight;

      setProgress(scrollProgress * 100);

      // Get the title element
      const titleElement = findTitleElement();

      if (titleElement) {
        // Get the bottom position of the title element plus some extra space
        const titleBottom = titleElement.getBoundingClientRect().bottom + scrollTop  // + 100;
        // Show the header title only after scrolling past the main title
        setIsScrolled(scrollTop > titleBottom);
      } else {
        // Fallback if title element not found
        setIsScrolled(scrollTop > 600);
      }
    };

    // Handle window resize for responsive title truncation
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Initial check
    handleScroll();

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Clean up event listeners
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* Progress bar container with blurred background */}
      <div className="h-1 bg-gray-200/30 dark:bg-gray-900/90  backdrop-blur-md">
        {/* Progress bar indicator */}
        <div
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header content */}
      <div className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            {/* Home button */}
            <Link
              to="/blog"
              className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <FiHome className="w-6 h-6" title="Visit blogs page" aria-label="Visit blogs page" />
            </Link>

            {/* Title (visible when scrolled) */}
            <AnimatePresence>
              {isScrolled && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-[40%] transform -translate-x-1/2 max-w-[50%] sm:max-w-[40%] md:max-w-[45%] lg:max-w-[50%] w-full"
                >
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 dark:text-white truncate text-center">
                    {truncateTitle(title)}
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




