import React from 'react';

// Types
interface Project {
  demo_url?: string;
  code_url?: string;
  case_study_url?: string;
}

interface ProjectLinksProps {
  formData: Project;
  onChange: (name: string, value: any) => void;
}

const ProjectLinks: React.FC<ProjectLinksProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Project Links
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add links to your project's live demo, source code, or case study. These links will be displayed on your project page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Demo URL Field */}
        <div>
          <label htmlFor="demo_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Live Demo URL
          </label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </span>
            <input
              type="url"
              id="demo_url"
              value={formData.demo_url || ''}
              onChange={(e) => onChange('demo_url', e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="https://example.com"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            URL to the live version of your project
          </p>
        </div>

        {/* Code URL Field */}
        <div>
          <label htmlFor="code_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source Code URL
          </label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </span>
            <input
              type="url"
              id="code_url"
              value={formData.code_url || ''}
              onChange={(e) => onChange('code_url', e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="https://github.com/username/repo"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            URL to the project's source code repository
          </p>
        </div>

        {/* Case Study URL Field */}
        <div className="md:col-span-2">
          <label htmlFor="case_study_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Case Study URL
          </label>
          <div className="flex items-center">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <input
              type="url"
              id="case_study_url"
              value={formData.case_study_url || ''}
              onChange={(e) => onChange('case_study_url', e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              placeholder="https://example.com/case-study"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            URL to a detailed case study or blog post about this project
          </p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Link Tips</h3>
        <ul className="list-disc list-inside text-xs text-blue-700 dark:text-blue-400 space-y-1">
          <li>Make sure all links are working and accessible</li>
          <li>For GitHub repositories, consider making them public if possible</li>
          <li>Include a README.md file in your repository with project details</li>
          <li>If your project is not deployed, consider using services like Netlify, Vercel, or GitHub Pages</li>
          <li>For case studies, you can link to a blog post or a dedicated page on your portfolio</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectLinks;
