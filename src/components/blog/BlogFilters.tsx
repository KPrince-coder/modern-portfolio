import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface BlogFiltersProps {
  categories: Category[];
  tags: Tag[];
  selectedCategory: string;
  selectedTag: string;
  onCategoryChange: (category: string) => void;
  onTagChange: (tag: string) => void;
  onDateFilterChange: (dateFilter: string) => void;
}

const BlogFilters: React.FC<BlogFiltersProps> = ({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onCategoryChange,
  onTagChange,
  onDateFilterChange,
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            type="button"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-expanded={isFiltersOpen}
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="text-gray-700 dark:text-gray-200">Filters</span>
            <svg
              className={`w-5 h-5 ml-2 text-gray-500 dark:text-gray-400 transition-transform ${
                isFiltersOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </motion.div>

        {/* Category pills for quick filtering (visible on larger screens) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="hidden md:flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => onCategoryChange('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.slice(0, 5).map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.slug)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === category.slug
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
          {categories.length > 5 && (
            <button
              type="button"
              onClick={() => setIsFiltersOpen(true)}
              className="px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              More...
            </button>
          )}
        </motion.div>
      </div>

      {/* Expanded filters panel */}
      {isFiltersOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories filter */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="category-all"
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'all'}
                    onChange={() => onCategoryChange('all')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label
                    htmlFor="category-all"
                    className="ml-2 text-gray-700 dark:text-gray-300"
                  >
                    All Categories
                  </label>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      id={`category-${category.slug}`}
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.slug}
                      onChange={() => onCategoryChange(category.slug)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label
                      htmlFor={`category-${category.slug}`}
                      className="ml-2 text-gray-700 dark:text-gray-300"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags filter */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Tags</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="tag-all"
                    type="radio"
                    name="tag"
                    checked={selectedTag === 'all'}
                    onChange={() => onTagChange('all')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label
                    htmlFor="tag-all"
                    className="ml-2 text-gray-700 dark:text-gray-300"
                  >
                    All Tags
                  </label>
                </div>
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center">
                    <input
                      id={`tag-${tag.slug}`}
                      type="radio"
                      name="tag"
                      checked={selectedTag === tag.slug}
                      onChange={() => onTagChange(tag.slug)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    <label
                      htmlFor={`tag-${tag.slug}`}
                      className="ml-2 text-gray-700 dark:text-gray-300"
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date filter */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Date</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="date-all"
                    type="radio"
                    name="date"
                    defaultChecked
                    onChange={() => onDateFilterChange('all')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label
                    htmlFor="date-all"
                    className="ml-2 text-gray-700 dark:text-gray-300"
                  >
                    All Time
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="date-week"
                    type="radio"
                    name="date"
                    onChange={() => onDateFilterChange('week')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label
                    htmlFor="date-week"
                    className="ml-2 text-gray-700 dark:text-gray-300"
                  >
                    This Week
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="date-month"
                    type="radio"
                    name="date"
                    onChange={() => onDateFilterChange('month')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label
                    htmlFor="date-month"
                    className="ml-2 text-gray-700 dark:text-gray-300"
                  >
                    This Month
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="date-year"
                    type="radio"
                    name="date"
                    onChange={() => onDateFilterChange('year')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label
                    htmlFor="date-year"
                    className="ml-2 text-gray-700 dark:text-gray-300"
                  >
                    This Year
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsFiltersOpen(false)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BlogFilters;
