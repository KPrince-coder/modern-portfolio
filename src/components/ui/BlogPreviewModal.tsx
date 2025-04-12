import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { extractBlogData, ExtractedBlogData } from '../../utils/blogContentExtractor';
import Button from './Button';
import AIGeneratedBadge from './AIGeneratedBadge';
import ReactMarkdown from 'react-markdown';

interface BlogPreviewModalProps {
  content: string;
  isOpen: boolean;
  onClose: () => void;
  categories?: Array<{ id: string; name: string }>;
}

/**
 * Modal component that shows a preview of the blog post before saving
 */
const BlogPreviewModal: React.FC<BlogPreviewModalProps> = ({
  content,
  isOpen,
  onClose,
  categories = [],
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'preview' | 'metadata'>('preview');

  // Extract blog data from content
  const blogData: ExtractedBlogData = extractBlogData(content, categories);

  const handleSaveToBlog = () => {
    try {
      // Store the extracted data in sessionStorage for the blog form to use
      sessionStorage.setItem('ai_generated_blog_data', JSON.stringify(blogData));

      // Store a flag to indicate we should redirect to the blog list after saving
      sessionStorage.setItem('redirect_to_blog_list_after_save', 'true');

      // Close the modal
      onClose();

      // Navigate to the blog post creation form
      navigate('/admin/blog/new');
    } catch (error) {
      console.error('Error processing blog content:', error);
      alert('There was an error processing the blog content. Please try again.');
    }
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Blog Post Preview
                </h2>
                <AIGeneratedBadge className="ml-3" />
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'preview'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Content Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('metadata')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'metadata'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Metadata & SEO
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 max-h-[calc(90vh-200px)]">
              {activeTab === 'preview' && (
                <div>
                  <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {blogData.title}
                    </h1>

                    {blogData.featuredImageUrl && (
                      <div className="mb-6 rounded-lg overflow-hidden">
                        <img
                          src={blogData.featuredImageUrl}
                          alt={`Featured image for ${blogData.title}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}

                    <div className="text-gray-500 dark:text-gray-400 mb-2">
                      {blogData.summary}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {blogData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {blogData.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {activeTab === 'metadata' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      SEO Title
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {blogData.metaTitle}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Meta Description
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {blogData.metaDescription}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Keywords
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {blogData.metaKeywords}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {blogData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Featured Image
                    </h3>
                    {blogData.featuredImageUrl ? (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <img
                          src={blogData.featuredImageUrl}
                          alt={`Featured image for ${blogData.title}`}
                          className="w-full h-auto max-h-48 object-cover rounded"
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-500">
                        No featured image
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Suggested Images
                    </h3>
                    {blogData.suggestedImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {blogData.suggestedImages.map((image, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                              {image.placeholder}
                            </div>
                            <div className="text-sm font-medium">
                              Alt: {image.alt}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-500">
                        No suggested images
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      YouTube Embeds
                    </h3>
                    {blogData.youtubeEmbeds.length > 0 ? (
                      <div className="space-y-2">
                        {blogData.youtubeEmbeds.map((videoId, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            Video ID: {videoId}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-gray-500">
                        No YouTube embeds
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveToBlog}
              >
                Edit as Blog Post
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BlogPreviewModal;
