import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiEye } from 'react-icons/fi';
import { scrollState } from '../../utils/scrollState';
import '../../styles/FloatingButton.css';

interface ScrollToTopButtonProps {
  position?: 'bottom-left' | 'bottom-right';
  className?: string;
}

/**
 * A reusable scroll-to-top button component that appears when the user scrolls down
 * and smoothly scrolls back to the top when clicked.
 */
const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  position = 'bottom-right',
  className = '',
}) => {
  // Use the global scroll state instead of local state
  const [isVisible, setIsVisible] = useState(scrollState.isVisible());

  // Subscribe to scroll state changes
  useEffect(() => {
    const handleVisibilityChange = (visible: boolean) => {
      setIsVisible(visible);
    };

    // Subscribe to changes
    const unsubscribe = scrollState.subscribe(handleVisibilityChange);

    // Clean up
    return unsubscribe;
  }, []);

  // For development only - force visibility toggle
  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    scrollState.setVisible(newVisibility);
  };

  // Scroll to top function
  const scrollToTop = () => {
    // Use both methods for maximum compatibility
    try {
      // Method 1: scrollTo
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      // Method 2: scroll
      window.scroll({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      // Fallback for older browsers
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }
  };

  // We'll use CSS classes for positioning and animation

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToTop}
            className={`fixed ${position === 'bottom-right' ? 'bottom-6 right-10' : 'bottom-6 left-6'} z-50 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all ${className}`}
            aria-label="Scroll to top"
            type="button"
            data-testid="scroll-to-top-button"
          >
            <FiArrowUp size={20} />
            <span className="absolute inset-0 rounded-full scroll-top-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toggle button - only visible when ScrollToTop is visible */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={toggleVisibility}
            className="fixed bottom-20 right-10 bg-blue-500 text-white text-xs p-2 rounded-md z-50 flex items-center gap-1 shadow-md hover:bg-blue-600 transition-colors"
            type="button"
          >
            <FiEye size={14} />
            Hide Button
          </motion.button>
        )}
      </AnimatePresence>

      {/* Show button toggle - only visible when ScrollToTop is hidden */}
      <AnimatePresence>
        {!isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            onClick={toggleVisibility}
            className="fixed bottom-6 right-10 bg-gray-200 text-gray-600 w-6 h-6 rounded-full z-50 flex items-center justify-center shadow-sm hover:bg-gray-300 transition-all"
            type="button"
            aria-label="Show scroll to top button"
          >
            <FiEye size={10} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScrollToTopButton;
