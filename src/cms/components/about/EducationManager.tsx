import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EducationForm from './EducationForm';

// Types
interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description?: string;
  institution_url?: string;
  institution_logo_url?: string;
  achievements?: string[];
  display_order: number;
}

type EducationView = 'list' | 'add' | 'edit';

const EducationManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<EducationView>('list');
  const [selectedEducation, setSelectedEducation] = useState<Education | null>(null);

  // Fetch education entries
  const {
    data: educationEntries,
    isLoading: educationLoading,
    error: educationError,
  } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio.education')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as Education[];
    },
  });

  // Delete education mutation
  const deleteEducationMutation = useMutation({
    mutationFn: async (educationId: string) => {
      const { error } = await supabase
        .from('portfolio.education')
        .delete()
        .eq('id', educationId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
    },
  });

  // Handle education deletion
  const handleDeleteEducation = async (educationId: string) => {
    if (window.confirm('Are you sure you want to delete this education entry? This action cannot be undone.')) {
      try {
        await deleteEducationMutation.mutateAsync(educationId);
      } catch (error) {
        console.error('Error deleting education entry:', error);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Loading state
  if (educationLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading education..." />
      </div>
    );
  }

  // Error state
  if (educationError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(educationError as Error)?.message || 'An error occurred while fetching data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      {view === 'list' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Education</h2>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedEducation(null);
                  setView('add');
                }}
              >
                Add Education
              </Button>
            </div>
          </div>

          {/* Education List */}
          {educationEntries && educationEntries.length > 0 ? (
            <div className="space-y-6">
              {educationEntries.map((education) => (
                <div 
                  key={education.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start">
                        {education.institution_logo_url && (
                          <div className="flex-shrink-0 h-12 w-12 mr-4 bg-white dark:bg-gray-800 rounded-md p-1 shadow-sm">
                            <img 
                              src={education.institution_logo_url} 
                              alt={education.institution} 
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {education.degree} in {education.field_of_study}
                          </h3>
                          <div className="flex items-center mt-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {education.institution}
                            </p>
                            {education.institution_url && (
                              <a 
                                href={education.institution_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatDate(education.start_date)} - {education.is_current ? 'Present' : formatDate(education.end_date)}</span>
                            {education.location && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{education.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {education.description && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {education.description}
                          </p>
                        </div>
                      )}
                      
                      {education.achievements && education.achievements.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Achievements:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {education.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 flex md:flex-col space-x-3 md:space-x-0 md:space-y-2">
                      <button
                        onClick={() => {
                          setSelectedEducation(education);
                          setView('edit');
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(education.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-md">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No education entries</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your education
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedEducation(null);
                    setView('add');
                  }}
                >
                  Add Education
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {(view === 'add' || view === 'edit') && (
        <EducationForm
          education={selectedEducation}
          onCancel={() => setView('list')}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['education'] });
            setView('list');
          }}
        />
      )}
    </motion.div>
  );
};

export default EducationManager;
