import React from 'react';
import { motion } from 'framer-motion';

interface BlogHeaderProps {
  title: string;
  description: string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
        {title}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        {description}
      </p>
    </motion.div>
  );
};

export default BlogHeader;
