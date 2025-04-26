import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tags?: string[];
  delay?: number;
}

const ProjectCard = ({
  id,
  title,
  description,
  imageUrl,
  tags = [],
  delay = 0,
}: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link to={`/projects/${id}`} className="block">
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
        <div className="relative aspect-video overflow-hidden cursor-pointer">
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-70"></div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg
                className="w-1/4 h-1/4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

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
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
              {description}
            </p>
          </div>

          {/* View Project Button */}
          <div className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium group/btn">
            View Project
            <motion.span
              initial={{ x: 0 }}
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.3 }}
              className="ml-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </motion.span>
          </div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -z-10 -bottom-6 -right-6 w-24 h-24 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-xl"
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.8 : 0.3,
          }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>
    </Link>
  );
};

export default ProjectCard;
