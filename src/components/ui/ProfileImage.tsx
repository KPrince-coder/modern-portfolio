import React from 'react';
import { motion } from 'framer-motion';

interface ProfileImageProps {
  imageUrl?: string;
  name?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  imageUrl,
  name = 'Profile',
  isLoading = false,
  size = 'md',
}) => {
  // Size mappings - drastically reduced sizes
  const sizeMap = {
    sm: 'max-w-[60px] md:max-w-[70px]',
    md: 'max-w-[80px] md:max-w-[90px]',
    lg: 'max-w-[100px] md:max-w-[120px]',
  };

  // Particle animation for the decorative elements
  const particles = Array.from({ length: 6 }).map((_, i) => (
    <motion.div
      key={`particle-${i}`}
      className={`absolute rounded-full bg-indigo-${300 + i * 100} dark:bg-indigo-${600 - i * 100} opacity-${30 + i * 10}`}
      initial={{
        x: 0,
        y: 0,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.5,
      }}
      animate={{
        x: [0, (Math.random() - 0.5) * 30, 0],
        y: [0, (Math.random() - 0.5) * 30, 0],
        scale: [0.5 + Math.random() * 0.5, 0.7 + Math.random() * 0.3, 0.5 + Math.random() * 0.5],
        opacity: [0.3 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.3 + Math.random() * 0.5],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: `${5 + Math.random() * 8}px`,
        height: `${5 + Math.random() * 8}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: `blur(${1 + Math.random() * 1.5}px)`,
      }}
    />
  ));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative flex items-center justify-center"
    >
      {/* Container with max width to make image more professional */}
      <div className={`${sizeMap[size]} relative mx-auto `}>
        {/* Gradient border with glow effect */}
        <div className="aspect-square rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 p-1 shadow-lg relative overflow-hidden">
          {/* Animated glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden relative z-10">
            {isLoading ? (
              // Skeleton loader
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <svg className="w-1/4 h-1/4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            ) : imageUrl ? (
              // Actual image with subtle hover effect
              <motion.div
                className="w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </motion.div>
            ) : (
              // Placeholder if no image
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <svg className="w-1/3 h-1/3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute z-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-900"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute z-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] rounded-full border border-indigo-100 dark:border-indigo-800 opacity-70"></div>

        {/* Animated particles */}
        <div className="absolute z-12 inset-0 w-full h-full">
          {particles}
        </div>

        {/* Blur effects */}
        <div className="absolute z-12 -bottom-3 -right-3 w-10 h-10 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-lg"></div>
        <div className="absolute z-12 -top-3 -left-3 w-8 h-8 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-lg"></div>
      </div>
    </motion.div>
  );
};

export default ProfileImage;
