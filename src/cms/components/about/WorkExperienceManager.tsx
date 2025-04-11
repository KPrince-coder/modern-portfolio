import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Badge from '../../../components/ui/Badge';
import WorkExperienceForm from './WorkExperienceForm';

// Types
interface WorkExperience {
  id: string;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  company_url?: string;
  company_logo_url?: string;
  technologies?: string[];
  achievements?: string[];
  display_order: number;
}

type WorkExperienceView = 'list' | 'add' | 'edit';

const WorkExperienceManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<WorkExperienceView>('list');
  const [selectedExperience, setSelectedExperience] = useState<WorkExperience | null>(null);

  // Fetch work experiences
  const {
    data: experiences,
    isLoading: experiencesLoading,
    error: experiencesError,
  } = useQuery({
    queryKey: ['workExperiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio.work_experience')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as WorkExperience[];
    },
  });

  // Delete work experience mutation
  const deleteExperienceMutation = useMutation({
    mutationFn: async (experienceId: string) => {
      const { error } = await supabase
        .from('portfolio.work_experience')
        .delete()
        .eq('id', experienceId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workExperiences'] });
    },
  });

  // Handle work experience deletion
  const handleDeleteExperience = async (experienceId: string) => {
    if (window.confirm('Are you sure you want to delete this work experience? This action cannot be undone.')) {
      try {
        await deleteExperienceMutation.mutateAsync(experienceId);
      } catch (error) {
        console.error('Error deleting work experience:', error);
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
  if (experiencesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading work experiences..." />
      </div>
    );
  }

  // Error state
  if (experiencesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(experiencesError as Error)?.message || 'An error occurred while fetching data.'}
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Work Experience</h2>
            <div className="mt-4 sm:mt-0">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedExperience(null);
                  setView('add');
                }}
              >
                Add Work Experience
              </Button>
            </div>
          </div>

          {/* Work Experience List */}
          {experiences && experiences.length > 0 ? (
            <div className="space-y-6">
              {experiences.map((experience) => (
                <div 
                  key={experience.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start">
                        {experience.company_logo_url && (
                          <div className="flex-shrink-0 h-12 w-12 mr-4 bg-white dark:bg-gray-800 rounded-md p-1 shadow-sm">
                            <img 
                              src={experience.company_logo_url} 
                              alt={experience.company} 
                              className="h-full w-full object-contain"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {experience.position}
                          </h3>
                          <div className="flex items-center mt-1">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {experience.company}
                            </p>
                            {experience.company_url && (
                              <a 
                                href={experience.company_url} 
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
                            <span>{formatDate(experience.start_date)} - {experience.is_current ? 'Present' : formatDate(experience.end_date)}</span>
                            {experience.location && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{experience.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {experience.description}
                        </p>
                      </div>
                      
                      {experience.technologies && experience.technologies.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {experience.technologies.map((tech, index) => (
                            <Badge key={index} color="indigo">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {experience.achievements && experience.achievements.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Achievements:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            {experience.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 md:ml-4 flex md:flex-col space-x-3 md:space-x-0 md:space-y-2">
                      <button
                        onClick={() => {
                          setSelectedExperience(experience);
                          setView('edit');
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExperience(experience.id)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No work experience</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding your work experience
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedExperience(null);
                    setView('add');
                  }}
                >
                  Add Work Experience
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {(view === 'add' || view === 'edit') && (
        <WorkExperienceForm
          experience={selectedExperience}
          onCancel={() => setView('list')}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['workExperiences'] });
            setView('list');
          }}
        />
      )}
    </motion.div>
  );
};

export default WorkExperienceManager;
