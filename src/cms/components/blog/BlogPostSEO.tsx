import React from 'react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  featured_image_url?: string;
}

interface BlogPostSEOProps {
  formData: BlogPost;
  onChange: (name: string, value: any) => void;
}

const BlogPostSEO: React.FC<BlogPostSEOProps> = ({
  formData,
  onChange,
}) => {
  // Generate preview URL
  const previewUrl = `https://yourdomain.com/blog/${formData.slug}`;
  
  // Calculate meta title length
  const metaTitleLength = (formData.meta_title || formData.title || '').length;
  const isTitleLengthOptimal = metaTitleLength >= 30 && metaTitleLength <= 60;
  
  // Calculate meta description length
  const metaDescriptionLength = (formData.meta_description || formData.summary || '').length;
  const isDescriptionLengthOptimal = metaDescriptionLength >= 120 && metaDescriptionLength <= 160;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          SEO Preview
        </h3>
        <div className="border border-gray-200 dark:border-gray-600 rounded p-4 bg-white dark:bg-gray-800">
          <div className="text-green-700 dark:text-green-500 text-sm mb-1 truncate">
            {previewUrl}
          </div>
          <div className="text-blue-800 dark:text-blue-400 text-lg font-medium mb-1 truncate">
            {formData.meta_title || formData.title || 'Post Title'}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            {formData.meta_description || formData.summary || 'No description provided. Add a meta description to improve SEO.'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Meta Title Field */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Title
            </label>
            <span className={`text-xs ${
              isTitleLengthOptimal 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {metaTitleLength}/60
            </span>
          </div>
          <input
            type="text"
            id="meta_title"
            value={formData.meta_title || ''}
            onChange={(e) => onChange('meta_title', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder={formData.title}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Recommended length: 30-60 characters. Leave empty to use post title.
          </p>
        </div>

        {/* Meta Description Field */}
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Meta Description
            </label>
            <span className={`text-xs ${
              isDescriptionLengthOptimal 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {metaDescriptionLength}/160
            </span>
          </div>
          <textarea
            id="meta_description"
            value={formData.meta_description || ''}
            onChange={(e) => onChange('meta_description', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder={formData.summary || 'Brief description of the post for search engines'}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Recommended length: 120-160 characters. Leave empty to use post summary.
          </p>
        </div>

        {/* Meta Keywords Field */}
        <div>
          <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Meta Keywords
          </label>
          <input
            type="text"
            id="meta_keywords"
            value={formData.meta_keywords || ''}
            onChange={(e) => onChange('meta_keywords', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Comma-separated keywords. Note: Meta keywords have minimal impact on SEO nowadays.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">SEO Tips</h3>
        <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>Use your target keyword in the title, preferably near the beginning</li>
          <li>Include your target keyword in the meta description</li>
          <li>Make sure your meta description accurately summarizes the content</li>
          <li>Use a unique meta title and description for each post</li>
          <li>Include your brand name in the meta title when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default BlogPostSEO;
