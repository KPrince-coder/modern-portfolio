import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useBlogComments, useSubmitBlogComment } from '../../hooks/useSupabase';

interface BlogCommentsProps {
  postId: string;
}

const BlogComments: React.FC<BlogCommentsProps> = ({ postId }) => {
  const { data: comments = [], isLoading } = useBlogComments(postId);
  const submitComment = useSubmitBlogComment();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    content: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    content: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {
      name: '',
      email: '',
      content: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.content.trim()) {
      errors.content = 'Comment is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitComment.mutateAsync({
        post_id: postId,
        author_name: formData.name,
        author_email: formData.email,
        author_website: formData.website || undefined,
        content: formData.content,
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        website: '',
        content: '',
      });
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Comments</h3>
      
      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
              <div className="ml-14">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-8 mb-12">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {comment.author_name}
                    {comment.author_website && (
                      <a
                        href={comment.author_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        (Website)
                      </a>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(comment.created_at)}
                  </p>
                </div>
              </div>
              <div className="ml-14">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-12 text-center">
          <p className="text-gray-700 dark:text-gray-300">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
      
      {/* Comment form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Leave a comment</h4>
        
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-lg">
            <p>
              Thank you for your comment! It will be visible after approval.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  formErrors.name
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Your name"
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  formErrors.email
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
                placeholder="Your email (not published)"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website (optional)
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com"
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-2 border ${
                formErrors.content
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white`}
              placeholder="Your comment"
            ></textarea>
            {formErrors.content && (
              <p className="mt-1 text-sm text-red-500">{formErrors.content}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Comment'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default BlogComments;
