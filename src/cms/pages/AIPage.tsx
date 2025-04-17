import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SaveToBlogButton from '../../components/ui/SaveToBlogButton';
import AIGenerationHistory from '../../components/ui/AIGenerationHistory';
import { groqAPI, BlogPostPrompt, EmailResponsePrompt } from '../../lib/groq';

type AITask = 'blog' | 'email' | 'seo';

interface AIPrompt {
  task: AITask;
  prompt: string;
  result?: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
}

const AIPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useCMS();
  const [activeTask, setActiveTask] = useState<AITask>('blog');
  const [prompt, setPrompt] = useState('');
  const [aiResults, setAiResults] = useState<AIPrompt[]>([]);

  // Generate AI content mutation
  const generateContentMutation = useMutation({
    mutationFn: async (data: { task: AITask; prompt: string }) => {
      // Add the prompt to results with loading status
      const newPrompt: AIPrompt = {
        task: data.task,
        prompt: data.prompt,
        status: 'loading',
      };

      setAiResults(prev => [newPrompt, ...prev]);

      try {
        let result = '';

        // Generate different responses based on the task
        switch (data.task) {
          case 'blog': {
            // Create a blog post prompt
            const blogPrompt: BlogPostPrompt = {
              title: data.prompt,
              topic: data.prompt,
              keywords: extractKeywords(data.prompt),
              tone: 'professional',
              length: 'medium',
            };

            // Generate the blog post using Groq API
            const response = await groqAPI.generateBlogPost(blogPrompt);

            if (response.status === 'error') {
              throw new Error(response.error || 'Failed to generate blog post');
            }

            result = response.text;
            break;
          }
          case 'email': {
            // Create an email response prompt
            const emailPrompt: EmailResponsePrompt = {
              originalMessage: data.prompt,
              context: 'I am a professional web developer with expertise in React, Node.js, and modern web technologies.',
              tone: 'professional',
            };

            // Generate the email response using Groq API
            const response = await groqAPI.generateEmailResponse(emailPrompt);

            if (response.status === 'error') {
              throw new Error(response.error || 'Failed to generate email response');
            }

            result = response.text;
            break;
          }
          case 'seo':
            // For SEO content, we'll still use the local function for now
            result = generateSEOContent(data.prompt);
            break;
        }

        // Update the result in the state
        setAiResults(prev =>
          prev.map((item, index) =>
            index === 0 ? { ...item, result, status: 'success' } : item
          )
        );

        return result;
      } catch (error) {
        console.error('Error generating AI content:', error);

        // Update the error in the state
        setAiResults(prev =>
          prev.map((item, index) =>
            index === 0 ? { ...item, status: 'error', error: (error as Error).message } : item
          )
        );

        throw error;
      }
    },
  });

  // Extract keywords from the prompt
  const extractKeywords = (prompt: string): string[] => {
    // Remove common words and extract potential keywords
    const words = prompt.toLowerCase().split(/\s+/);
    const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about'];

    // Filter out common words and short words
    const keywords = words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      // Remove punctuation
      .map(word => word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''))
      // Remove duplicates
      .filter((word, index, self) => self.indexOf(word) === index)
      // Limit to 5 keywords
      .slice(0, 5);

    return keywords;
  };



  // Generate SEO content based on the prompt
  const generateSEOContent = (prompt: string): string => {
    return `# SEO Optimization for "${prompt}"

## Meta Title
${prompt} - Expert Guide & Tips | YourSite.com

## Meta Description
Discover everything you need to know about ${prompt}. Our comprehensive guide provides expert tips, best practices, and actionable insights. Learn more now!

## Keywords
${prompt}, ${prompt} guide, ${prompt} tips, ${prompt} best practices, ${prompt} how to, ${prompt} tutorial

## H1 Tag
Complete Guide to ${prompt}: Expert Tips & Best Practices

## URL Slug
/guide/${prompt.toLowerCase().replace(/\s+/g, '-')}

## Content Structure Recommendations
1. Introduction to ${prompt}
2. Why ${prompt} Matters
3. Top 5 ${prompt} Strategies
4. Common ${prompt} Mistakes to Avoid
5. ${prompt} Case Studies
6. ${prompt} Tools and Resources
7. Conclusion`;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    generateContentMutation.mutateAsync({
      task: activeTask,
      prompt: prompt.trim(),
    });

    setPrompt('');
  };

  // Handle copying content to clipboard
  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => {
        alert('Content copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy content:', err);
      });
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Handle selecting a generation from history
  const handleSelectGeneration = (content: string) => {
    // Create a new result with the selected content
    const newResult: AIPrompt = {
// @ts-ignore
      id: Date.now().toString(),
      task: 'blog',
      prompt: 'Selected from history',
      status: 'success',
      result: content,
      timestamp: new Date().toISOString(),
    };

    // Add the result to the list
    setAiResults([newResult, ...aiResults]);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Assistant</h1>
        </motion.div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Input Form */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Generate Content
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Use AI to generate various types of content
                </p>
              </div>

              <div className="p-4">
                {/* Task Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Task
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTask('blog')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        activeTask === 'blog'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Blog Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTask('email')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        activeTask === 'email'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Email Response
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTask('seo')}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        activeTask === 'seo'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      SEO Content
                    </button>
                  </div>
                </div>

                {/* Prompt Input */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {activeTask === 'blog' && 'Blog Topic'}
                      {activeTask === 'email' && 'Email Subject'}
                      {activeTask === 'seo' && 'Target Keyword/Topic'}
                    </label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder={
                        activeTask === 'blog'
                          ? 'e.g. 10 Essential React Hooks Every Developer Should Know'
                          : activeTask === 'email'
                          ? 'e.g. Response to client inquiry about project timeline'
                          : 'e.g. React Performance Optimization'
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={generateContentMutation.isPending}
                    disabled={!prompt.trim() || generateContentMutation.isPending}
                    fullWidth
                  >
                    Generate Content
                  </Button>
                </form>

                {/* Task Description */}
                <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {activeTask === 'blog' && 'Blog Post Generator'}
                    {activeTask === 'email' && 'Email Response Generator'}
                    {activeTask === 'seo' && 'SEO Content Generator'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activeTask === 'blog' && 'Generate a complete blog post structure with introduction, main points, and conclusion based on your topic.'}
                    {activeTask === 'email' && 'Generate a professional email response template that you can customize before sending.'}
                    {activeTask === 'seo' && 'Generate SEO-optimized content including meta title, description, keywords, and content structure.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Results */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Generated Content
                </h2>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {aiResults.length === 0 ? (
                  <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No content generated yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Use the form to generate AI content
                    </p>
                  </div>
                ) : (
                  aiResults.map((result, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {result.task === 'blog' && 'Blog Post'}
                            {result.task === 'email' && 'Email Response'}
                            {result.task === 'seo' && 'SEO Content'}
                          </span>
                          <h3 className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                            {result.prompt}
                          </h3>
                        </div>
                        {result.status === 'success' && result.result && (
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleCopyContent(result.result!)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                            >
                              Copy
                            </button>
                            {result.task === 'blog' && (
                              <SaveToBlogButton
                                content={result.result}
                                className="ml-2 py-1 px-2 text-xs"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {result.status === 'loading' && (
                        <div className="flex items-center justify-center py-8">
                          <LoadingSpinner size="md" text="Generating content..." />
                        </div>
                      )}

                      {result.status === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                            {result.error || 'An error occurred while generating content.'}
                          </p>
                        </div>
                      )}

                      {result.status === 'success' && result.result && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mt-2">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                            {result.result}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* AI Generation History */}
          {activeTask === 'blog' && (
            <div className="lg:col-span-3 mt-6">
              <AIGenerationHistory
                onSelectGeneration={handleSelectGeneration}
                className="shadow-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPage;
