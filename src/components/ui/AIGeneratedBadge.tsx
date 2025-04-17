import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AIGeneratedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

/**
 * A creative badge component that indicates AI-generated content
 * with animated effects and modern design
 */
const AIGeneratedBadge: React.FC<AIGeneratedBadgeProps> = ({
  className = '',
  size = 'md',
  showAnimation = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 h-5',
    md: 'text-sm px-3 py-1 h-7',
    lg: 'text-base px-4 py-1.5 h-9',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  // Pulse animation effect
  useEffect(() => {
    if (showAnimation) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: {
          repeat: Infinity,
          repeatType: "reverse",
          duration: 2,
          ease: "easeInOut"
        }
      });
    }
  }, [controls, showAnimation]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: 1,
        y: 0,
// @ts-ignore
        ...(!isHovered && showAnimation && { scale: controls.scale })
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 0 8px rgba(124, 58, 237, 0.5)'
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`
        inline-flex items-center justify-center
        rounded-full shadow-md
        bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500
        text-white font-medium
        backdrop-blur-sm
        border border-purple-400/30
        transition-all duration-300
        ${sizeClasses[size]} ${className}
      `}
      title="This content was generated using AI"
    >
      <span className="relative flex items-center">
        {/* Animated glow effect */}
        {showAnimation && (
          <span className="absolute inset-0 rounded-full bg-purple-500 opacity-30 blur-md animate-pulse"></span>
        )}

        {/* Brain icon */}
        <svg
          className={`mr-1.5 ${iconSizes[size]}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 20.25V22.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.75 18.75L20.25 20.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20.25 12H22.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.75 5.25L20.25 3.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 3.75V1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.25 5.25L3.75 3.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.5 12H3.75"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.25 18.75L3.75 20.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Text with shimmer effect */}
        <span className="relative overflow-hidden">
          <span className="relative z-10">AI Generated</span>
          {isHovered && (
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          )}
        </span>
      </span>
    </motion.div>
  );
};

export default AIGeneratedBadge;
