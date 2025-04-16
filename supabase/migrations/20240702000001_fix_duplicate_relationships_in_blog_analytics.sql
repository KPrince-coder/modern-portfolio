-- Fix duplicate relationships in blog analytics tables
-- First, drop the duplicate foreign key constraints
ALTER TABLE portfolio.blog_audience_data DROP CONSTRAINT IF EXISTS fk_blog_post;
ALTER TABLE portfolio.blog_content_engagement DROP CONSTRAINT IF EXISTS fk_blog_post;
-- Recreate the tables with proper relationships
-- For blog_audience_data, keep only the REFERENCES constraint
ALTER TABLE portfolio.blog_audience_data DROP CONSTRAINT IF EXISTS blog_audience_data_post_id_fkey;
ALTER TABLE portfolio.blog_audience_data
ADD CONSTRAINT blog_audience_data_post_id_fkey FOREIGN KEY (post_id) REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE;
-- For blog_content_engagement, keep only the REFERENCES constraint
ALTER TABLE portfolio.blog_content_engagement DROP CONSTRAINT IF EXISTS blog_content_engagement_post_id_fkey;
ALTER TABLE portfolio.blog_content_engagement
ADD CONSTRAINT blog_content_engagement_post_id_fkey FOREIGN KEY (post_id) REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE;
-- Add comment for documentation
COMMENT ON TABLE portfolio.blog_audience_data IS 'Stores audience data for blog posts including device, browser, and location information';
COMMENT ON TABLE portfolio.blog_content_engagement IS 'Tracks user engagement with blog content including scroll depth and element interactions';