import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';

// Components
import ProjectsList from '../components/projects/ProjectsList';
import ProjectForm from '../components/projects/ProjectForm';
import ProjectCategoriesList from '../components/projects/ProjectCategoriesList';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';

// Types
interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  summary?: string;
  thumbnail_url?: string;
  category_id?: string;
  technologies: string[];
  demo_url?: string;
  code_url?: string;
  case_study_url?: string;
  is_featured: boolean;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const ProjectsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useCMS();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'form' | 'categories'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Redirect to form view if ID is provided or if we're on the 'new' route
  useEffect(() => {
    // Check if we're on the 'new' route
    const isNewRoute = window.location.pathname.endsWith('/new');

    if (id || isNewRoute) {
      setView('form');
    } else if (view === 'form' && !isNewRoute) {
      setView('list');
    }
  }, [id, view]);

  // Fetch projects
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useQuery({
    queryKey: ['projects', searchQuery, statusFilter, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          *,
          category:category_id(id, name)
        `)
        .order('display_order', { ascending: true });

      // Apply filters
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data as (Project & { category: { id: string; name: string } })[];
    },
    enabled: isAuthenticated && !authLoading && view === 'list',
  });

  // Fetch project categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ['projectCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data as ProjectCategory[];
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch single project if ID is provided
  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          category:category_id(id, name),
          images:project_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Project & {
        category: { id: string; name: string };
        images: { id: string; image_url: string; alt_text: string; caption?: string; display_order: number }[];
      };
    },
    enabled: isAuthenticated && !authLoading && !!id,
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProjectMutation.mutateAsync(projectId);
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  // Handle view changes
  const handleViewChange = (newView: 'list' | 'form' | 'categories', projectId?: string) => {
    setView(newView);

    if (newView === 'form' && projectId) {
      navigate(`/admin/projects/${projectId}`);
    } else if (newView === 'form' && !projectId) {
      navigate('/admin/projects/new');
    } else if (newView === 'list' && id) {
      navigate('/admin/projects');
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Error state
  if (projectsError || categoriesError || projectError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(projectsError as Error)?.message ||
              (categoriesError as Error)?.message ||
              (projectError as Error)?.message ||
              'An error occurred while fetching data.'}
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Projects</h1>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              variant={view === 'list' ? 'primary' : 'secondary'}
              onClick={() => handleViewChange('list')}
            >
              All Projects
            </Button>
            <Button
              variant={view === 'form' && (window.location.pathname.endsWith('/new') || !id) ? 'primary' : 'secondary'}
              onClick={() => handleViewChange('form')}
            >
              Add Project
            </Button>
            <Button
              variant={view === 'categories' ? 'primary' : 'secondary'}
              onClick={() => handleViewChange('categories')}
            >
              Categories
            </Button>
          </div>
        </motion.div>

        <div className="mt-6">
          {view === 'list' && (
            <ProjectsList
              projects={projects || []}
              categories={categories || []}
              isLoading={projectsLoading || categoriesLoading}
              onDelete={handleDeleteProject}
              onEdit={(projectId: string) => handleViewChange('form', projectId)}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
          )}

          {view === 'form' && (
            <ProjectForm
              project={project}
              categories={categories || []}
              isLoading={projectLoading || categoriesLoading}
              onCancel={() => handleViewChange('list')}
            />
          )}

          {view === 'categories' && (
            <ProjectCategoriesList
              categories={categories || []}
              isLoading={categoriesLoading}
              onBack={() => handleViewChange('list')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
