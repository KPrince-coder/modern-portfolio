import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (videoId: string) => void;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [previewAvailable, setPreviewAvailable] = useState(false);

  // Extract video ID from various YouTube URL formats
  useEffect(() => {
    if (!videoUrl) {
      setVideoId('');
      setIsValid(true);
      setPreviewAvailable(false);
      return;
    }

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\.be\\/)([^"&?\\/ ]{11})/i;
    const match = videoUrl.match(youtubeRegex);
    
    if (match && match[1]) {
      setVideoId(match[1]);
      setIsValid(true);
      setPreviewAvailable(true);
    } else {
      setVideoId('');
      setIsValid(false);
      setPreviewAvailable(false);
    }
  }, [videoUrl]);

  const handleConfirm = () => {
    if (videoId) {
      onConfirm(videoId);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Embed YouTube Video"
      primaryAction={{
        label: "Embed",
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
        <div>
          <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            YouTube Video URL
          </label>
          <input
            type="text"
            id="video-url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              isValid 
                ? 'border-gray-300 dark:border-gray-600' 
                : 'border-red-500 dark:border-red-500'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400`}
            placeholder="https://www.youtube.com/watch?v=..."
            autoFocus
          />
          {!isValid && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Please enter a valid YouTube URL
            </p>
          )}
        </div>
        
        {previewAvailable && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Supported formats: youtube.com/watch, youtu.be/ID, youtube.com/embed, youtube.com/v/
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default YouTubeModal;
