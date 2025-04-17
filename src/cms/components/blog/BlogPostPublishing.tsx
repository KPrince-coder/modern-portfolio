import React from 'react';
import { format } from 'date-fns';

interface BlogPost {
  id?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  is_featured: boolean;
  ai_generated: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface BlogPostPublishingProps {
  formData: BlogPost;
  tags: BlogTag[];
  selectedTags: string[];
  onChange: (name: string, value: any) => void;
  onTagChange: (tagId: string, checked: boolean) => void;
}

const BlogPostPublishing: React.FC<BlogPostPublishingProps> = ({
  formData,
  tags,
  selectedTags,
  onChange,
  onTagChange,
}) => {
  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Field */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Draft: Only visible to you. Published: Visible to everyone. Archived: Hidden from the blog.
          </p>
        </div>

        {/* Published Date Field */}
        <div>
          <label htmlFor="published_at" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Published Date
          </label>
          <input
            type="datetime-local"
            id="published_at"
            value={formatDate(formData.published_at)}
            onChange={(e) => onChange('published_at', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            disabled={formData.status !== 'published'}
            className={`w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${
              formData.status !== 'published' ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.status === 'published'
              ? 'Leave empty to use current date and time'
              : 'Only available when status is set to Published'}
          </p>
        </div>
      </div>

      {/* Featured Post Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_featured"
          checked={formData.is_featured}
          onChange={(e) => onChange('is_featured', e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900 dark:text-white">
          Feature this post on homepage
        </label>
      </div>

      {/* AI Generated Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="ai_generated"
          checked={formData.ai_generated}
          onChange={(e) => onChange('ai_generated', e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="ai_generated" className="ml-2 block text-sm text-gray-900 dark:text-white">
          This post was generated with AI assistance
        </label>
      </div>

      {/* Tags Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto">
          {tags.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => onTagChange(tag.id, e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`tag-${tag.id}`} className="ml-2 block text-sm text-gray-900 dark:text-white">
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No tags available. Create tags in the Tags section.
            </p>
          )}
        </div>
      </div>

      {/* Publishing Info */}
      {formData.id && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Publishing Information
          </h3>
// @ts-ignore
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
// @ts-ignore
            <div>
              <p><strong>Created:</strong> {formData.created_at ? format(new Date(formData.created_at as string), 'MMM d, yyyy h:mm a') : 'Not created yet'}</p>
              <p><strong>Last Updated:</strong> {formData.updated_at ? format(new Date(formData.updated_at as string), 'MMM d, yyyy h:mm a') : 'Not updated yet'}</p>
            </div>
            <div>
              <p><strong>Status:</strong> {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</p>
              <p><strong>Published:</strong> {formData.published_at ? format(new Date(formData.published_at), 'MMM d, yyyy h:mm a') : 'Not published yet'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostPublishing;
