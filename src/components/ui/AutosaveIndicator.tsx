import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSaved: string | null;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ isSaving, lastSaved }) => {
  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    
    try {
      const date = new Date(lastSaved);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
      <AnimatePresence mode="wait">
        {isSaving ? (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Saving...</span>
          </motion.div>
        ) : lastSaved ? (
          <motion.div
            key="saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center"
          >
            <svg className="mr-1.5 h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Saved at {formatLastSaved()}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default AutosaveIndicator;
