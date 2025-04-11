import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import IconSelector from '../common/IconSelector';

// Types
interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
}

interface SkillCategoryFormProps {
  categories: SkillCategory[];
  onCancel: () => void;
  onSuccess: () => void;
}

const SkillCategoryForm: React.FC<SkillCategoryFormProps> = ({ categories, onCancel, onSuccess }) => {
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [formData, setFormData] = useState<Omit<SkillCategory, 'id'>>({
    name: '',
    description: '',
    icon: '',
    display_order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle icon selection
  const handleIconSelect = (iconHtml: string) => {
    setFormData((prev) => ({ ...prev, icon: iconHtml }));
  };

  // Edit category
  const handleEditCategory = (category: SkillCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order,
    });
    setErrors({});
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
      display_order: 0,
    });
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (data: { id?: string; category: Omit<SkillCategory, 'id'> }) => {
      if (data.id) {
        // Update existing category
        const { error } = await supabase
          .from('portfolio.skill_categories')
          .update({
            name: data.category.name,
            description: data.category.description,
            icon: data.category.icon,
            display_order: data.category.display_order,
          })
          .eq('id', data.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new category
        const { error } = await supabase
          .from('portfolio.skill_categories')
          .insert({
            name: data.category.name,
            description: data.category.description,
            icon: data.category.icon,
            display_order: data.category.display_order,
          });

        if (error) {
          throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
      onSuccess();
      handleCancelEdit();
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('portfolio.skill_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillCategories'] });
      onSuccess();
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await saveCategoryMutation.mutateAsync({
        id: editingCategory?.id,
        category: formData,
      });
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Skill Categories
        </h2>
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Back to Skills
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories List */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Categories
          </h3>
          
          {categories.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map((category) => (
                <li key={category.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {category.icon && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <div dangerouslySetInnerHTML={{ __html: category.icon }} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Order: {category.display_order}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-gray-500 dark:text-gray-400">
                No categories found. Add your first category.
              </p>
            </div>
          )}
        </div>

        {/* Category Form */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.name 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Frontend Development"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            
            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="Brief description of this category"
              />
            </div>
            
            {/* Display Order Field */}
            <div>
              <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="display_order"
                name="display_order"
                value={formData.display_order}
                onChange={handleNumberChange}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="e.g. 1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lower numbers will be displayed first
              </p>
            </div>
            
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Icon
              </label>
              <IconSelector
                selectedIcon={formData.icon}
                onSelectIcon={handleIconSelect}
                compact
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              {editingCategory && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                isLoading={saveCategoryMutation.isPending}
              >
                {editingCategory ? 'Update Category' : 'Add Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCategoryForm;
