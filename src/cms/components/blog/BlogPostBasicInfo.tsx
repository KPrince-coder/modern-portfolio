import React from 'react';
import { supabase } from '../../../lib/supabase';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Types
interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
  reading_time_minutes?: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  ai_generated: boolean;
}

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

interface BlogPostBasicInfoProps {
  formData: BlogPost;
  errors: Record<string, string>;
  categories: BlogCategory[];
  onTitleChange: (title: string) => void;
  onChange: (name: string, value: any) => void;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
}

const BlogPostBasicInfo: React.FC<BlogPostBasicInfoProps> = ({
  formData,
  errors,
  categories,
  onTitleChange,
  onChange,
  isUploading,
  setIsUploading,
}) => {
  // Handle file upload for featured image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `blog_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `blog_images/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('blog')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog')
        .getPublicUrl(filePath);

      // Update form data with new image URL
      onChange('featured_image_url', publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
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
            placeholder="Enter post title"
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
              /blog/
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
              placeholder="post-slug"
            />
          </div>
          {errors.slug ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.slug}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The URL-friendly name for your post
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

        {/* Reading Time Field */}
        <div>
          <label htmlFor="reading_time_minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reading Time (minutes)
          </label>
          <input
            type="number"
            id="reading_time_minutes"
            value={formData.reading_time_minutes || ''}
            onChange={(e) => onChange('reading_time_minutes', e.target.value ? Number(e.target.value) : undefined)}
            min="1"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="Auto-calculated from content"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Leave empty to auto-calculate based on content
          </p>
        </div>
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
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          placeholder="Brief summary of the post (optional)"
        />
      </div>

      {/* Featured Image Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Featured Image
        </label>
        <div className="flex items-center space-x-4">
          {formData.featured_image_url && (
            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
              <img
                src={formData.featured_image_url}
                alt="Featured"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
              <span>{formData.featured_image_url ? 'Change Image' : 'Upload Image'}</span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recommended: 1200 x 630 pixels for optimal social sharing
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

export default BlogPostBasicInfo;
