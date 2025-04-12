import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDebounce } from '../../hooks/useDebounce';

interface BlogSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
}

const BlogSearch: React.FC<BlogSearchProps> = ({ 
  onSearch, 
  initialQuery = '', 
  placeholder = 'Search blog posts...' 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Effect to handle debounced search
  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full max-w-md mx-auto mb-8"
    >
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-700 dark:text-gray-200"
          aria-label="Search blog posts"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default BlogSearch;
