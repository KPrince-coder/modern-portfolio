import React from 'react';
import { motion } from 'framer-motion';

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
  xOffset?: number;
  yOffset?: number;
  rotationDegrees?: number;
}

const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  duration = 4,
  delay = 0,
  className = '',
  xOffset = 10,
  yOffset = 10,
  rotationDegrees = 5,
}) => {
  // For performance, we'll use simpler animations on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Reduce animation complexity on mobile
  const actualXOffset = isMobile ? xOffset * 0.5 : xOffset;
  const actualYOffset = isMobile ? yOffset * 0.5 : yOffset;
  const actualRotation = isMobile ? rotationDegrees * 0.5 : rotationDegrees;

  return (
    <motion.div
      className={className}
      initial={{ y: 0, x: 0, rotate: 0 }}
      animate={{
        y: [0, -actualYOffset, 0, actualYOffset, 0],
        x: [0, actualXOffset, 0, -actualXOffset, 0],
        rotate: [0, actualRotation, 0, -actualRotation, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
