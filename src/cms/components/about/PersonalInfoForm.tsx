import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface PersonalData {
  id?: string;
  name: string;
  title: string;
  bio: string;
  profile_image_url?: string;
  resume_url?: string;
  email: string;
  phone?: string;
  location?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  seo_slug?: string;
  structured_data?: any;
  published: boolean;
}

interface PersonalInfoFormProps {
  personalData?: PersonalData;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ personalData }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<PersonalData>({
    name: '',
    title: '',
    bio: '',
    profile_image_url: '',
    resume_url: '',
    email: '',
    phone: '',
    location: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    seo_slug: '',
    published: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing data
  useEffect(() => {
    if (personalData) {
      setFormData({
        id: personalData.id,
        name: personalData.name || '',
        title: personalData.title || '',
        bio: personalData.bio || '',
        profile_image_url: personalData.profile_image_url || '',
        resume_url: personalData.resume_url || '',
        email: personalData.email || '',
        phone: personalData.phone || '',
        location: personalData.location || '',
        meta_title: personalData.meta_title || '',
        meta_description: personalData.meta_description || '',
        meta_keywords: personalData.meta_keywords || '',
        seo_slug: personalData.seo_slug || '',
        structured_data: personalData.structured_data || {},
        published: personalData.published || false,
      });
    }
  }, [personalData]);

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

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle file upload for profile image
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `profile_images/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
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
      setFormData((prev) => ({ ...prev, profile_image_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors((prev) => ({ ...prev, profile_image_url: 'Failed to upload image' }));
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file upload for resume
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `resume_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);
      
      // Update form data with new resume URL
      setFormData((prev) => ({ ...prev, resume_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading resume:', error);
      setErrors((prev) => ({ ...prev, resume_url: 'Failed to upload resume' }));
    } finally {
      setIsUploading(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save personal data mutation
  const savePersonalDataMutation = useMutation({
    mutationFn: async (data: PersonalData) => {
      // If we have an ID, update the existing record
      if (data.id) {
        const { error } = await supabase
          .from('portfolio.personal_data')
          .update({
            name: data.name,
            title: data.title,
            bio: data.bio,
            profile_image_url: data.profile_image_url,
            resume_url: data.resume_url,
            email: data.email,
            phone: data.phone,
            location: data.location,
            meta_title: data.meta_title,
            meta_description: data.meta_description,
            meta_keywords: data.meta_keywords,
            seo_slug: data.seo_slug,
            structured_data: data.structured_data,
            published: data.published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Otherwise, insert a new record
        const { error } = await supabase
          .from('portfolio.personal_data')
          .insert({
            name: data.name,
            title: data.title,
            bio: data.bio,
            profile_image_url: data.profile_image_url,
            resume_url: data.resume_url,
            email: data.email,
            phone: data.phone,
            location: data.location,
            meta_title: data.meta_title,
            meta_description: data.meta_description,
            meta_keywords: data.meta_keywords,
            seo_slug: data.seo_slug,
            structured_data: data.structured_data,
            published: data.published,
          });

        if (error) {
          throw new Error(error.message);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalData'] });
    },
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await savePersonalDataMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error saving personal data:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
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
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title/Position *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.title 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="e.g. Frontend Developer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
              )}
            </div>
          </div>
          
          {/* Bio Field */}
          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bio *
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.bio 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
              placeholder="Write a short bio about yourself"
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio}</p>
            )}
          </div>
          
          {/* Profile Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              {formData.profile_image_url && (
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                  <img 
                    src={formData.profile_image_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                  <span>{formData.profile_image_url ? 'Change Image' : 'Upload Image'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Recommended: Square image, at least 500x500px
                </p>
              </div>
              {isUploading && (
                <LoadingSpinner size="sm" text="" />
              )}
            </div>
            {errors.profile_image_url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.profile_image_url}</p>
            )}
          </div>
          
          {/* Resume Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resume/CV
            </label>
            <div className="flex items-center space-x-4">
              {formData.resume_url && (
                <a 
                  href={formData.resume_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline"
                >
                  View Current Resume
                </a>
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                  <span>{formData.resume_url ? 'Change Resume' : 'Upload Resume'}</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={isUploading}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>
              {isUploading && (
                <LoadingSpinner size="sm" text="" />
              )}
            </div>
            {errors.resume_url && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.resume_url}</p>
            )}
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.email 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            
            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="+1 (123) 456-7890"
              />
            </div>
          </div>
          
          {/* Location Field */}
          <div className="mb-6">
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
              placeholder="City, Country"
            />
          </div>
        </div>
        
        {/* SEO Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">SEO Settings</h3>
          
          <div className="mb-6">
            <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              id="meta_title"
              name="meta_title"
              value={formData.meta_title || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="About [Your Name] - [Your Title]"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recommended length: 50-60 characters
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Description
            </label>
            <textarea
              id="meta_description"
              name="meta_description"
              value={formData.meta_description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="A brief description of your professional background and expertise"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recommended length: 150-160 characters
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Keywords
            </label>
            <input
              type="text"
              id="meta_keywords"
              name="meta_keywords"
              value={formData.meta_keywords || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="developer, designer, react, javascript"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Comma-separated list of keywords
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="seo_slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SEO Slug
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 sm:text-sm">
                /about/
              </span>
              <input
                type="text"
                id="seo_slug"
                name="seo_slug"
                value={formData.seo_slug || ''}
                onChange={handleChange}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="me"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              URL-friendly version of the page name (no spaces, special characters, or capital letters)
            </p>
          </div>
        </div>
        
        {/* Publishing Section */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Publishing</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              name="published"
              checked={formData.published}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900 dark:text-white">
              Publish this information
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            When checked, this information will be visible on your website
          </p>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              // Reset form to initial data
              if (personalData) {
                setFormData({
                  id: personalData.id,
                  name: personalData.name || '',
                  title: personalData.title || '',
                  bio: personalData.bio || '',
                  profile_image_url: personalData.profile_image_url || '',
                  resume_url: personalData.resume_url || '',
                  email: personalData.email || '',
                  phone: personalData.phone || '',
                  location: personalData.location || '',
                  meta_title: personalData.meta_title || '',
                  meta_description: personalData.meta_description || '',
                  meta_keywords: personalData.meta_keywords || '',
                  seo_slug: personalData.seo_slug || '',
                  structured_data: personalData.structured_data || {},
                  published: personalData.published || false,
                });
              } else {
                setFormData({
                  name: '',
                  title: '',
                  bio: '',
                  profile_image_url: '',
                  resume_url: '',
                  email: '',
                  phone: '',
                  location: '',
                  meta_title: '',
                  meta_description: '',
                  meta_keywords: '',
                  seo_slug: '',
                  published: false,
                });
              }
              setErrors({});
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={savePersonalDataMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default PersonalInfoForm;
