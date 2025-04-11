import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import Button from '../../../components/ui/Button';

// Types
interface Project {
  id?: string;
  title: string;
  slug: string;
  description: string;
  summary?: string;
  thumbnail_url?: string;
  category_id?: string;
  technologies: string[];
  display_order: number;
}

interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ProjectBasicInfoProps {
  formData: Project;
  errors: Record<string, string>;
  categories: ProjectCategory[];
  onTitleChange: (title: string) => void;
  onChange: (name: string, value: any) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
}

const ProjectBasicInfo: React.FC<ProjectBasicInfoProps> = ({
  formData,
  errors,
  categories,
  onTitleChange,
  onChange,
  isUploading,
  setIsUploading,
}) => {
  const [techInput, setTechInput] = useState('');

  // Handle file upload for thumbnail image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `project_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `project_images/${fileName}`;
      
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
      
      // Update form data with new image URL
      onChange('thumbnail_url', publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle adding a technology
  const handleAddTechnology = () => {
    if (!techInput.trim()) return;
    
    const newTech = techInput.trim();
    if (!formData.technologies.includes(newTech)) {
      onChange('technologies', [...formData.technologies, newTech]);
    }
    setTechInput('');
  };

  // Handle removing a technology
  const handleRemoveTechnology = (tech: string) => {
    onChange('technologies', formData.technologies.filter(t => t !== tech));
  };

  // Handle technology input keydown (add on Enter)
  const handleTechInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTechnology();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title Field */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.title 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
            placeholder="Enter project title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
          )}
        </div>

        {/* Slug Field */}
        <div className="md:col-span-2">
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Slug *
          </label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
              /projects/
            </span>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => onChange('slug', e.target.value)}
              className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border ${
                errors.slug 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              placeholder="project-slug"
            />
          </div>
          {errors.slug ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The URL-friendly name for your project
            </p>
          )}
        </div>

        {/* Category Field */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category_id"
            value={formData.category_id || ''}
            onChange={(e) => onChange('category_id', e.target.value)}
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

        {/* Display Order Field */}
        <div>
          <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Display Order
          </label>
          <input
            type="number"
            id="display_order"
            value={formData.display_order}
            onChange={(e) => onChange('display_order', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Lower numbers will be displayed first
          </p>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          className={`w-full px-4 py-2 rounded-lg border ${
            errors.description 
              ? 'border-red-500 dark:border-red-500' 
              : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
          placeholder="Brief description of the project"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        )}
      </div>

      {/* Summary Field */}
      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Summary
        </label>
        <textarea
          id="summary"
          value={formData.summary || ''}
          onChange={(e) => onChange('summary', e.target.value)}
          rows={2}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          placeholder="One-line summary for listings (optional)"
        />
      </div>

      {/* Technologies Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Technologies
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleTechInputKeyDown}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="Add a technology (e.g. React, Node.js)"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTechnology}
            disabled={!techInput.trim()}
          >
            Add
          </Button>
        </div>
        
        {formData.technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {formData.technologies.map((tech, index) => (
              <div 
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => handleRemoveTechnology(tech)}
                  className="ml-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Image Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Thumbnail Image
        </label>
        <div className="flex items-center space-x-4">
          {formData.thumbnail_url && (
            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
              <img 
                src={formData.thumbnail_url} 
                alt="Thumbnail" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
              <span>{formData.thumbnail_url ? 'Change Image' : 'Upload Image'}</span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recommended: 800 x 600 pixels for optimal display
            </p>
          </div>
          {isUploading && (
            <LoadingSpinner size="sm" text="" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBasicInfo;
