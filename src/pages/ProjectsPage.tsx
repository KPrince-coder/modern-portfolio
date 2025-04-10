import { useState } from 'react';
import { motion } from 'framer-motion';
import Container from '../components/layout/Container';

const ProjectsPage = () => {
  const [filter, setFilter] = useState<string>('all');

  // Filter projects based on selected category
  const filteredProjects = projects.filter(project =>
    filter === 'all' || project.category === filter
  );

  return (
    <Container>
      <div className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
          My Projects
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          A collection of my work across various domains and technologies.
        </p>
      </motion.div>

      {/* Filter buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All Projects
        </FilterButton>
        <FilterButton
          active={filter === 'web'}
          onClick={() => setFilter('web')}
        >
          Web Development
        </FilterButton>
        <FilterButton
          active={filter === 'mobile'}
          onClick={() => setFilter('mobile')}
        >
          Mobile Apps
        </FilterButton>
        <FilterButton
          active={filter === 'ai'}
          onClick={() => setFilter('ai')}
        >
          AI Projects
        </FilterButton>
        <FilterButton
          active={filter === 'design'}
          onClick={() => setFilter('design')}
        >
          UI/UX Design
        </FilterButton>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No projects found in this category.
          </p>
        </div>
      )}
    </div>
    </Container>
  );
};

// Helper components
const FilterButton = ({
  children,
  active,
  onClick
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={`px-4 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
      {/* Placeholder for project image */}
      <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <svg className="w-1/4 h-1/4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Category badge */}
      <div className="absolute top-4 right-4">
        <span className="px-3 py-1 bg-indigo-600/80 text-white text-sm rounded-full backdrop-blur-sm">
          {getCategoryLabel(project.category)}
        </span>
      </div>
    </div>

    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
        {project.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {project.description}
      </p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Links */}
      <div className="flex gap-4 mt-4">
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Live Demo
          </a>
        )}
        {project.codeUrl && (
          <a
            href={project.codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            View Code
          </a>
        )}
        {project.caseStudyUrl && (
          <a
            href={project.caseStudyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Case Study
          </a>
        )}
      </div>
    </div>
  </motion.div>
);

// Helper function to get category label
const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'web':
      return 'Web Development';
    case 'mobile':
      return 'Mobile App';
    case 'ai':
      return 'AI Project';
    case 'design':
      return 'UI/UX Design';
    default:
      return 'Other';
  }
};

// Types
interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  demoUrl?: string;
  codeUrl?: string;
  caseStudyUrl?: string;
}

// Sample data
const projects: Project[] = [
  {
    id: 1,
    title: 'E-commerce Platform',
    description: 'A full-featured e-commerce platform with product management, cart functionality, and payment processing.',
    category: 'web',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    demoUrl: 'https://example.com',
    codeUrl: 'https://github.com',
  },
  {
    id: 2,
    title: 'AI-Powered Content Generator',
    description: 'A tool that uses AI to generate blog posts, social media content, and marketing copy.',
    category: 'ai',
    technologies: ['React', 'Python', 'TensorFlow', 'GPT-3'],
    demoUrl: 'https://example.com',
    caseStudyUrl: 'https://example.com/case-study',
  },
  {
    id: 3,
    title: 'Fitness Tracking App',
    description: 'A mobile app that helps users track their workouts, nutrition, and fitness goals.',
    category: 'mobile',
    technologies: ['React Native', 'Firebase', 'Redux'],
    demoUrl: 'https://example.com',
    codeUrl: 'https://github.com',
  },
  {
    id: 4,
    title: 'Banking Dashboard',
    description: 'A responsive dashboard for a banking application with transaction history, account management, and analytics.',
    category: 'web',
    technologies: ['Vue.js', 'Express', 'PostgreSQL', 'D3.js'],
    demoUrl: 'https://example.com',
  },
  {
    id: 5,
    title: 'Smart Home Control System',
    description: 'An IoT system for controlling smart home devices with voice commands and automation rules.',
    category: 'ai',
    technologies: ['React', 'Node.js', 'WebSockets', 'TensorFlow.js'],
    codeUrl: 'https://github.com',
    caseStudyUrl: 'https://example.com/case-study',
  },
  {
    id: 6,
    title: 'Travel App UI Design',
    description: 'A modern UI design for a travel booking application with a focus on user experience and accessibility.',
    category: 'design',
    technologies: ['Figma', 'Adobe XD', 'Illustrator'],
    demoUrl: 'https://example.com',
    caseStudyUrl: 'https://example.com/case-study',
  },
];

export default ProjectsPage;
