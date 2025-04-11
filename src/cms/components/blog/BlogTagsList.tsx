import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Types
interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface BlogTagsListProps {
  tags: BlogTag[];
  isLoading: boolean;
  onBack: () => void;
}

const BlogTagsList: React.FC<BlogTagsListProps> = ({
  tags,
  isLoading,
  onBack,
}) => {
  const queryClient = useQueryClient();
  const [editingTag, setEditingTag] = useState<BlogTag | null>(null);
  const [formData, setFormData] = useState<{ name: string; slug: string }>({
    name: '',
    slug: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Save tag mutation
  const saveTagMutation = useMutation({
    mutationFn: async (data: { id?: string; tag: { name: string; slug: string } }) => {
      if (data.id) {
        // Update existing tag
        const { error } = await supabase
          .from('portfolio.blog_tags')
          .update({
            ...data.tag,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new tag
        const { error } = await supabase
          .from('portfolio.blog_tags')
          .insert({
            ...data.tag,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogTags'] });
      resetForm();
    },
  });

  // Delete tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('portfolio.blog_tags')
        .delete()
        .eq('id', tagId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogTags'] });
    },
  });

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim();
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug when name changes
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: !prev.slug || prev.slug === generateSlug(prev.name) ? generateSlug(value) : prev.slug,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Edit tag
  const handleEditTag = (tag: BlogTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
    });
    setErrors({});
  };

  // Reset form
  const resetForm = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
    });
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await saveTagMutation.mutateAsync({
        id: editingTag?.id,
        tag: formData,
      });
    } catch (error) {
      console.error('Error saving tag:', error);
    }
  };

  // Handle tag deletion
  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      try {
        await deleteTagMutation.mutateAsync(tagId);
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading tags..." />
      </div>
    );
  }

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

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Blog Tags
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage tags for organizing your blog posts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Tags List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Tags
            </h3>
            
            {tags.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                  {tags.map((tag) => (
                    <li key={tag.id} className="p-4 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {tag.name}
                          </h4>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            /{tag.slug}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditTag(tag)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No tags found. Create your first tag.
                </p>
              </div>
            )}
          </div>

          {/* Tag Form */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              {editingTag ? 'Edit Tag' : 'Add New Tag'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="e.g. JavaScript"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>
              
              {/* Slug Field */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug *
                </label>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    /blog/tag/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                      errors.slug 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                    placeholder="javascript"
                  />
                </div>
                {errors.slug ? (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    The URL-friendly name for your tag
                  </p>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-2">
                {editingTag && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={saveTagMutation.isPending}
                >
                  {editingTag ? 'Update Tag' : 'Add Tag'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BlogTagsList;
