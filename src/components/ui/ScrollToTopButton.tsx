import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';

// Create a custom event for scroll button visibility changes
export const scrollButtonEvent = {
  visible: new Event('scrollButtonVisible'),
  hidden: new Event('scrollButtonHidden')
};

interface ScrollToTopButtonProps {
  showAtHeight?: number;
  position?: 'bottom-left' | 'bottom-right';
  className?: string;
}

/**
 * A reusable scroll-to-top button component that appears when the user scrolls down
 * and smoothly scrolls back to the top when clicked.
 */
const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  showAtHeight = 300,
  position = 'bottom-right',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Check scroll position to show/hide button
  useEffect(() => {
    const handleScroll = () => {
      const shouldBeVisible = window.scrollY > showAtHeight;

      // Only update and dispatch events if visibility changes
      if (shouldBeVisible !== isVisible) {
        setIsVisible(shouldBeVisible);

        // Dispatch custom event for TagCloud to respond to
        if (shouldBeVisible) {
          document.dispatchEvent(scrollButtonEvent.visible);
        } else {
          document.dispatchEvent(scrollButtonEvent.hidden);
        }
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check
    handleScroll();

    // Clean up
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAtHeight, isVisible]);

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
          className={`fixed ${positionClasses[position]} z-40 flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors ${className}`}
          aria-label="Scroll to top"
          type="button"
        >
          <FiArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
