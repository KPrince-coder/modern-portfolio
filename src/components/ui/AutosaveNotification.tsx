import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface AutosaveNotificationProps {
  isVisible: boolean;
  timestamp: string | null;
  onRestore: () => void;
  onDiscard: () => void;
}

const AutosaveNotification: React.FC<AutosaveNotificationProps> = ({
  isVisible,
  timestamp,
  onRestore,
  onDiscard,
}) => {
  if (!isVisible || !timestamp) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-indigo-100 dark:border-gray-700"
          >
            {/* Header with icon */}
            <div className="bg-indigo-50 dark:bg-gray-700 px-6 py-4 flex items-center border-b border-indigo-100 dark:border-gray-600">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full mr-4">
                <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unsaved Draft Found</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Last saved {timestamp}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                We found an unsaved draft of your work. Would you like to restore this content or discard it and continue with your current version?
              </p>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onDiscard}
                  className="order-1 sm:order-none"
                >
                  Discard Draft
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={onRestore}
                >
                  Restore Draft
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AutosaveNotification;
