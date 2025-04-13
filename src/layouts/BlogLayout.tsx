import React, { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Theme context removed
import { FiArrowLeft, FiShare2, FiBookmark, FiCopy, FiTwitter, FiLinkedin, FiFacebook } from 'react-icons/fi';
// Theme icons removed

interface BlogLayoutProps {
  children: ReactNode;
  title?: string;
  author?: string;
  date?: string;
  readTime?: string;
  coverImage?: string;
  slug?: string;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({
  children,
  title,
  author,
  date,
  readTime,
  coverImage,
  slug
}) => {
  // Theme context removed
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  // Handle scroll events for progress bar and header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollTop / scrollHeight;

      setProgress(scrollProgress * 100);
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Share on social media
  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title || '')}&url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-indigo-600 dark:bg-indigo-500 z-50 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <FiShare2 className="mr-2" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    <div className="p-2">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <FiCopy className="mr-2" />
                        {copied ? 'Copied!' : 'Copy link'}
                      </button>
                      <button
                        onClick={shareOnTwitter}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <FiTwitter className="mr-2" />
                        Twitter
                      </button>
                      <button
                        onClick={shareOnLinkedIn}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <FiLinkedin className="mr-2" />
                        LinkedIn
                      </button>
                      <button
                        onClick={shareOnFacebook}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      >
                        <FiFacebook className="mr-2" />
                        Facebook
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggler removed */}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-20">
        {/* Cover image */}
        {coverImage && (
          <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] mb-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent z-10" />
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          {/* Title and metadata */}
          {title && (
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">{title}</h1>
              <div className="flex flex-wrap justify-center items-center text-gray-600 dark:text-gray-400 text-sm md:text-base gap-2 md:gap-4">
                {author && (
                  <span className="inline-flex items-center">
                    <span className="font-medium">{author}</span>
                  </span>
                )}
                {date && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <span>{date}</span>
                  </>
                )}
                {readTime && (
                  <>
                    <span className="hidden md:inline">•</span>
                    <span>{readTime} read</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Blog content */}
          <div className="blog-content">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
              Back to Portfolio
            </Link>
            <div className="flex space-x-4">
              <button
                onClick={shareOnTwitter}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Share on Twitter"
              >
                <FiTwitter className="text-xl" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <FiLinkedin className="text-xl" />
              </button>
              <button
                onClick={shareOnFacebook}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                aria-label="Share on Facebook"
              >
                <FiFacebook className="text-xl" />
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogLayout;
