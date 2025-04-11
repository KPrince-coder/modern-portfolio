import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import TagInput from '../common/TagInput';

// Types
interface Education {
  id?: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  location?: string;
  description?: string;
  institution_url?: string;
  institution_logo_url?: string;
  achievements?: string[];
  display_order: number;
}

interface EducationFormProps {
  education: Education | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ education, onCancel, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Education>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    location: '',
    description: '',
    institution_url: '',
    institution_logo_url: '',
    achievements: [],
    display_order: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (education) {
      setFormData({
        id: education.id,
        institution: education.institution || '',
        degree: education.degree || '',
        field_of_study: education.field_of_study || '',
        start_date: education.start_date ? new Date(education.start_date).toISOString().split('T')[0] : '',
        end_date: education.end_date ? new Date(education.end_date).toISOString().split('T')[0] : '',
        is_current: education.is_current || false,
        location: education.location || '',
        description: education.description || '',
        institution_url: education.institution_url || '',
        institution_logo_url: education.institution_logo_url || '',
        achievements: education.achievements || [],
        display_order: education.display_order || 0,
      });
    }
  }, [education]);

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
    
    // If current education is checked, clear end date
    if (name === 'is_current' && checked) {
      setFormData((prev) => ({ ...prev, end_date: '' }));
    }
  };

  // Handle achievements tags
  const handleAchievementsChange = (tags: string[]) => {
    setFormData((prev) => ({ ...prev, achievements: tags }));
  };

  // Handle file upload for institution logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `institution_logo_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `institution_logos/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);
      
      // Update form data with new logo URL
      setFormData((prev) => ({ ...prev, institution_logo_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading logo:', error);
      setErrors((prev) => ({ ...prev, institution_logo_url: 'Failed to upload logo' }));
    } finally {
      setIsUploading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }
    
    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }
    
    if (!formData.field_of_study.trim()) {
      newErrors.field_of_study = 'Field of study is required';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.is_current && !formData.end_date) {
      newErrors.end_date = 'End date is required for completed education';
    }
    
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save education mutation
  const saveEducationMutation = useMutation({
    mutationFn: async (data: Education) => {
      // Format dates for database
      const formattedData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      };
      
      if (data.id) {
        // Update existing education
        const { error } = await supabase
          .from('education')
          .update({
            institution: formattedData.institution,
            degree: formattedData.degree,
            field_of_study: formattedData.field_of_study,
            start_date: formattedData.start_date,
            end_date: formattedData.end_date,
            is_current: formattedData.is_current,
            location: formattedData.location,
            description: formattedData.description,
            institution_url: formattedData.institution_url,
            institution_logo_url: formattedData.institution_logo_url,
            achievements: formattedData.achievements,
            display_order: formattedData.display_order,
          })
          .eq('id', data.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new education
        const { error } = await supabase
          .from('education')
          .insert({
            institution: formattedData.institution,
            degree: formattedData.degree,
            field_of_study: formattedData.field_of_study,
            start_date: formattedData.start_date,
            end_date: formattedData.end_date,
            is_current: formattedData.is_current,
            location: formattedData.location,
            description: formattedData.description,
            institution_url: formattedData.institution_url,
            institution_logo_url: formattedData.institution_logo_url,
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
      await saveEducationMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving education:', error);
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
          {education ? 'Edit Education' : 'Add Education'}
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Institution Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Institution Name Field */}
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.institution 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Stanford University"
              />
              {errors.institution && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.institution}</p>
              )}
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
                placeholder="e.g. Stanford, CA"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Institution URL Field */}
            <div>
              <label htmlFor="institution_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Institution Website
              </label>
              <input
                type="url"
                id="institution_url"
                name="institution_url"
                value={formData.institution_url || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="https://example.edu"
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
          
          {/* Institution Logo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Institution Logo
            </label>
            <div className="flex items-center space-x-4">
              {formData.institution_logo_url && (
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-md p-1 shadow-sm flex items-center justify-center">
                  <img 
                    src={formData.institution_logo_url} 
                    alt={formData.institution} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                  <span>{formData.institution_logo_url ? 'Change Logo' : 'Upload Logo'}</span>
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
            {errors.institution_logo_url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.institution_logo_url}</p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Degree Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Degree Field */}
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Degree *
              </label>
              <input
                type="text"
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.degree 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Bachelor of Science"
              />
              {errors.degree && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.degree}</p>
              )}
            </div>
            
            {/* Field of Study Field */}
            <div>
              <label htmlFor="field_of_study" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field of Study *
              </label>
              <input
                type="text"
                id="field_of_study"
                name="field_of_study"
                value={formData.field_of_study}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.field_of_study 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Computer Science"
              />
              {errors.field_of_study && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.field_of_study}</p>
              )}
            </div>
          </div>
          
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
                    Currently Studying
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
          
          {/* Description Field */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="Describe your studies, focus areas, or thesis"
            />
          </div>
          
          {/* Achievements Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Achievements
            </label>
            <TagInput
              tags={formData.achievements || []}
              onChange={handleAchievementsChange}
              placeholder="Add achievements and press Enter"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Add notable achievements, awards, or honors from this education
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
            isLoading={saveEducationMutation.isPending}
          >
            {education ? 'Update Education' : 'Add Education'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default EducationForm;
