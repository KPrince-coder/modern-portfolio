import React from 'react';
import { motion } from 'framer-motion';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const BlogPagination: React.FC<BlogPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than or equal to max pages to show, display all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);

      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add page range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always include last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center mt-12"
      aria-label="Pagination"
    >
      <ul className="inline-flex items-center -space-x-px">
        {/* Previous button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 ml-0 leading-tight rounded-l-lg border border-gray-300 dark:border-gray-700 ${
              currentPage === 1
                ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="Previous page"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </li>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
                  currentPage === page
                    ? 'text-white bg-indigo-600 border-indigo-600 dark:border-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 leading-tight rounded-r-lg border border-gray-300 dark:border-gray-700 ${
              currentPage === totalPages
                ? 'text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label="Next page"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </li>
      </ul>
    </motion.nav>
  );
};

export default BlogPagination;
