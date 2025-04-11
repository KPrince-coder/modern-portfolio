import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Tab } from '@headlessui/react';

interface ProjectContentProps {
  content: string;
  error?: string;
  onChange: (content: string) => void;
}

const ProjectContent: React.FC<ProjectContentProps> = ({
  content,
  error,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-4">
      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Write
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Preview
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content *
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Markdown supported
                </div>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                rows={20}
                className={`w-full px-4 py-2 rounded-lg border ${
                  error 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono`}
                placeholder="Write your project content here..."
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          </Tab.Panel>
          <Tab.Panel>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 min-h-[500px] prose dark:prose-invert max-w-none">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  No content to preview
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content Tips
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Use this section to provide detailed information about your project. Consider including:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-2">
          <li>Project overview and goals</li>
          <li>Your role and responsibilities</li>
          <li>Technical challenges and solutions</li>
          <li>Key features and functionality</li>
          <li>Technologies and tools used</li>
          <li>Lessons learned and outcomes</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectContent;
