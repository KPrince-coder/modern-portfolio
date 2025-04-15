import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';

// Types
interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  folder?: string;
  metadata?: Record<string, any>;
}

interface MediaDetailProps {
  file: MediaFile;
  onBack: () => void;
  onDelete: () => void;
}

const MediaDetail: React.FC<MediaDetailProps> = ({ file, onBack, onDelete }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState(file.name);
  const [folder, setFolder] = useState(file.folder || '');

  // Update file metadata mutation
  const updateFileMutation = useMutation({
    mutationFn: async (data: { name: string; folder: string | null }) => {
      const { error } = await supabase
        .from('media')
        .update({
          name: data.name,
          folder: data.folder || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', file.id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
      setIsEditing(false);
    },
  });

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      await updateFileMutation.mutateAsync({
        name: fileName,
        folder: folder || null,
      });
    } catch (error) {
      console.error('Error updating file:', error);
    }
  };

  // Copy URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('URL copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy URL:', err);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {isEditing ? 'Edit File' : 'File Details'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* File Preview */}
        <div className="flex flex-col">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center min-h-[300px]">
            {file.type.startsWith('image/') ? (
              <img 
                src={file.url} 
                alt={file.name}
                className="max-w-full max-h-[500px] object-contain"
              />
            ) : file.type.startsWith('video/') ? (
              <video 
                src={file.url} 
                controls 
                className="max-w-full max-h-[500px]"
              />
            ) : file.type.startsWith('audio/') ? (
              <audio 
                src={file.url} 
                controls 
                className="w-full"
              />
            ) : file.type === 'application/pdf' ? (
              <div className="text-center p-4">
                <svg className="mx-auto h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-gray-700 dark:text-gray-300">PDF Document</p>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  View PDF
                </a>
              </div>
            ) : (
              <div className="text-center p-4">
                <svg className="mx-auto h-16 w-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-gray-700 dark:text-gray-300">{file.type}</p>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
          
          {/* URL and Copy Button */}
          <div className="mt-4 flex">
            <input
              type="text"
              value={file.url}
              readOnly
              className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(file.url)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700"
            >
              Copy URL
            </button>
          </div>
        </div>

        {/* File Details */}
        <div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Name
                </label>
                <input
                  type="text"
                  id="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>
              
              <div>
                <label htmlFor="folder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Folder
                </label>
                <input
                  type="text"
                  id="folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  placeholder="e.g. images/blog"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for root folder
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFileName(file.name);
                    setFolder(file.folder || '');
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveChanges}
                  isLoading={updateFileMutation.isPending}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File Name</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{file.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File Type</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{file.type}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">File Size</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{formatFileSize(file.size)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Folder</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">
                  {file.folder || 'Root'}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{formatDate(file.created_at)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Modified</h3>
                <p className="mt-1 text-base text-gray-900 dark:text-white">{formatDate(file.updated_at)}</p>
              </div>
              
              {file.metadata && Object.keys(file.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Metadata</h3>
                  <div className="mt-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <pre className="text-xs text-gray-900 dark:text-white overflow-auto">
                      {JSON.stringify(file.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MediaDetail;
