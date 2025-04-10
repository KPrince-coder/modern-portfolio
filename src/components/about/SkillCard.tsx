import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SkillCardProps {
  name: string;
  description: string;
  icon: ReactNode;
  index: number;
}

const SkillCard = ({ name, description, icon, index }: SkillCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="text-indigo-600 dark:text-indigo-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{name}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
};

export default SkillCard;
