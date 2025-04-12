import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BlogPreviewModal from './BlogPreviewModal';

interface SaveToBlogButtonProps {
  content: string;
  onSave?: () => void;
  className?: string;
}

/**
 * Button component that shows a preview of the blog post before saving
 */
const SaveToBlogButton: React.FC<SaveToBlogButtonProps> = ({
  content,
  onSave,
  className = '',
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleOpenPreview = () => {
    // Call the optional onSave callback
    if (onSave) {
      onSave();
    }

    // Open the preview modal
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenPreview}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${className}`}
        aria-label="Preview blog post"
      >
        <svg
          className="mr-2 -ml-1 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Edit as Blog Post
      </motion.button>

      <BlogPreviewModal
        content={content}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
    </>
  );
};

export default SaveToBlogButton;
