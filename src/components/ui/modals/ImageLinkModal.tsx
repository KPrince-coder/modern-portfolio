import React, { useState } from 'react';
import BasicModal from '../BasicModal';

interface ImageLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (imageUrl: string, altText: string) => void;
  initialAltText?: string;
  initialUrl?: string;
}

const ImageLinkModal: React.FC<ImageLinkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialAltText = '',
  initialUrl = 'https://',
}) => {
  const [altText, setAltText] = useState(initialAltText);
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Validate URL format
  const validateUrl = (url: string) => {
    if (!url || url === 'https://') return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    setIsValidUrl(validateUrl(url));
    setShowPreview(false);
  };

  const handlePreviewClick = () => {
    if (validateUrl(imageUrl)) {
      setShowPreview(true);
      setIsPreviewLoaded(false);
    }
  };

  const handleConfirm = () => {
    if (validateUrl(imageUrl)) {
      onConfirm(imageUrl, altText || 'image');
      onClose();
    }
  };

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      title="Insert Image from URL"
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
          <label htmlFor="alt-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alt Text
          </label>
          <input
            type="text"
            id="alt-text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="Description of the image"
            autoFocus
          />
        </div>
        
        <div>
          <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image URL
          </label>
          <input
            type="text"
            id="image-url"
            value={imageUrl}
            onChange={handleUrlChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              isValidUrl || imageUrl === 'https://' || imageUrl === '' 
                ? 'border-gray-300 dark:border-gray-600' 
                : 'border-red-500 dark:border-red-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
            placeholder="https://example.com/image.jpg"
          />
          {!isValidUrl && imageUrl !== 'https://' && imageUrl !== '' && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Please enter a valid URL
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handlePreviewClick}
            disabled={!isValidUrl}
            className="px-3 py-1.5 text-sm font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Image
          </button>
        </div>
        
        {showPreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center p-2 h-48">
              {!isPreviewLoaded && (
                <div className="text-gray-500 dark:text-gray-400">Loading...</div>
              )}
              <img
                src={imageUrl}
                alt={altText || "Preview"}
                className={`max-h-full max-w-full object-contain ${isPreviewLoaded ? 'block' : 'hidden'}`}
                onLoad={() => setIsPreviewLoaded(true)}
                onError={() => {
                  setIsPreviewLoaded(true);
                  setIsValidUrl(false);
                }}
              />
              {isPreviewLoaded && !isValidUrl && (
                <div className="text-red-500 dark:text-red-400">Failed to load image</div>
              )}
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Tip: Make sure the image URL ends with an image extension (e.g., .jpg, .png, .gif) and is from a source that allows embedding.
          </p>
        </div>
      </div>
    </BasicModal>
  );
};

export default ImageLinkModal;
