import React, { useState} from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useCMS } from '../CMSProvider';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MediaUploader from '../components/media/MediaUploader';
import MediaGrid from '../components/media/MediaGrid';
import MediaDetail from '../components/media/MediaDetail';

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

type MediaView = 'grid' | 'detail';
type SortOption = 'newest' | 'oldest' | 'name' | 'size';

const MediaPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useCMS();
  const queryClient = useQueryClient();
  const [view, setView] = useState<MediaView>('grid');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Fetch media files
  const {
    data: mediaFiles,
    isLoading: mediaLoading,
    error: mediaError,
  } = useQuery({
    queryKey: ['mediaFiles', currentFolder],
    queryFn: async () => {
      let query = supabase
        .from('media')
        .select('*');
      
      if (currentFolder) {
        query = query.eq('folder', currentFolder);
      } else {
        query = query.is('folder', null);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as MediaFile[];
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Fetch folders
  const {
    data: folders,
    isLoading: foldersLoading,
    error: foldersError,
  } = useQuery({
    queryKey: ['mediaFolders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media')
        .select('folder')
        .not('folder', 'is', null)
        .order('folder', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Extract unique folders
      const uniqueFolders = [...new Set(data.map(item => item.folder))];
      return uniqueFolders as string[];
    },
    enabled: isAuthenticated && !authLoading,
  });

  // Delete media file mutation
  const deleteMediaMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', fileId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
      setSelectedFile(null);
      setView('grid');
    },
  });

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        await deleteMediaMutation.mutateAsync(fileId);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  // Filter and sort media files
  const filteredAndSortedMedia = React.useMemo(() => {
    if (!mediaFiles) return [];

    // Filter by search query and type
    let filtered = mediaFiles.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || file.type.startsWith(typeFilter);
      return matchesSearch && matchesType;
    });

    // Sort files
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });
  }, [mediaFiles, searchQuery, typeFilter, sortBy]);

  // Handle file selection
  const handleSelectFile = (file: MediaFile) => {
    setSelectedFile(file);
    setView('detail');
  };

  // Handle folder navigation
  const handleFolderChange = (folder: string | null) => {
    setCurrentFolder(folder);
    setSelectedFile(null);
    setView('grid');
  };

  // Loading state
  if (authLoading || mediaLoading || foldersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading media..." />
      </div>
    );
  }

  // Error state
  if (mediaError || foldersError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">
            {(mediaError as Error)?.message || (foldersError as Error)?.message || 'An error occurred while fetching data.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Media Library</h1>
          <div className="mt-4 sm:mt-0">
            <Button
              variant="primary"
              onClick={() => setIsUploaderOpen(true)}
            >
              Upload Files
            </Button>
          </div>
        </motion.div>

        <div className="mt-6">
          {view === 'grid' ? (
            <>
              {/* Filters and Controls */}
              <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="Search files..."
                    />
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      File Type
                    </label>
                    <select
                      id="typeFilter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    >
                      <option value="all">All Types</option>
                      <option value="image/">Images</option>
                      <option value="video/">Videos</option>
                      <option value="audio/">Audio</option>
                      <option value="application/pdf">PDFs</option>
                      <option value="application/">Documents</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sort By
                    </label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="name">Name</option>
                      <option value="size">Size</option>
                    </select>
                  </div>

                  {/* Folder Filter */}
                  <div>
                    <label htmlFor="folderFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Folder
                    </label>
                    <select
                      id="folderFilter"
                      value={currentFolder || ''}
                      onChange={(e) => handleFolderChange(e.target.value || null)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    >
                      <option value="">Root</option>
                      {folders?.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Media Grid */}
              <MediaGrid
                files={filteredAndSortedMedia}
                onSelectFile={handleSelectFile}
                onDeleteFile={handleDeleteFile}
              />
            </>
          ) : (
            /* Media Detail View */
            selectedFile && (
              <MediaDetail
                file={selectedFile}
                onBack={() => setView('grid')}
                onDelete={() => handleDeleteFile(selectedFile.id)}
              />
            )
          )}
        </div>
      </div>

      {/* Media Uploader Modal */}
      {isUploaderOpen && (
        <MediaUploader
          currentFolder={currentFolder}
          onClose={() => setIsUploaderOpen(false)}
          onUploadComplete={() => {
            queryClient.invalidateQueries({ queryKey: ['mediaFiles'] });
            setIsUploaderOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default MediaPage;
