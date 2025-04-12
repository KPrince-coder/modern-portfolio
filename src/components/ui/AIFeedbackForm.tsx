import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { trackAIFeedback } from '../../utils/analyticsTracker';
import Button from './Button';

interface AIFeedbackFormProps {
  postId: string;
  onSubmit?: () => void;
  className?: string;
}

/**
 * Component for collecting feedback on AI-generated content
 */
const AIFeedbackForm: React.FC<AIFeedbackFormProps> = ({
  postId,
  onSubmit,
  className = '',
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === null) {
      setError('Please select a rating');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await trackAIFeedback(postId, rating, feedback);
      setIsSubmitted(true);
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 p-4 rounded ${className}`}
      >
        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Thank you for your feedback!</h3>
        <p className="mt-1 text-sm text-green-700 dark:text-green-300">
          Your feedback helps us improve our AI content generation.
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          How would you rate this AI-generated content?
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Your feedback helps us improve our AI content generation.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="mb-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  rating === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                aria-label={`Rate ${value} out of 5`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Additional feedback (optional)
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="What did you like or dislike about this content?"
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          fullWidth
        >
          Submit Feedback
        </Button>
      </form>
    </motion.div>
  );
};

export default AIFeedbackForm;
