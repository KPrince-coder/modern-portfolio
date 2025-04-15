import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

interface MediaUploaderProps {
  currentFolder: string | null;
  onClose: () => void;
  onUploadComplete: () => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  currentFolder,
  onClose,
  onUploadComplete
}) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [folder, setFolder] = useState(currentFolder || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (fileData: { file: File; id: string; folder: string | null }) => {
      // Update file status to uploading
      setFiles(prev =>
        prev.map(f =>
          f.id === fileData.id
            ? { ...f, status: 'uploading' }
            : f
        )
      );

      try {
        // Create a unique file name
        const fileExt = fileData.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = fileData.folder
          ? `${fileData.folder}/${fileName}`
          : fileName;

        // Upload file to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, fileData.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        // Create thumbnail for images
        let thumbnailUrl = '';
        if (fileData.file.type.startsWith('image/')) {
          // In a real implementation, you would generate a thumbnail
          // For now, we'll use the same URL
          thumbnailUrl = publicUrl;
        }

        // Add file record to database
        const { error: dbError } = await supabase
          .from('media')
          .insert({
            name: fileData.file.name,
            size: fileData.file.size,
            type: fileData.file.type,
            url: publicUrl,
            thumbnail_url: thumbnailUrl || null,
            folder: fileData.folder,
            metadata: {
              contentType: fileData.file.type,
              lastModified: fileData.file.lastModified,
            },
          });

        if (dbError) {
          throw dbError;
        }

        // Update file status to success
        setFiles(prev =>
          prev.map(f =>
            f.id === fileData.id
              ? { ...f, status: 'success', progress: 100, url: publicUrl }
              : f
          )
        );

        return publicUrl;
      } catch (error) {
        console.error('Error uploading file:', error);

        // Update file status to error
        setFiles(prev =>
          prev.map(f =>
            f.id === fileData.id
              ? { ...f, status: 'error', error: (error as Error).message }
              : f
          )
        );

        throw error;
      }
    },
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      progress: 0,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const newFiles: UploadFile[] = Array.from(droppedFiles).map(file => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      progress: 0,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  // Handle file removal
  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  // Handle upload all files
  const handleUploadAll = async () => {
    const pendingFiles = files.filter(file => file.status === 'pending');

    if (pendingFiles.length === 0) return;

    // Upload files sequentially
    for (const file of pendingFiles) {
      try {
        await uploadFileMutation.mutateAsync({
          file: file.file,
          id: file.id,
          folder: folder || null,
        });
      } catch (error) {
        // Error is handled in the mutation
      }
    }

    // Check if all files are processed
    const allProcessed = files.every(file =>
      file.status === 'success' || file.status === 'error'
    );

    if (allProcessed) {
      onUploadComplete();
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Upload Media Files
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Folder Selection */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <label htmlFor="folder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Upload to Folder
          </label>
          <input
            type="text"
            id="folder"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="e.g. images/blog (leave empty for root folder)"
          />
        </div>

        {/* Drop Zone */}
        <div
          className={`p-6 flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-lg m-4 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Drag and drop files here, or
          </p>
          <Button
            variant="primary"
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Supported formats: Images, Videos, Audio, PDFs, and Documents
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 max-h-[300px] overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Files ({files.length})
            </h3>
            <ul className="space-y-2">
              <AnimatePresence>
                {files.map((file) => (
                  <motion.li
                    key={file.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      {file.file.type.startsWith('image/') ? (
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-md overflow-hidden mr-3">
                          <img
                            src={file.url || URL.createObjectURL(file.file)}
                            alt={file.file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(file.file.size)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center">
                      {file.status === 'pending' && (
                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}

                      {file.status === 'uploading' && (
                        <div className="w-5 h-5">
                          <LoadingSpinner size="sm" text="" />
                        </div>
                      )}

                      {file.status === 'success' && (
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}

                      {file.status === 'error' && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="ml-1 text-xs text-red-500">{file.error}</span>
                        </div>
                      )}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUploadAll}
            disabled={files.length === 0 || files.every(file => file.status !== 'pending') || uploadFileMutation.isPending}
            isLoading={uploadFileMutation.isPending}
          >
            Upload {files.filter(file => file.status === 'pending').length > 0 ? `(${files.filter(file => file.status === 'pending').length})` : ''}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default MediaUploader;
