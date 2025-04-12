import React, { useState } from 'react';
import SimpleModal from '../SimpleModal';

interface HtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (html: string) => void;
  initialHtml?: string;
}

const HtmlModal: React.FC<HtmlModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialHtml = '<div class="custom-element">\n  Your content here\n</div>',
}) => {
  const [html, setHtml] = useState(initialHtml);
  const [previewMode, setPreviewMode] = useState(false);

  const handleConfirm = () => {
    onConfirm(html);
    onClose();
  };

  // Common HTML snippets
  const snippets = [
    {
      name: 'Custom Div',
      code: '<div class="custom-element">\n  Your content here\n</div>',
    },
    {
      name: 'Alert Box',
      code: '<div class="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">\n  <p class="font-bold">Warning</p>\n  <p>Important information goes here.</p>\n</div>',
    },
    {
      name: 'Code Block',
      code: '<pre class="bg-gray-100 p-4 rounded overflow-x-auto">\n  <code>\n    function example() {\n      console.log("Hello world");\n    }\n  </code>\n</pre>',
    },
    {
      name: 'Two Columns',
      code: '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">\n  <div>\n    Left column content\n  </div>\n  <div>\n    Right column content\n  </div>\n</div>',
    },
  ];

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Insert HTML"
      primaryAction={{
        label: "Insert",
        onClick: handleConfirm,
        variant: "primary",
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
      }}
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded ${!previewMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded ${previewMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Preview
          </button>
        </div>

        {!previewMode ? (
          <div>
            <label htmlFor="html-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              HTML Code
            </label>
            <textarea
              id="html-code"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono text-sm"
              placeholder="<div>Your HTML here</div>"
              autoFocus
            />
          </div>
        ) : (
          <div>
            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Preview
            </p>
            <div
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 min-h-[200px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}

        <div>
          <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Common Snippets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {snippets.map((snippet, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setHtml(snippet.code)}
                className="text-left px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {snippet.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            HTML will be sanitized for security. Some attributes and tags may be removed.
          </p>
        </div>
      </div>
    </SimpleModal>
  );
};

export default HtmlModal;
