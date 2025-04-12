import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { extractSections, BlogSection } from '../../utils/blogSectionExtractor';
import RegenerateSectionButton from './RegenerateSectionButton';
import AIGeneratedBadge from './AIGeneratedBadge';

interface BlogSectionsEditorProps {
  content: string;
  isAIGenerated: boolean;
  onChange: (content: string) => void;
}

/**
 * Component that displays blog sections with regeneration buttons
 */
const BlogSectionsEditor: React.FC<BlogSectionsEditorProps> = ({
  content,
  isAIGenerated,
  onChange,
}) => {
  const [sections, setSections] = useState<BlogSection[]>([]);
  
  // Extract sections when content changes
  useEffect(() => {
    const extractedSections = extractSections(content);
    setSections(extractedSections);
  }, [content]);
  
  // If there are no sections, just return null
  if (sections.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-700 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Blog Sections
          </h3>
          {isAIGenerated && (
            <AIGeneratedBadge className="ml-2" size="sm" />
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {sections.length} section{sections.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {section.title}
              </h4>
              {isAIGenerated && (
                <RegenerateSectionButton
                  section={section}
                  fullContent={content}
                  onContentUpdate={onChange}
                />
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {section.content.length} characters
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BlogSectionsEditor;
