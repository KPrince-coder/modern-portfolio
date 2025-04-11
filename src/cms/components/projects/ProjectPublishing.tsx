import React from 'react';

interface Project {
  id?: string;
  status: 'draft' | 'published' | 'archived';
  published_at?: string;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProjectPublishingProps {
  formData: Project;
  onChange: (name: string, value: any) => void;
}

const ProjectPublishing: React.FC<ProjectPublishingProps> = ({
  formData,
  onChange,
}) => {
  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  // Format date for display in info section
  const formatDisplayDate = (dateString?: string): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
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
            Draft: Only visible to you. Published: Visible to everyone. Archived: Hidden from the portfolio.
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

      {/* Featured Project Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_featured"
          checked={formData.is_featured}
          onChange={(e) => onChange('is_featured', e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900 dark:text-white">
          Feature this project on homepage
        </label>
      </div>

      {/* Publishing Info */}
      {formData.id && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Publishing Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <p><strong>Created:</strong> {formData.created_at ? formatDisplayDate(formData.created_at) : 'Not created yet'}</p>
              <p><strong>Last Updated:</strong> {formData.updated_at ? formatDisplayDate(formData.updated_at) : 'Not updated yet'}</p>
            </div>
            <div>
              <p><strong>Status:</strong> {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</p>
              <p><strong>Published:</strong> {formData.published_at ? formatDisplayDate(formData.published_at) : 'Not published yet'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Publishing Tips</h3>
        <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>Use <strong>Draft</strong> status while working on the project details</li>
          <li>Set to <strong>Published</strong> when the project is ready to be displayed on your portfolio</li>
          <li>Use <strong>Archived</strong> for older projects you want to keep but not display prominently</li>
          <li>Featured projects will appear in the featured section on your homepage</li>
          <li>You can backdate projects by setting a custom published date</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectPublishing;
