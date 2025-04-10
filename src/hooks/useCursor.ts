import { useState, useEffect } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

interface CursorState {
  position: CursorPosition;
  isHovering: boolean;
  isVisible: boolean;
  isClicking: boolean;
}

interface UseCursorOptions {
  hideDefaultCursor?: boolean;
  hoverSelectors?: string[];
}

const defaultOptions: UseCursorOptions = {
  hideDefaultCursor: true,
  hoverSelectors: ['a', 'button', '[role="button"]', 'input[type="submit"]', 'input[type="button"]', '.cursor-hover-trigger'],
};

export const useCursor = (options: UseCursorOptions = {}) => {
  const { hideDefaultCursor, hoverSelectors } = { ...defaultOptions, ...options };
  
  const [cursorState, setCursorState] = useState<CursorState>({
    position: { x: 0, y: 0 },
    isHovering: false,
    isVisible: false,
    isClicking: false,
  });

  useEffect(() => {
    // Hide default cursor if option is enabled
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
    }

    const updateCursorPosition = (e: MouseEvent) => {
      setCursorState(prev => ({
        ...prev,
        position: { x: e.clientX, y: e.clientY },
        isVisible: true,
      }));
    };

    const handleMouseEnter = () => {
      setCursorState(prev => ({ ...prev, isVisible: true }));
    };

    const handleMouseLeave = () => {
      setCursorState(prev => ({ ...prev, isVisible: false }));
    };

    const handleMouseDown = () => {
      setCursorState(prev => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setCursorState(prev => ({ ...prev, isClicking: false }));
    };

    // Add hover effect to clickable elements
    const addHoverEffect = () => {
      if (!hoverSelectors || hoverSelectors.length === 0) return;
      
      const selector = hoverSelectors.join(', ');
      const clickableElements = document.querySelectorAll(selector);
      
      const handleMouseEnterElement = () => {
        setCursorState(prev => ({ ...prev, isHovering: true }));
      };
      
      const handleMouseLeaveElement = () => {
        setCursorState(prev => ({ ...prev, isHovering: false }));
      };
      
      clickableElements.forEach((element) => {
        element.addEventListener('mouseenter', handleMouseEnterElement);
        element.addEventListener('mouseleave', handleMouseLeaveElement);
      });
      
      // Cleanup function for hover effects
      return () => {
        clickableElements.forEach((element) => {
          element.removeEventListener('mouseenter', handleMouseEnterElement);
          element.removeEventListener('mouseleave', handleMouseLeaveElement);
        });
      };
    };

    // Add event listeners
    document.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add hover effects after a short delay to ensure DOM is fully loaded
    const timer = setTimeout(addHoverEffect, 500);
    const cleanupHoverEffects = addHoverEffect();

    // Cleanup
    return () => {
      if (hideDefaultCursor) {
        document.body.style.cursor = 'auto';
      }
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      clearTimeout(timer);
      if (cleanupHoverEffects) cleanupHoverEffects();
    };
  }, [hideDefaultCursor, hoverSelectors]);

  return cursorState;
};

export default useCursor;
