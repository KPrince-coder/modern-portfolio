import React from 'react';
import { motion } from 'framer-motion';

interface OptimizationTip {
  title: string;
  description: string;
  type: string;
}

interface PostOptimizationTipsProps {
  tips: OptimizationTip[];
}

const PostOptimizationTips: React.FC<PostOptimizationTipsProps> = ({ tips }) => {
  // Get color classes based on tip type
  const getColorClasses = (type: string) => {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-500 dark:border-blue-400',
          title: 'text-blue-800 dark:text-blue-300',
          text: 'text-blue-700 dark:text-blue-200'
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-500 dark:border-green-400',
          title: 'text-green-800 dark:text-green-300',
          text: 'text-green-700 dark:text-green-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-500 dark:border-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-300',
          text: 'text-yellow-700 dark:text-yellow-200'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-500 dark:border-red-400',
          title: 'text-red-800 dark:text-red-300',
          text: 'text-red-700 dark:text-red-200'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-500 dark:border-gray-400',
          title: 'text-gray-800 dark:text-gray-300',
          text: 'text-gray-700 dark:text-gray-200'
        };
    }
  };

  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
        Content Optimization Recommendations
      </h2>
      
      <div className="space-y-4">
        {tips.map((tip, index) => {
          const colors = getColorClasses(tip.type);
          
          return (
            <div 
              key={index}
              className={`p-4 ${colors.bg} rounded-lg border-l-4 ${colors.border}`}
            >
              <h3 className={`text-md font-medium ${colors.title} mb-2`}>
                {tip.title}
              </h3>
              <p className={`text-sm ${colors.text}`}>
                {tip.description}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default PostOptimizationTips;
