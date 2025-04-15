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

  // Toggle visibility function - toggles visibility when button is clicked
  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    scrollState.setVisible(newVisibility);
  };

  // Scroll to top function - scrolls to the top of the page when clicked
  const scrollToTop = (e: React.MouseEvent) => {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    // Based on the logs, we know document.body is the scrolling container
    // Let's implement a custom smooth scroll function
    const scrollingElement = document.body;
    const currentScroll = scrollingElement.scrollTop;

    if (currentScroll <= 0) return; // Already at the top

    // Smooth scroll animation
    const scrollToTopAnimated = () => {
      const duration = 500; // ms
      const startTime = performance.now();

      // Animation function
      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;

        // Easing function - easeOutCubic
        const easeProgress = 1 - Math.pow(1 - Math.min(elapsedTime / duration, 1), 3);

        // Calculate new scroll position
        const newScrollTop = currentScroll - (currentScroll * easeProgress);
        scrollingElement.scrollTop = newScrollTop;

        // Continue animation if not complete
        if (elapsedTime < duration) {
          requestAnimationFrame(animateScroll);
        } else {
          // Ensure we're at the top when animation completes
          scrollingElement.scrollTop = 0;
        }
      };

      // Start animation
      requestAnimationFrame(animateScroll);
    };

    // Start the smooth scroll animation
    scrollToTopAnimated();
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
            className={`fixed ${position === 'bottom-right' ? 'bottom-6 right-10' : 'bottom-6 left-6'} z-50 flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-0 transition-all ${className}`}
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
            className="fixed bottom-20 right-10 bg-blue-500 text-white text-xs p-2 rounded-md z-50 flex items-center gap-1 shadow-md hover:bg-blue-600 transition-colors focus:outline-none"
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
            className="fixed bottom-6 right-10 bg-gray-200 text-gray-600 w-6 h-6 rounded-full z-50 flex items-center justify-center shadow-sm hover:bg-gray-300 transition-all focus:outline-none"
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