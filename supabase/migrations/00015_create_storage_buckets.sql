-- Create storage buckets for file uploads
-- This migration creates all the necessary storage buckets for the portfolio application
-- Enable the storage extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
-- Create bucket for profile-related files (profile images, resume)
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('profile', 'profile', true, false) ON CONFLICT (id) DO NOTHING;
-- Create bucket for project-related files (thumbnails, gallery images)
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('projects', 'projects', true, false) ON CONFLICT (id) DO NOTHING;
-- Create bucket for blog-related files (featured images, content images)
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('blog', 'blog', true, false) ON CONFLICT (id) DO NOTHING;
-- Create bucket for experience-related files (company logos, institution logos)
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('experience', 'experience', true, false) ON CONFLICT (id) DO NOTHING;
-- Create bucket for SEO-related files (Open Graph images)
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('seo', 'seo', true, false) ON CONFLICT (id) DO NOTHING;
-- Create bucket for general media library (reusable assets)
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('media', 'media', true, false) ON CONFLICT (id) DO NOTHING;
-- Set up security policies for the buckets
-- Profile bucket policies
-- Allow authenticated users to upload to profile bucket
CREATE POLICY "Allow authenticated users to upload profile files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'profile');
-- Allow authenticated users to update their profile files
CREATE POLICY "Allow authenticated users to update profile files" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'profile');
-- Allow authenticated users to delete their profile files
CREATE POLICY "Allow authenticated users to delete profile files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile');
-- Allow public access to read profile files
CREATE POLICY "Allow public to view profile files" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'profile');
-- Projects bucket policies
-- Allow authenticated users to upload to projects bucket
CREATE POLICY "Allow authenticated users to upload project files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'projects');
-- Allow authenticated users to update their project files
CREATE POLICY "Allow authenticated users to update project files" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'projects');
-- Allow authenticated users to delete their project files
CREATE POLICY "Allow authenticated users to delete project files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'projects');
-- Allow public access to read project files
CREATE POLICY "Allow public to view project files" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'projects');
-- Blog bucket policies
-- Allow authenticated users to upload to blog bucket
CREATE POLICY "Allow authenticated users to upload blog files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'blog');
-- Allow authenticated users to update their blog files
CREATE POLICY "Allow authenticated users to update blog files" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'blog');
-- Allow authenticated users to delete their blog files
CREATE POLICY "Allow authenticated users to delete blog files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blog');
-- Allow public access to read blog files
CREATE POLICY "Allow public to view blog files" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'blog');
-- Media bucket policies
-- Allow authenticated users to upload to media bucket
CREATE POLICY "Allow authenticated users to upload media files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'media');
-- Allow authenticated users to update their media files
CREATE POLICY "Allow authenticated users to update media files" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'media');
-- Allow authenticated users to delete their media files
CREATE POLICY "Allow authenticated users to delete media files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media');
-- Allow public access to read media files
CREATE POLICY "Allow public to view media files" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'media');
-- Experience bucket policies
-- Allow authenticated users to upload to experience bucket
CREATE POLICY "Allow authenticated users to upload experience files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'experience');
-- Allow authenticated users to update their experience files
CREATE POLICY "Allow authenticated users to update experience files" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'experience');
-- Allow authenticated users to delete their experience files
CREATE POLICY "Allow authenticated users to delete experience files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'experience');
-- Allow public access to read experience files
CREATE POLICY "Allow public to view experience files" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'experience');
-- SEO bucket policies
-- Allow authenticated users to upload to SEO bucket
CREATE POLICY "Allow authenticated users to upload SEO files" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (bucket_id = 'seo');
-- Allow authenticated users to update their SEO files
CREATE POLICY "Allow authenticated users to update SEO files" ON storage.objects FOR
UPDATE TO authenticated USING (bucket_id = 'seo');
-- Allow authenticated users to delete their SEO files
CREATE POLICY "Allow authenticated users to delete SEO files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'seo');
-- Allow public access to read SEO files
CREATE POLICY "Allow public to view SEO files" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'seo');
-- Add comments for documentation
COMMENT ON POLICY "Allow authenticated users to upload profile files" ON storage.objects IS 'Allow authenticated users to upload files to the profile bucket';
COMMENT ON POLICY "Allow authenticated users to update profile files" ON storage.objects IS 'Allow authenticated users to update files in the profile bucket';
COMMENT ON POLICY "Allow authenticated users to delete profile files" ON storage.objects IS 'Allow authenticated users to delete files from the profile bucket';
COMMENT ON POLICY "Allow public to view profile files" ON storage.objects IS 'Allow public access to view files in the profile bucket';
COMMENT ON POLICY "Allow authenticated users to upload project files" ON storage.objects IS 'Allow authenticated users to upload files to the projects bucket';
COMMENT ON POLICY "Allow authenticated users to update project files" ON storage.objects IS 'Allow authenticated users to update files in the projects bucket';
COMMENT ON POLICY "Allow authenticated users to delete project files" ON storage.objects IS 'Allow authenticated users to delete files from the projects bucket';
COMMENT ON POLICY "Allow public to view project files" ON storage.objects IS 'Allow public access to view files in the projects bucket';
COMMENT ON POLICY "Allow authenticated users to upload blog files" ON storage.objects IS 'Allow authenticated users to upload files to the blog bucket';
COMMENT ON POLICY "Allow authenticated users to update blog files" ON storage.objects IS 'Allow authenticated users to update files in the blog bucket';
COMMENT ON POLICY "Allow authenticated users to delete blog files" ON storage.objects IS 'Allow authenticated users to delete files from the blog bucket';
COMMENT ON POLICY "Allow public to view blog files" ON storage.objects IS 'Allow public access to view files in the blog bucket';
COMMENT ON POLICY "Allow authenticated users to upload media files" ON storage.objects IS 'Allow authenticated users to upload files to the media bucket';
COMMENT ON POLICY "Allow authenticated users to update media files" ON storage.objects IS 'Allow authenticated users to update files in the media bucket';
COMMENT ON POLICY "Allow authenticated users to delete media files" ON storage.objects IS 'Allow authenticated users to delete files from the media bucket';
COMMENT ON POLICY "Allow public to view media files" ON storage.objects IS 'Allow public access to view files in the media bucket';
COMMENT ON POLICY "Allow authenticated users to upload experience files" ON storage.objects IS 'Allow authenticated users to upload files to the experience bucket';
COMMENT ON POLICY "Allow authenticated users to update experience files" ON storage.objects IS 'Allow authenticated users to update files in the experience bucket';
COMMENT ON POLICY "Allow authenticated users to delete experience files" ON storage.objects IS 'Allow authenticated users to delete files from the experience bucket';
COMMENT ON POLICY "Allow public to view experience files" ON storage.objects IS 'Allow public access to view files in the experience bucket';
COMMENT ON POLICY "Allow authenticated users to upload SEO files" ON storage.objects IS 'Allow authenticated users to upload files to the SEO bucket';
COMMENT ON POLICY "Allow authenticated users to update SEO files" ON storage.objects IS 'Allow authenticated users to update files in the SEO bucket';
COMMENT ON POLICY "Allow authenticated users to delete SEO files" ON storage.objects IS 'Allow authenticated users to delete files from the SEO bucket';
COMMENT ON POLICY "Allow public to view SEO files" ON storage.objects IS 'Allow public access to view files in the SEO bucket';