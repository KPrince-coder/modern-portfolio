import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

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
  category?: { id: string; name: string } | null;
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

interface ProjectsListProps {
  projects: Project[];
  categories: ProjectCategory[];
  isLoading: boolean;
  onDelete: (projectId: string) => void;
  onEdit: (projectId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: 'all' | 'draft' | 'published' | 'archived';
  setStatusFilter: (status: 'all' | 'draft' | 'published' | 'archived') => void;
  categoryFilter: string;
  setCategoryFilter: (categoryId: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  categories,
  isLoading,
  onDelete,
  onEdit,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}) => {
  // Get status badge color
  const getStatusBadgeColor = (status: string): 'gray' | 'blue' | 'green' | 'purple' => {
    switch (status) {
      case 'draft': return 'blue';
      case 'published': return 'green';
      case 'archived': return 'purple';
      default: return 'gray';
    }
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not published';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading projects..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="Search projects..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {projects.map((project) => (
            <div key={project.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start">
                {/* Thumbnail */}
                {project.thumbnail_url && (
                  <div className="flex-shrink-0 w-full md:w-48 h-32 mb-4 md:mb-0 md:mr-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={project.thumbnail_url} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {project.title}
                    </h2>
                    {project.is_featured && (
                      <Badge color="yellow">
                        Featured
                      </Badge>
                    )}
                    <Badge color={getStatusBadgeColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-2 gap-x-4">
                    <span>
                      {project.category ? project.category.name : 'Uncategorized'}
                    </span>
                    
                    <span>
                      Order: {project.display_order}
                    </span>
                    
                    <span>
                      {formatDate(project.published_at)}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(project.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(project.id)}
                    >
                      Delete
                    </Button>
                    
                    {project.status === 'published' && (
                      <a
                        href={`/projects/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm"
                      >
                        View Project
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating a new project'}
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => onEdit('new')}
            >
              Create New Project
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectsList;
