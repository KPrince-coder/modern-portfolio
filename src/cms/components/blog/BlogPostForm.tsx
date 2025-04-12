import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import AutosaveNotification from '../../../components/ui/AutosaveNotification';
import BlogPostBasicInfo from './BlogPostBasicInfo';
import BlogPostContent from './BlogPostContent';
import BlogPostSEO from './BlogPostSEO';
import BlogPostPublishing from './BlogPostPublishing';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  setupAutosave,
  formatTimestamp
} from '../../../utils/autosave';

// Types
interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  featured_image_url?: string;
  category_id?: string;
  category?: { id: string; name: string } | null;
  tags?: { id: string; name: string; slug: string }[];
  reading_time_minutes?: number;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  ai_generated: boolean;
  created_at?: string;
  updated_at?: string;
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

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface BlogPostFormProps {
  post?: BlogPost & {
    category?: { id: string; name: string } | null;
    tags?: { id: string; name: string; slug: string }[];
  } | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  isLoading: boolean;
  onCancel: () => void;
}

type FormTab = 'basic' | 'content' | 'seo' | 'publishing';

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  post,
  categories,
  tags,
  isLoading,
  onCancel,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    slug: '',
    summary: '',
    content: '',
    featured_image_url: '',
    category_id: '',
    reading_time_minutes: 0,
    is_featured: false,
    status: 'draft',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    ai_generated: false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Autosave states
  const [showRecoveryNotification, setShowRecoveryNotification] = useState(false);
  const [autosaveTimestamp, setAutosaveTimestamp] = useState<string | null>(null);
  const autosaveIntervalRef = useRef<number | null>(null);
  const formInitializedRef = useRef(false);

  // Generate a unique key for this form session
  const getFormKey = useCallback((): string => {
    return post?.id ? `blog_post_${post.id}` : 'blog_post_new';
  }, [post]);

  // Check for saved data on initial load
  useEffect(() => {
    const formKey = getFormKey();
    const savedData = loadFromLocalStorage<{
      formData: BlogPost;
      selectedTags: string[];
    }>(formKey);

    // If we have saved data and we're not already editing a post (or it's the same post)
    if (savedData && (!post || (post && post.id === savedData.data.formData.id))) {
      setShowRecoveryNotification(true);
      setAutosaveTimestamp(formatTimestamp(savedData.timestamp));
    }

    // Mark form as initialized
    formInitializedRef.current = true;
  }, [post, getFormKey]);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (post) {
      setFormData({
        id: post.id,
        title: post.title || '',
        slug: post.slug || '',
        summary: post.summary || '',
        content: post.content || '',
        featured_image_url: post.featured_image_url || '',
        category_id: post.category_id || '',
        reading_time_minutes: post.reading_time_minutes || 0,
        is_featured: post.is_featured || false,
        status: post.status || 'draft',
        published_at: post.published_at,
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '',
        ai_generated: post.ai_generated || false,
        created_at: post.created_at,
        updated_at: post.updated_at,
      });

      if (post.tags && post.tags.length > 0) {
        setSelectedTags(post.tags.map(tag => tag.id));
      }
    }
  }, [post]);

  // Setup autosave
  useEffect(() => {
    if (!formInitializedRef.current) return;

    const formKey = getFormKey();

    // Setup autosave interval
    const intervalId = window.setInterval(() => {
      saveToLocalStorage(formKey, {
        formData,
        selectedTags,
      });
    }, 5000); // Save every 5 seconds

    // Store interval ID for cleanup
    autosaveIntervalRef.current = intervalId;

    // Cleanup function
    return () => {
      if (autosaveIntervalRef.current) {
        window.clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [formData, selectedTags, getFormKey]);

  // Save blog post mutation
  const savePostMutation = useMutation({
    mutationFn: async (data: { post: BlogPost; tags: string[] }) => {
      const { post, tags } = data;

      // Format the post data
      const postData = {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        featured_image_url: post.featured_image_url,
        category_id: post.category_id || null,
        reading_time_minutes: post.reading_time_minutes || null,
        is_featured: post.is_featured,
        status: post.status,
        published_at: post.status === 'published' ? (post.published_at || new Date().toISOString()) : null,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        meta_keywords: post.meta_keywords,
        ai_generated: post.ai_generated,
      };

      let postId = post.id;

      if (postId) {
        // Update existing post
        const { error } = await supabase
          .from('blog_posts')
          .update({
            ...postData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', postId);

        if (error) {
          throw new Error(error.message);
        }
      } else {
        // Create new post
        const { data: newPost, error } = await supabase
          .from('blog_posts')
          .insert({
            ...postData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (error) {
          throw new Error(error.message);
        }

        postId = newPost.id;
      }

      // Handle tags
      if (postId) {
        // First, remove all existing tag associations
        const { error: deleteError } = await supabase
          .from('blog_post_tags')
          .delete()
          .eq('post_id', postId);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        // Then, add the new tag associations
        if (tags.length > 0) {
          const tagAssociations = tags.map(tagId => ({
            post_id: postId,
            tag_id: tagId,
          }));

          const { error: insertError } = await supabase
            .from('blog_post_tags')
            .insert(tagAssociations);

          if (insertError) {
            throw new Error(insertError.message);
          }
        }
      }

      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogPost', postId] });
      navigate('/admin/blog');
    },
  });

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .trim();
  };

  // Handle title change and auto-generate slug if empty
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Only auto-generate slug if it's empty or matches the previous auto-generated slug
      slug: !prev.slug || prev.slug === generateSlug(prev.title) ? generateSlug(title) : prev.slug,
    }));

    // Clear error when field is edited
    if (errors.title) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.title;
        return newErrors;
      });
    }
  };

  // Handle form input changes
  const handleChange = (name: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle tag selection
  const handleTagChange = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags(prev => [...prev, tagId]);
    } else {
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    }
  };

  // Calculate reading time based on content
  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Auto-generate slug if empty
    if (!formData.slug.trim()) {
      if (formData.title.trim()) {
        // If title exists but slug is empty, generate it automatically
        const generatedSlug = generateSlug(formData.title);
        setFormData(prev => ({ ...prev, slug: generatedSlug }));
      } else {
        newErrors.slug = 'Slug is required';
      }
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle restoring saved data
  const handleRestoreSavedData = () => {
    const formKey = getFormKey();
    const savedData = loadFromLocalStorage<{
      formData: BlogPost;
      selectedTags: string[];
    }>(formKey);

    if (savedData) {
      setFormData(savedData.data.formData);
      setSelectedTags(savedData.data.selectedTags);
      setShowRecoveryNotification(false);
    }
  };

  // Handle discarding saved data
  const handleDiscardSavedData = () => {
    const formKey = getFormKey();
    clearLocalStorage(formKey);
    setShowRecoveryNotification(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Update reading time based on content
    const updatedFormData = {
      ...formData,
      reading_time_minutes: calculateReadingTime(formData.content),
    };

    try {
      await savePostMutation.mutateAsync({
        post: updatedFormData,
        tags: selectedTags,
      });

      // Clear autosaved data after successful submission
      const formKey = getFormKey();
      clearLocalStorage(formKey);
    } catch (error) {
      console.error('Error saving blog post:', error);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Clear autosaved data when canceling
    const formKey = getFormKey();
    clearLocalStorage(formKey);
    onCancel();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          {post ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h2>
        <Button
          variant="secondary"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'basic'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'content'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Content
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'seo'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            SEO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('publishing')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'publishing'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Publishing
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {activeTab === 'basic' && (
            <BlogPostBasicInfo
              formData={formData}
              errors={errors}
              categories={categories}
              onTitleChange={handleTitleChange}
              onChange={handleChange}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          )}

          {activeTab === 'content' && (
            <BlogPostContent
              content={formData.content}
              error={errors.content}
              onChange={(content) => handleChange('content', content)}
            />
          )}

          {activeTab === 'seo' && (
            <BlogPostSEO
              formData={formData}
              onChange={handleChange}
            />
          )}

          {activeTab === 'publishing' && (
            <BlogPostPublishing
              formData={formData}
              tags={tags}
              selectedTags={selectedTags}
              onChange={handleChange}
              onTagChange={handleTagChange}
            />
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={savePostMutation.isPending}
          >
            {post ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </form>

      {/* Autosave notification */}
      <AutosaveNotification
        isVisible={showRecoveryNotification}
        timestamp={autosaveTimestamp}
        onRestore={handleRestoreSavedData}
        onDiscard={handleDiscardSavedData}
      />
    </motion.div>
  );
};

export default BlogPostForm;
