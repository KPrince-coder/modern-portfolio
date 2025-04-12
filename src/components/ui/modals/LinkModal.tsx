import React, { useState } from 'react';
import SimpleModal from '../SimpleModal';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string, text: string) => void;
  initialText?: string;
  initialUrl?: string;
}

const LinkModal: React.FC<LinkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialText = '',
  initialUrl = 'https://',
}) => {
  const [linkText, setLinkText] = useState(initialText);
  const [linkUrl, setLinkUrl] = useState(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState(true);

  // Validate URL format
  const validateUrl = (url: string) => {
    if (!url || url === 'https://') return true;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkUrl(url);
    setIsValidUrl(validateUrl(url));
  };

  const handleConfirm = () => {
    if (validateUrl(linkUrl)) {
      onConfirm(linkUrl, linkText);
      onClose();
    }
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Insert Link"
      primaryAction={{
        label: "Insert",
        onClick: handleConfirm,
        variant: "primary",
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
      }}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="link-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link Text
          </label>
          <input
            type="text"
            id="link-text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="Text to display"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="link-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL
          </label>
          <input
            type="text"
            id="link-url"
            value={linkUrl}
            onChange={handleUrlChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              isValidUrl
                ? 'border-gray-300 dark:border-gray-600'
                : 'border-red-500 dark:border-red-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
            placeholder="https://example.com"
          />
          {!isValidUrl && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Please enter a valid URL
            </p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Tip: You can link to external websites, internal pages, or email addresses (e.g., mailto:example@example.com)
          </p>
        </div>
      </div>
    </SimpleModal>
  );
};

export default LinkModal;
