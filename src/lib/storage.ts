/**
 * Storage utility functions for handling file uploads and retrievals
 */
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Define storage bucket types
export type StorageBucket = 'profile' | 'projects' | 'blog' | 'media' | 'experience' | 'seo';

// Define file types
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'other';

/**
 * Upload a file to a specific storage bucket
 * @param bucket The storage bucket to upload to
 * @param file The file to upload
 * @param path Optional path within the bucket (e.g., 'avatars/')
 * @param fileType The type of file being uploaded
 * @returns The URL of the uploaded file
 */
export const uploadFile = async (
  bucket: StorageBucket,
  file: File,
  path: string = '',
  fileType: FileType = 'other'
): Promise<{ url: string; error: Error | null }> => {
  try {
    // Generate a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the file
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: '', error: error as Error };
  }
};

/**
 * Delete a file from a storage bucket
 * @param bucket The storage bucket containing the file
 * @param path The path to the file within the bucket
 * @returns Success status
 */
export const deleteFile = async (
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error as Error };
  }
};

/**
 * Extract the file path from a public URL
 * @param url The public URL of the file
 * @param bucket The storage bucket containing the file
 * @returns The file path within the bucket
 */
export const getPathFromUrl = (url: string, bucket: StorageBucket): string => {
  // Get the base URL for the bucket
  const { data } = supabase.storage.from(bucket).getPublicUrl('');
  const baseUrl = data.publicUrl.replace(/\/$/, '');

  // Remove the base URL to get the path
  return url.replace(`${baseUrl}/`, '');
};

/**
 * Get a list of files in a specific path within a bucket
 * @param bucket The storage bucket to list files from
 * @param path The path within the bucket
 * @returns Array of file objects
 */
export const listFiles = async (
  bucket: StorageBucket,
  path: string = ''
) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(path);

    if (error) {
      throw error;
    }

    return { files: data, error: null };
  } catch (error) {
    console.error('Error listing files:', error);
    return { files: [], error: error as Error };
  }
};

/**
 * Create a file upload handler for a specific bucket and path
 * @param bucket The storage bucket to upload to
 * @param path The path within the bucket
 * @param fileType The type of file being uploaded
 * @returns A function that takes a file and returns the upload result
 */
export const createUploadHandler = (
  bucket: StorageBucket,
  path: string = '',
  fileType: FileType = 'image'
) => {
  return async (file: File) => {
    return uploadFile(bucket, file, path, fileType);
  };
};

// Predefined upload handlers for common use cases
export const uploadHandlers = {
  // Profile bucket handlers
  profileImage: createUploadHandler('profile', 'avatars', 'image'),
  resume: createUploadHandler('profile', 'resumes', 'document'),

  // Projects bucket handlers
  projectThumbnail: createUploadHandler('projects', 'thumbnails', 'image'),
  projectGallery: createUploadHandler('projects', 'gallery', 'image'),
  projectVideo: createUploadHandler('projects', 'videos', 'video'),

  // Blog bucket handlers
  blogFeaturedImage: createUploadHandler('blog', 'featured', 'image'),
  blogContentImage: createUploadHandler('blog', 'content', 'image'),
  blogContentVideo: createUploadHandler('blog', 'content/videos', 'video'),

  // Experience bucket handlers
  companyLogo: createUploadHandler('experience', 'companies', 'image'),
  institutionLogo: createUploadHandler('experience', 'institutions', 'image'),

  // SEO bucket handlers
  ogImage: createUploadHandler('seo', 'og-images', 'image'),
  siteIcon: createUploadHandler('seo', 'icons', 'image'),

  // Media library bucket handlers
  mediaLibrary: createUploadHandler('media', '', 'image'),
  mediaVideo: createUploadHandler('media', 'videos', 'video'),
  mediaDocument: createUploadHandler('media', 'documents', 'document'),
};

export default {
  uploadFile,
  deleteFile,
  getPathFromUrl,
  listFiles,
  createUploadHandler,
  uploadHandlers,
};
