import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import IconSelector from '../common/IconSelector';

// Types
interface Skill {
  id?: string;
  name: string;
  description: string;
  icon?: string;
  category_id?: string;
  level?: number;
  type: 'technical' | 'soft';
  display_order: number;
  years_experience?: number;
  is_featured: boolean;
}

interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
}

interface SkillFormProps {
  skill: Skill | null;
  categories: SkillCategory[];
  onCancel: () => void;
  onSuccess: () => void;
}

const SkillForm: React.FC<SkillFormProps> = ({ skill, categories, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState<Skill>({
    name: '',
    description: '',
    icon: '',
    category_id: '',
    level: 3,
    type: 'technical',
    display_order: 0,
    years_experience: undefined,
    is_featured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (skill) {
      setFormData({
        id: skill.id,
        name: skill.name || '',
        description: skill.description || '',
        icon: skill.icon || '',
        category_id: skill.category_id || '',
        level: skill.level || 3,
        type: skill.type || 'technical',
        display_order: skill.display_order || 0,
        // Ensure years_experience is undefined, not null
        years_experience: skill.years_experience === null ? undefined : skill.years_experience,
        is_featured: skill.is_featured || false,
      });
    }
  }, [skill]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    // Convert empty string to undefined, not null
    const numValue = value === '' ? undefined : Number(value);
    setFormData((prev) => ({ ...prev, [name]: numValue }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle icon selection
  const handleIconSelect = (iconHtml: string) => {
    setFormData((prev) => ({ ...prev, icon: iconHtml }));

    // Clear error when icon is selected
    if (errors.icon) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.icon;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save skill mutation
  const saveSkillMutation = useMutation({
    mutationFn: async (data: Skill) => {
      if (data.id) {
        // Update existing skill
        const { error } = await supabase
          .from('skills')
          .update({
            name: data.name,
            description: data.description,
            icon: data.icon,
            category_id: data.category_id || null,
            level: data.level,
            type: data.type,
            display_order: data.display_order,
            years_experience: data.years_experience,
            is_featured: data.is_featured,
          })
          .eq('id', data.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new skill
        const { error } = await supabase
          .from('skills')
          .insert({
            name: data.name,
            description: data.description,
            icon: data.icon,
            category_id: data.category_id || null,
            level: data.level,
            type: data.type,
            display_order: data.display_order,
            years_experience: data.years_experience,
            is_featured: data.is_featured,
          });

        if (error) {
          throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
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
      await saveSkillMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving skill:', error);
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
          {skill ? 'Edit Skill' : 'Add New Skill'}
        </h2>
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                placeholder="e.g. React.js"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Type Field */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Skill Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="technical">Technical Skill</option>
                <option value="soft">Soft Skill</option>
              </select>
            </div>
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.description
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              placeholder="Describe this skill and your proficiency with it"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category Field */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Field */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proficiency Level (1-5)
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="level"
                  name="level"
                  min="1"
                  max="5"
                  value={formData.level === undefined || formData.level === null ? 3 : formData.level}
                  onChange={handleNumberChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 min-w-[30px] text-center">
                  {formData.level === undefined || formData.level === null ? 3 : formData.level}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Years Experience Field */}
            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                id="years_experience"
                name="years_experience"
                value={formData.years_experience === undefined || formData.years_experience === null ? '' : formData.years_experience}
                onChange={handleNumberChange}
                min="0"
                step="0.5"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="e.g. 3.5"
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
          </div>

          {/* Featured Checkbox */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Feature this skill on homepage
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Featured skills will be highlighted in the skills section of your homepage
            </p>
          </div>
        </div>

        {/* Icon Selection */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Skill Icon</h3>

          <IconSelector
            selectedIcon={formData.icon}
            onSelectIcon={handleIconSelect}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saveSkillMutation.isPending}
          >
            {skill ? 'Update Skill' : 'Add Skill'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default SkillForm;
