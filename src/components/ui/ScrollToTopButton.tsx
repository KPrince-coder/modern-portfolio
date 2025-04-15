import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';
import { scrollState } from '../../utils/scrollState';

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

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Position classes - we'll position it at the same spot as the tag button
  const positionClasses = {
    'bottom-right': 'bottom-6 right-10', // Match TagCloud position
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className={`fixed ${positionClasses[position]} z-50 flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full shadow-xl hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors border-2 border-white dark:border-gray-800 ${className}`}
          aria-label="Scroll to top"
          type="button"
          data-testid="scroll-to-top-button"
        >
          <FiArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
