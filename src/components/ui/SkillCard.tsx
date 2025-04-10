import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SkillCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  level?: number; // 1-5 skill level
  delay?: number;
}

const SkillCard = ({ icon, title, description, level = 3, delay = 0 }: SkillCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      
      {/* Skill level indicator */}
      <div className="flex items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400 mr-2">Proficiency:</div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <div 
              key={star}
              className={`w-6 h-1.5 rounded-full ${
                star <= level 
                  ? 'bg-indigo-500 dark:bg-indigo-400' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCard;
