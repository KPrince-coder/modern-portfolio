import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Component for newsletter signup in the blog sidebar
 */
const BlogNewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // In a real app, you would send this to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        Subscribe to Newsletter
      </h3>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        Get the latest posts delivered right to your inbox.
      </p>

      {isSuccess ? (
        <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-3 rounded-lg text-sm">
          Thanks for subscribing! Please check your email to confirm your subscription.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      )}
    </motion.div>
  );
};

export default BlogNewsletterSignup;
