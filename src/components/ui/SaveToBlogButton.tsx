import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { extractBlogData } from '../../utils/blogContentExtractor';

interface SaveToBlogButtonProps {
  content: string;
  onSave?: () => void;
  className?: string;
}

/**
 * Button component that extracts blog data from AI-generated content
 * and redirects to the blog post form with the extracted data
 */
const SaveToBlogButton: React.FC<SaveToBlogButtonProps> = ({
  content,
  onSave,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleSaveToBlog = () => {
    try {
      // Extract structured data from the AI-generated content
      const blogData = extractBlogData(content);
      
      // Call the optional onSave callback
      if (onSave) {
        onSave();
      }
      
      // Store the extracted data in sessionStorage for the blog form to use
      sessionStorage.setItem('ai_generated_blog_data', JSON.stringify(blogData));
      
      // Navigate to the blog post creation form
      navigate('/admin/blog/new');
    } catch (error) {
      console.error('Error processing blog content:', error);
      alert('There was an error processing the blog content. Please try again.');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleSaveToBlog}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${className}`}
      aria-label="Save to blog"
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
  );
};

export default SaveToBlogButton;
