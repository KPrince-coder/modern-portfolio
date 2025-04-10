import { motion } from 'framer-motion';

interface SectionDividerProps {
  className?: string;
}

const SectionDivider = ({ className = '' }: SectionDividerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`flex justify-center my-16 ${className}`}
    >
      <div className="w-1/3 max-w-xs h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent"></div>
    </motion.div>
  );
};

export default SectionDivider;
