import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { groqAPI } from '../../lib/groq';
import { BlogSection, replaceSection } from '../../utils/blogSectionExtractor';
import LoadingSpinner from './LoadingSpinner';

interface RegenerateSectionButtonProps {
  section: BlogSection;
  fullContent: string;
  onContentUpdate: (newContent: string) => void;
  className?: string;
}

/**
 * Button component that regenerates a specific section of a blog post
 */
const RegenerateSectionButton: React.FC<RegenerateSectionButtonProps> = ({
  section,
  fullContent,
  onContentUpdate,
  className = '',
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);

    try {
      // Create a prompt for regenerating just this section
      const prompt = {
        topic: section.title,
        keywords: extractKeywords(section.title),
        tone: 'professional',
        length: 'medium',
        title: section.title,
      };

      // Call the Groq API to regenerate the section
      const response = await groqAPI.generateBlogPost(prompt);

      if (response.status === 'error') {
        throw new Error(response.error || 'Failed to regenerate section');
      }

      // Extract the main content from the response (excluding metadata)
      const newSectionContent = cleanupGeneratedContent(response.text);

      // Replace the section in the full content
      const updatedContent = replaceSection(fullContent, section, newSectionContent);

      // Update the content
      onContentUpdate(updatedContent);
    } catch (error) {
      console.error('Error regenerating section:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsRegenerating(false);
    }
  };

  /**
   * Extract keywords from the section title
   */
  const extractKeywords = (title: string): string[] => {
    const words = title.toLowerCase().split(/\s+/);
    const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about'];

    return words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .map(word => word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ''))
      .filter((word, index, self) => self.indexOf(word) === index)
      .slice(0, 5);
  };

  /**
   * Clean up the generated content to extract just the main part
   */
  const cleanupGeneratedContent = (content: string): string => {
    // Remove metadata sections that might be included
    return content
      .replace(/SUMMARY:\s*[^\n]+(?:\n[^\n]+)*/g, '')
      .replace(/META_TITLE:\s*.+(?:\n|$)/g, '')
      .replace(/META_DESCRIPTION:\s*.+(?:\n|$)/g, '')
      .replace(/META_KEYWORDS:\s*.+(?:\n|$)/g, '')
      .trim();
  };

  return (
    <div className={`inline-block ${className}`}>
      {error && (
        <div className="text-red-500 text-sm mb-2">
          {error}
        </div>
      )}
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleRegenerate}
        disabled={isRegenerating}
        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        aria-label="Regenerate section"
      >
        {isRegenerating ? (
          <LoadingSpinner size="sm" className="mr-1" />
        ) : (
          <svg 
            className="mr-1 h-3 w-3" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        )}
        Regenerate
      </motion.button>
    </div>
  );
};

export default RegenerateSectionButton;
