import React, { useEffect, useRef } from 'react';
import { scrollState } from '../../utils/scrollState';

/**
 * A component that uses Intersection Observer to detect when the user has scrolled
 * past a certain point in the page, and updates the scroll state accordingly.
 */
const ScrollObserver: React.FC<{ threshold?: number }> = ({ threshold = 300 }) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    // Create a sentinel element at the threshold position
    const sentinelElement = sentinelRef.current;

    // Set up the observer
    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel goes out of view (scrolled past it), show the button
        const entry = entries[0];
        const isVisible = !entry.isIntersecting;

        // Update the scroll state
        scrollState.setVisible(isVisible);
      },
      {
        // Start triggering slightly before the element is fully out of view
        threshold: 0.1,
        rootMargin: '0px',
      }
    );

    // Start observing
    observer.observe(sentinelElement);

    // Clean up
    return () => {
      observer.unobserve(sentinelElement);
      observer.disconnect();
    };
  }, [threshold]);

  // Position the sentinel element at the threshold position
  return (
    <div
      ref={sentinelRef}
      style={{
        position: 'absolute',
        top: `${threshold}px`,
        left: 0,
        height: '1px',
        width: '1px',
        opacity: 0,
        pointerEvents: 'none',
      }}
      data-testid="scroll-sentinel"
      aria-hidden="true"
    />
  );
};

export default ScrollObserver;
