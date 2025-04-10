import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="py-16 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <div className="mb-8 text-indigo-600 dark:text-indigo-400">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 dark:text-white mb-6">
          404
        </h1>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-6">
          Page Not Found
        </h2>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </Link>
          
          <Link 
            to="/contact" 
            className="px-6 py-3 border border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
