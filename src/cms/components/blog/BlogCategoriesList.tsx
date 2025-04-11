import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import BlogCategoriesManager from './BlogCategoriesManager';

// Types
interface BlogCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface BlogCategoriesListProps {
  categories: BlogCategory[];
  isLoading: boolean;
  onBack: () => void;
}

const BlogCategoriesList: React.FC<BlogCategoriesListProps> = ({
  categories,
  isLoading,
  onBack,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="secondary"
          onClick={onBack}
          leftIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        >
          Back to Posts
        </Button>
      </div>

      <BlogCategoriesManager
        categories={categories}
        isLoading={isLoading}
      />
    </motion.div>
  );
};

export default BlogCategoriesList;
