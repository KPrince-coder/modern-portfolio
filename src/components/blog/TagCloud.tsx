import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTag, FiX, FiFilter } from 'react-icons/fi';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface TagCloudProps {
  tags: Tag[];
  className?: string;
  variant?: 'sidebar' | 'floating' | 'inline';
}

/**
 * An innovative tag cloud component with multiple display variants
 */
const TagCloud: React.FC<TagCloudProps> = ({ tags, className = '', variant = 'sidebar' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (!tags || tags.length === 0) {
    return null;
  }

  // Sort tags alphabetically
  const sortedTags = [...tags].sort((a, b) => a.name.localeCompare(b.name));

  // Floating variant (fixed position at bottom of screen)
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-30 ${className}`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg"
          aria-label={isExpanded ? "Close tags" : "Show tags"}
        >
          {isExpanded ? <FiX size={20} /> : <FiTag size={20} />}
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                <FiTag className="mr-2" />
                Article Tags
              </h3>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {sortedTags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/blog?tag=${tag.slug}`}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline variant (horizontal scrolling bar)
  if (variant === 'inline') {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <FiTag className="text-indigo-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tags</h3>
        </div>
        <div className="flex overflow-x-auto pb-2 hide-scrollbar">
          <div className="flex gap-2 flex-nowrap">
            {sortedTags.map(tag => (
              <Link
                key={tag.id}
                to={`/blog?tag=${tag.slug}`}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors whitespace-nowrap flex-shrink-0"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default sidebar variant (interactive tag cloud)
  return (
    <div className={`${className}`}>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
          <FiTag className="mr-2" />
          Article Tags
        </h3>
        
        <div className="relative">
          {/* Tag cloud visualization */}
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
            {sortedTags.map(tag => (
              <motion.div
                key={tag.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to={`/blog?tag=${tag.slug}`}
                  className={`px-3 py-1 inline-block rounded-full text-sm transition-all duration-200 ${
                    selectedTag === tag.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300'
                  }`}
                  onMouseEnter={() => setSelectedTag(tag.id)}
                  onMouseLeave={() => setSelectedTag(null)}
                >
                  #{tag.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagCloud;
