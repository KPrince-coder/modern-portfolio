import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface InterestItemProps {
  name: string;
  icon: ReactNode;
  index: number;
}

const InterestItem = ({ name, icon, index }: InterestItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
    >
      <div className="text-indigo-600 dark:text-indigo-400 mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
    </motion.div>
  );
};

export default InterestItem;
