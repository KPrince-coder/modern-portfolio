# Storage Buckets Documentation

This document provides information about the storage buckets available in the portfolio application and how to use them.

## Available Storage Buckets

The application has the following storage buckets:

1. **profile** - For profile-related files
   - Profile images
   - Resume files

2. **projects** - For project-related files
   - Project thumbnails
   - Project gallery images
   - Project testimonial author images
   - Project videos

3. **blog** - For blog-related files
   - Blog featured images
   - Blog content images
   - Blog content videos

4. **experience** - For experience-related files
   - Company logos
   - Institution logos

5. **seo** - For SEO-related files
   - Open Graph images
   - Site icons

6. **media** - For general media library
   - Reusable assets across the application
   - Videos
   - Documents

## Folder Structure

Each bucket has a recommended folder structure:

### Profile Bucket

- `/avatars` - Profile images
- `/resumes` - Resume files

### Projects Bucket

- `/thumbnails` - Project thumbnail images
- `/gallery` - Project gallery images
- `/testimonials` - Project testimonial author images
- `/videos` - Project videos

### Blog Bucket

- `/featured` - Blog featured images
- `/content` - Images embedded in blog content
- `/content/videos` - Videos embedded in blog content

### Experience Bucket

- `/companies` - Company logos
- `/institutions` - Institution logos

### SEO Bucket

- `/og-images` - Open Graph images
- `/icons` - Site icons

### Media Bucket

- No specific structure for root folder
- `/videos` - Video files
- `/documents` - Document files

## Using the Storage Utility

The application provides a storage utility (`src/lib/storage.ts`) to simplify working with these buckets.

### Basic Usage

```typescript
import { uploadFile, deleteFile, listFiles } from '../lib/storage';

// Upload a file
const uploadImage = async (file: File) => {
  const { url, error } = await uploadFile('blog', file, 'featured', 'image');
  if (error) {
    console.error('Upload failed:', error);
    return;
  }
  console.log('File uploaded successfully:', url);
};

// Delete a file
const removeFile = async (path: string) => {
  const { success, error } = await deleteFile('blog', path);
  if (error) {
    console.error('Delete failed:', error);
    return;
  }
  console.log('File deleted successfully');
};

// List files in a directory
const listBlogImages = async () => {
  const { files, error } = await listFiles('blog', 'featured');
  if (error) {
    console.error('Failed to list files:', error);
    return;
  }
  console.log('Files:', files);
};
```

### Using Predefined Upload Handlers

The storage utility provides predefined upload handlers for common use cases:

```typescript
import { uploadHandlers } from '../lib/storage';

// Upload a profile image
const uploadProfileImage = async (file: File) => {
  const { url, error } = await uploadHandlers.profileImage(file);
  if (error) {
    console.error('Upload failed:', error);
    return;
  }
  console.log('Profile image uploaded successfully:', url);
};

// Upload a resume
const uploadResume = async (file: File) => {
  const { url, error } = await uploadHandlers.resume(file);
  if (error) {
    console.error('Upload failed:', error);
    return;
  }
  console.log('Resume uploaded successfully:', url);
};

// Upload a blog featured image
const uploadBlogImage = async (file: File) => {
  const { url, error } = await uploadHandlers.blogFeaturedImage(file);
  if (error) {
    console.error('Upload failed:', error);
    return;
  }
  console.log('Blog image uploaded successfully:', url);
};
```

### Creating Custom Upload Handlers

You can create custom upload handlers for specific use cases:

```typescript
import { createUploadHandler } from '../lib/storage';

// Create a custom upload handler for project videos
const uploadProjectVideo = createUploadHandler('projects', 'videos', 'video');

// Use the custom handler
const uploadVideo = async (file: File) => {
  const { url, error } = await uploadProjectVideo(file);
  if (error) {
    console.error('Upload failed:', error);
    return;
  }
  console.log('Video uploaded successfully:', url);
};
```

## Security Policies

The storage buckets have the following security policies:

1. **Authenticated Users**:
   - Can upload files to all buckets
   - Can update files in all buckets
   - Can delete files from all buckets

2. **Public (Unauthenticated Users)**:
   - Can view/read files from all buckets
   - Cannot upload, update, or delete files

These policies ensure that only authenticated users can modify the content, while allowing public access for viewing the content.

## Troubleshooting

If you encounter issues with file uploads or storage, check the following:

1. **Bucket Existence**: Ensure the bucket exists in the Supabase project.
2. **File Size**: Supabase has a default file size limit of 50MB.
3. **File Type**: Ensure the file type is allowed.
4. **Authentication**: Ensure the user is authenticated for upload/delete operations.
5. **Path Structure**: Use consistent path structures as recommended above.

For more information, refer to the [Supabase Storage documentation](https://supabase.com/docs/guides/storage).
