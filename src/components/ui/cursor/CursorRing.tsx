import { CSSProperties } from 'react';

interface CursorRingProps {
  x: number;
  y: number;
  isVisible: boolean;
  isHovering: boolean;
  isClicking: boolean;
  className?: string;
}

const CursorRing = ({
  x,
  y,
  isVisible,
  isHovering,
  isClicking,
  className = ''
}: CursorRingProps) => {
  const baseStyle: CSSProperties = {
    left: `${x}px`,
    top: `${y}px`,
    opacity: isVisible ? 1 : 0,
    transform: 'translate(-50%, -50%)',
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 9998,
    width: '40px',
    height: '40px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#6366f1', // Indigo color
    borderRadius: '50%',
    transition: 'opacity 0.3s ease, width 0.3s ease, height 0.3s ease, border-color 0.3s ease, transform 0.15s ease',
  };

  // Apply different styles based on state
  if (isClicking) {
    baseStyle.transform = 'translate(-50%, -50%) scale(0.9)';
  }

  if (isHovering) {
    baseStyle.width = '60px';
    baseStyle.height = '60px';
    baseStyle.borderColor = '#4f46e5'; // Darker indigo when hovering
  }

  return (
    <div
      className={`cursor-ring ${className} ${isHovering ? 'ring-hover' : ''} ${isClicking ? 'ring-clicking' : ''}`}
      style={baseStyle}
    />
  );
};

export default CursorRing;
