import { useEffect, useState } from 'react';

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none';

    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    // Add hover effect to clickable elements
    const addHoverEffect = () => {
      const clickableElements = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
      
      clickableElements.forEach((element) => {
        element.addEventListener('mouseenter', () => setIsHovering(true));
        element.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };

    // Add event listeners
    document.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Add hover effects after a short delay to ensure DOM is fully loaded
    const timer = setTimeout(addHoverEffect, 1000);

    // Cleanup
    return () => {
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div 
        className={`cursor-dot ${isHovering ? 'cursor-hover' : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          opacity: isVisible ? 1 : 0
        }}
      />
      <div 
        className={`cursor-outline ${isHovering ? 'outline-hover' : ''}`}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          opacity: isVisible ? 1 : 0
        }}
      />
    </>
  );
};

export default CustomCursor;
