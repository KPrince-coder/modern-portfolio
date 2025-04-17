import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import TagInput from '../common/TagInput';

// Types
interface WorkExperience {
  id?: string;
  company: string;
  position: string;
  description: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  company_url?: string;
  company_logo_url?: string;
  technologies?: string[];
  achievements?: string[];
  display_order: number;
}

interface WorkExperienceFormProps {
  experience: WorkExperience | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({ experience, onCancel, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<WorkExperience>({
    company: '',
    position: '',
    description: '',
    start_date: '',
    end_date: '',
    is_current: false,
    location: '',
    company_url: '',
    company_logo_url: '',
    technologies: [],
    achievements: [],
    display_order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (experience) {
      setFormData({
        id: experience.id,
        company: experience.company || '',
        position: experience.position || '',
        description: experience.description || '',
        start_date: experience.start_date ? new Date(experience.start_date).toISOString().split('T')[0] : '',
        end_date: experience.end_date ? new Date(experience.end_date).toISOString().split('T')[0] : '',
        is_current: experience.is_current || false,
        location: experience.location || '',
        company_url: experience.company_url || '',
        company_logo_url: experience.company_logo_url || '',
        technologies: experience.technologies || [],
        achievements: experience.achievements || [],
        display_order: experience.display_order || 0,
      });
    }
  }, [experience]);

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

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));

    // If current job is checked, clear end date
    if (name === 'is_current' && checked) {
      setFormData((prev) => ({ ...prev, end_date: '' }));
    }
  };

  // Handle technologies tags
  const handleTechnologiesChange = (tags: string[]) => {
    setFormData((prev) => ({ ...prev, technologies: tags }));
  };

  // Handle achievements tags
  const handleAchievementsChange = (tags: string[]) => {
    setFormData((prev) => ({ ...prev, achievements: tags }));
  };

  // Handle file upload for company logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `company_logo_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `company_logos/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('experience')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('experience')
        .getPublicUrl(filePath);

      // Update form data with new logo URL
      setFormData((prev) => ({ ...prev, company_logo_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      setErrors((prev) => ({ ...prev, company_logo_url: 'Failed to upload logo' }));
    } finally {
      setIsUploading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.is_current && !formData.end_date) {
      newErrors.end_date = 'End date is required for past positions';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save work experience mutation
  const saveExperienceMutation = useMutation({
    mutationFn: async (data: WorkExperience) => {
      // Format dates for database
      const formattedData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      };

      if (data.id) {
        // Update existing experience
        const { error } = await supabase
          .from('work_experience')
          .update({
            company: formattedData.company,
            position: formattedData.position,
            description: formattedData.description,
            start_date: formattedData.start_date,
            end_date: formattedData.end_date,
            is_current: formattedData.is_current,
            location: formattedData.location,
            company_url: formattedData.company_url,
            company_logo_url: formattedData.company_logo_url,
            technologies: formattedData.technologies,
            achievements: formattedData.achievements,
            display_order: formattedData.display_order,
          })
          .eq('id', data.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new experience
        const { error } = await supabase
          .from('work_experience')
          .insert({
            company: formattedData.company,
            position: formattedData.position,
            description: formattedData.description,
            start_date: formattedData.start_date,
            end_date: formattedData.end_date,
            is_current: formattedData.is_current,
            location: formattedData.location,
            company_url: formattedData.company_url,
            company_logo_url: formattedData.company_logo_url,
            technologies: formattedData.technologies,
            achievements: formattedData.achievements,
            display_order: formattedData.display_order,
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
      await saveExperienceMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving work experience:', error);
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
          {experience ? 'Edit Work Experience' : 'Add Work Experience'}
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Company Name Field */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.company
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Acme Inc."
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company}</p>
              )}
            </div>

            {/* Position Field */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position/Title *
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.position
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Senior Frontend Developer"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.position}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Company URL Field */}
            <div>
              <label htmlFor="company_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Website
              </label>
              <input
                type="url"
                id="company_url"
                name="company_url"
                value={formData.company_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="https://example.com"
              />
            </div>

            {/* Location Field */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="e.g. New York, NY or Remote"
              />
            </div>
          </div>

          {/* Company Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              {formData.company_logo_url && (
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-md p-1 shadow-sm flex items-center justify-center">
                  <img
                    src={formData.company_logo_url}
                    alt={formData.company}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                  <span>{formData.company_logo_url ? 'Change Logo' : 'Upload Logo'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: Square image, at least 200x200px
                </p>
              </div>
              {isUploading && (
                <LoadingSpinner size="sm" text="" />
              )}
            </div>
            {errors.company_logo_url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.company_logo_url}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Employment Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Start Date Field */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.start_date
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.start_date}</p>
              )}
            </div>

            {/* End Date Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date {!formData.is_current && '*'}
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_current"
                    name="is_current"
                    checked={formData.is_current}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_current" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Current Position
                  </label>
                </div>
              </div>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date || ''}
                onChange={handleChange}
                disabled={formData.is_current}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.end_date
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${
                  formData.is_current ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Display Order Field */}
          <div className="mb-6">
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

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Job Details</h3>

          {/* Description Field */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.description
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              placeholder="Describe your role, responsibilities, and the company"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Technologies Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Technologies Used
            </label>
            <TagInput
              tags={formData.technologies || []}
              onChange={handleTechnologiesChange}
              placeholder="Add technologies and press Enter"
// @ts-ignore
              suggestions={['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'GraphQL', 'REST API']}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Add technologies, frameworks, or tools you used in this role
            </p>
          </div>

          {/* Achievements Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Achievements
            </label>
            <TagInput
              tags={formData.achievements || []}
              onChange={handleAchievementsChange}
              placeholder="Add achievements and press Enter"
// @ts-ignore
              multiline
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Add notable achievements, projects, or contributions from this role
            </p>
          </div>
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
            isLoading={saveExperienceMutation.isPending}
          >
            {experience ? 'Update Experience' : 'Add Experience'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default WorkExperienceForm;
