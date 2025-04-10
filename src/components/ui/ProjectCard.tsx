import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  delay?: number;
}

const ProjectCard = ({ id, title, description, imageUrl, tags, delay = 0 }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with overlay */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
        
        {/* Tags */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="px-2 py-1 text-xs font-medium bg-indigo-600/90 text-white rounded-md backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-700/90 text-white rounded-md backdrop-blur-sm">
              +{tags.length - 3}
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* View Project Button */}
        <Link 
          to={`/projects/${id}`}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium group/btn"
        >
          View Project
          <motion.span
            initial={{ x: 0 }}
            animate={{ x: isHovered ? 5 : 0 }}
            transition={{ duration: 0.3 }}
            className="ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.span>
        </Link>
      </div>
      
      {/* Decorative elements */}
      <motion.div 
        className="absolute -z-10 -bottom-6 -right-6 w-24 h-24 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-xl"
        animate={{ 
          scale: isHovered ? 1.2 : 1,
          opacity: isHovered ? 0.8 : 0.3
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
};

export default ProjectCard;
