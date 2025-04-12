import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface AIGeneration {
  id: string;
  created_at: string;
  prompt_text: string;
  response: string;
  model: string;
  parameters: Record<string, unknown>;
  tokens_used?: number;
  generation_time_ms?: number;
  user_id?: string;
  prompt_id?: string;
  prompt_type?: string;
}

interface AIGenerationHistoryProps {
  onSelectGeneration?: (content: string) => void;
  className?: string;
}

/**
 * Component that displays the history of AI generations
 */
const AIGenerationHistory: React.FC<AIGenerationHistoryProps> = ({
  onSelectGeneration,
  className = '',
}) => {
  const [generations, setGenerations] = useState<AIGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Fetch AI generations on component mount
  useEffect(() => {
    const fetchGenerations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch generations from the database
        const { data, error } = await supabase
          .from('ai_generations')
          .select('*')
          .eq('prompt_type', 'blog_post')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          throw new Error(error.message);
        }

        // Transform the data to match our interface
        const transformedData = data?.map(item => ({
          id: item.id,
          created_at: item.created_at,
          prompt_text: item.prompt_text,
          response: item.response,
          model: item.model,
          parameters: item.parameters,
          tokens_used: item.tokens_used,
          generation_time_ms: item.generation_time_ms,
          user_id: item.user_id,
          prompt_id: item.prompt_id
        })) || [];

        setGenerations(transformedData);
      } catch (error) {
        console.error('Error fetching AI generations:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenerations();
  }, []);

  // Handle generation selection
  const handleSelectGeneration = (generation: AIGeneration) => {
    setSelectedGeneration(generation.id);

    if (onSelectGeneration) {
      onSelectGeneration(generation.response);
    }
  };

  // Handle preview
  const handlePreview = (content: string) => {
    setPreviewContent(content);
    setIsPreviewOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };



  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent AI Blog Generations
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select a previous generation to use as a starting point
        </p>
      </div>

      {(() => {
        if (isLoading) {
          return (
            <div className="p-6 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          );
        }

        if (error) {
          return (
            <div className="p-6 text-center text-red-500">
              {error}
            </div>
          );
        }

        if (generations.length === 0) {
          return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No AI generations found
            </div>
          );
        }

        return (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {generations.map((generation) => {
              // Parse parameters to get prompt details
              const parameters = typeof generation.parameters === 'string'
                ? JSON.parse(generation.parameters)
                : generation.parameters;

              return (
                <motion.div
                  key={generation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedGeneration === generation.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {parameters?.title || 'Untitled Generation'}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(generation.created_at)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handlePreview(generation.response)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectGeneration(generation)}
                        className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                      >
                        Use
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Topic:</span>{' '}
                      {parameters?.topic || 'N/A'}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium">Keywords:</span>{' '}
                      {parameters?.keywords?.join(', ') || 'N/A'}
                    </p>
                    <p className="mt-1">
                      <span className="font-medium">Model:</span>{' '}
                      {generation.model || 'N/A'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        );
      })()}

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Generation Preview
                </h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">
                    {previewContent}
                  </pre>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    if (onSelectGeneration) {
                      onSelectGeneration(previewContent);
                    }
                    setIsPreviewOpen(false);
                  }}
                >
                  Use This Content
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIGenerationHistory;
