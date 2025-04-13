import React, { useState, useEffect, useRef } from 'react';
import BasicModal from '../BasicModal';
import { supabase } from '../../../lib/supabase';
import LoadingSpinner from '../LoadingSpinner';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (videoId: string, isLocalVideo?: boolean, localVideoUrl?: string) => void;
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
  const [activeTab, setActiveTab] = useState<'youtube' | 'upload'>('youtube');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract video ID from various YouTube URL formats
  useEffect(() => {
    if (!videoUrl) {
      setVideoId('');
      setIsValid(true);
      setPreviewAvailable(false);
      return;
    }

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
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

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Do nothing when opening
    } else {
      // Reset state when closing
      setVideoUrl('');
      setVideoId('');
      setIsValid(true);
      setPreviewAvailable(false);
      setActiveTab('youtube');
      setUploadedFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedVideoUrl('');
      setUploadError('');
    }
  }, [isOpen]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        setUploadError('Please select a valid video file');
        setUploadedFile(null);
        return;
      }

      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setUploadError('File size exceeds 100MB limit');
        setUploadedFile(null);
        return;
      }

      setUploadedFile(file);
      setUploadError('');
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      // Create a unique file name
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('blog_content')
        .upload(filePath, uploadedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: uploadedFile.type,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('blog_content')
        .getPublicUrl(filePath);

      setUploadedVideoUrl(urlData.publicUrl);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading video:', error);
      setUploadError('Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'youtube' && videoId) {
      onConfirm(videoId);
      onClose();
    } else if (activeTab === 'upload' && uploadedVideoUrl) {
      onConfirm('local', true, uploadedVideoUrl);
      onClose();
    }
  };

  return (
    <BasicModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Video"
      primaryAction={{
        label: activeTab === 'youtube' ? (videoId ? "Embed" : "Enter URL") :
               uploadedVideoUrl ? "Embed" : (uploadedFile ? "Upload" : "Select File"),
        onClick: handleConfirm,
        variant: "primary",
        isLoading: isUploading,
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: onClose,
      }}
      size="lg"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'youtube'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('youtube')}
          >
            YouTube Video
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'upload'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Video
          </button>
        </div>

        {/* YouTube Tab */}
        {activeTab === 'youtube' && (
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
                autoFocus={activeTab === 'youtube'}
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
                <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                      alt="YouTube video thumbnail"
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute">
                      <div className="bg-red-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Supported formats: youtube.com/watch, youtu.be/ID, youtube.com/embed, youtube.com/v/
              </p>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Video File
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="video-file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="sr-only"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                  disabled={isUploading}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Choose Video File
                </button>
                {uploadedFile && !isUploading && !uploadedVideoUrl && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                  >
                    Upload
                  </button>
                )}
              </div>
              {uploadedFile && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {uploadedFile.name} ({Math.round(uploadedFile.size / 1024 / 1024 * 10) / 10} MB)
                </p>
              )}
              {uploadError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {uploadError}
                </p>
              )}
            </div>

            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Uploading video... {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {uploadedVideoUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                <div className="aspect-[16/9] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <video
                    src={uploadedVideoUrl}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Supported formats: MP4, WebM, Ogg. Maximum file size: 100MB.
              </p>
            </div>
          </div>
        )}
      </div>
    </BasicModal>
  );
};

export default YouTubeModal;
