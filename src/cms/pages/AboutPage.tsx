import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';

// Components
import PersonalInfoForm from '../components/about/PersonalInfoForm';
import SkillsManager from '../components/about/SkillsManager';
import WorkExperienceManager from '../components/about/WorkExperienceManager';
import EducationManager from '../components/about/EducationManager';
import InterestsManager from '../components/about/InterestsManager';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

// Types
interface PersonalData {
  id: string;
  name: string;
  title: string;
  bio: string;
  profile_image_url?: string;
  resume_url?: string;
  email: string;
  phone?: string;
  location?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  seo_slug?: string;
  structured_data?: any;
  published: boolean;
}

type AboutView = 'personal' | 'skills' | 'experience' | 'education' | 'interests';

const AboutPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useCMS();
  const queryClient = useQueryClient();
  const [view, setView] = useState<AboutView>('personal');

  // Fetch personal data
  const {
    data: personalData,
    isLoading: personalDataLoading,
    error: personalDataError,
  } = useQuery({
    queryKey: ['personalData'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      return data?.[0] as PersonalData | undefined;
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Loading state
  if (authLoading || personalDataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Error state
  if (personalDataError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(personalDataError as Error)?.message || 'An error occurred while fetching data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">About Page Management</h1>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <Button
              variant={view === 'personal' ? 'primary' : 'secondary'}
              onClick={() => setView('personal')}
            >
              Personal Info
            </Button>
            <Button
              variant={view === 'skills' ? 'primary' : 'secondary'}
              onClick={() => setView('skills')}
            >
              Skills
            </Button>
            <Button
              variant={view === 'experience' ? 'primary' : 'secondary'}
              onClick={() => setView('experience')}
            >
              Experience
            </Button>
            <Button
              variant={view === 'education' ? 'primary' : 'secondary'}
              onClick={() => setView('education')}
            >
              Education
            </Button>
            <Button
              variant={view === 'interests' ? 'primary' : 'secondary'}
              onClick={() => setView('interests')}
            >
              Interests
            </Button>
          </div>
        </motion.div>

        <div className="mt-6">
          {view === 'personal' && (
            <PersonalInfoForm
              personalData={personalData}
            />
          )}

          {view === 'skills' && (
            <SkillsManager />
          )}

          {view === 'experience' && (
            <WorkExperienceManager />
          )}

          {view === 'education' && (
            <EducationManager />
          )}

          {view === 'interests' && (
            <InterestsManager />
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
