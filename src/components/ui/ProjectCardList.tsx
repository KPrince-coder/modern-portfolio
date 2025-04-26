import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProjectCardSkeleton from './ProjectCardSkeleton';

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url?: string;
  category?: { id: string; name: string; slug: string } | null;
  technologies: string[];
  demo_url?: string;
  code_url?: string;
  case_study_url?: string;
}

interface ProjectCardListProps {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  categoryFilter: string;
}

const ProjectCardList: React.FC<ProjectCardListProps> = ({
  projects,
  isLoading,
  error,
  categoryFilter
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <ProjectCardSkeleton key={index} delay={index * 0.1} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 dark:text-red-400 text-lg mb-2">
          Failed to load projects
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Please try again later
        </p>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          {categoryFilter === 'all' 
            ? 'No projects found.' 
            : 'No projects found in this category.'}
        </p>
      </div>
    );
  }

  // Projects grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  );
};

const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
  >
    <Link to={`/projects/${project.slug}`} className="block">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
        {project.thumbnail_url ? (
          <img 
            src={project.thumbnail_url} 
            alt={project.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <svg className="w-1/4 h-1/4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        {project.category && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-indigo-600/80 text-white text-sm rounded-full backdrop-blur-sm">
              {project.category.name}
            </span>
          </div>
        )}
      </div>
    </Link>

    <div className="p-6">
      <Link to={`/projects/${project.slug}`} className="block">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          {project.title}
        </h2>
      </Link>
      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs"
          >
            {tech}
          </span>
        ))}
        {project.technologies.length > 4 && (
          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-xs">
            +{project.technologies.length - 4}
          </span>
        )}
      </div>

      {/* Links */}
      <div className="flex gap-4 mt-4">
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Live Demo
          </a>
        )}
        {project.code_url && (
          <a
            href={project.code_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            View Code
          </a>
        )}
        {project.case_study_url && (
          <a
            href={project.case_study_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            Case Study
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

export default ProjectCardList;
