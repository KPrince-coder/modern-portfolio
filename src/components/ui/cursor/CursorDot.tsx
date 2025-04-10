import { CSSProperties } from 'react';

interface CursorDotProps {
  x: number;
  y: number;
  isVisible: boolean;
  isHovering: boolean;
  isClicking: boolean;
  className?: string;
}

const CursorDot = ({ 
  x, 
  y, 
  isVisible, 
  isHovering, 
  isClicking,
  className = '' 
}: CursorDotProps) => {
  const baseStyle: CSSProperties = {
    left: `${x}px`,
    top: `${y}px`,
    opacity: isVisible ? 1 : 0,
    transform: 'translate(-50%, -50%)',
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 9999,
    width: '8px',
    height: '8px',
    backgroundColor: '#6366f1', // Indigo color
    borderRadius: '50%',
    transition: 'opacity 0.3s ease, width 0.2s ease, height 0.2s ease, background-color 0.2s ease, transform 0.1s ease',
  };

  // Apply different styles based on state
  if (isClicking) {
    baseStyle.transform = 'translate(-50%, -50%) scale(0.8)';
  }
  
  if (isHovering) {
    baseStyle.width = '24px';
    baseStyle.height = '24px';
    baseStyle.backgroundColor = '#4f46e5'; // Darker indigo when hovering
  }

  return (
    <div 
      className={`cursor-dot ${className} ${isHovering ? 'cursor-hover' : ''} ${isClicking ? 'cursor-clicking' : ''}`}
      style={baseStyle}
    />
  );
};

export default CursorDot;
