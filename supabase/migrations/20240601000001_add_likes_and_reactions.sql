-- Add likes and reactions to blog posts and comments
-- This migration adds support for:
-- 1. Comment replies with proper hierarchy
-- 2. Likes for blog posts
-- 3. Likes for comments
-- 4. Analytics tracking for likes

-- Add likes table for blog posts
CREATE TABLE IF NOT EXISTS portfolio.blog_post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL, -- Could be user ID, session ID, or fingerprint
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure a user can only like a post once
    UNIQUE(post_id, user_identifier)
);

-- Add likes table for comments
CREATE TABLE IF NOT EXISTS portfolio.blog_comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES portfolio.blog_comments(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL, -- Could be user ID, session ID, or fingerprint
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure a user can only like a comment once
    UNIQUE(comment_id, user_identifier)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_post_likes_post_id ON portfolio.blog_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comment_likes_comment_id ON portfolio.blog_comment_likes(comment_id);

-- Add likes count columns to blog_posts for faster retrieval
ALTER TABLE portfolio.blog_posts 
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- Add likes count columns to blog_comments for faster retrieval
ALTER TABLE portfolio.blog_comments 
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- Add function to update likes count on blog posts
CREATE OR REPLACE FUNCTION portfolio.update_blog_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE portfolio.blog_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE portfolio.blog_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add function to update likes count on blog comments
CREATE OR REPLACE FUNCTION portfolio.update_blog_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE portfolio.blog_comments
    SET likes_count = likes_count + 1
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE portfolio.blog_comments
    SET likes_count = likes_count - 1
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating likes count
CREATE TRIGGER update_blog_post_likes_count
AFTER INSERT OR DELETE ON portfolio.blog_post_likes
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_blog_post_likes_count();

CREATE TRIGGER update_blog_comment_likes_count
AFTER INSERT OR DELETE ON portfolio.blog_comment_likes
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_blog_comment_likes_count();

-- Add analytics tracking for likes
ALTER TABLE portfolio.blog_post_analytics
ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;

-- Add function to update analytics when a post is liked
CREATE OR REPLACE FUNCTION portfolio.update_blog_post_analytics_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Try to update existing analytics record
    UPDATE portfolio.blog_post_analytics
    SET likes_count = likes_count + 1
    WHERE post_id = NEW.post_id;
    
    -- If no record exists, create one
    IF NOT FOUND THEN
      INSERT INTO portfolio.blog_post_analytics (post_id, likes_count)
      VALUES (NEW.post_id, 1);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement likes count in analytics
    UPDATE portfolio.blog_post_analytics
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE post_id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating analytics
CREATE TRIGGER update_blog_post_analytics_likes
AFTER INSERT OR DELETE ON portfolio.blog_post_likes
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_blog_post_analytics_likes();

-- Add RLS policies for the new tables
ALTER TABLE portfolio.blog_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio.blog_comment_likes ENABLE ROW LEVEL SECURITY;

-- Allow public to like posts and comments
CREATE POLICY "Public can like blog posts" ON portfolio.blog_post_likes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio.blog_posts p
      WHERE p.id = post_id AND p.status = 'published'
    )
  );

CREATE POLICY "Public can like blog comments" ON portfolio.blog_comment_likes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio.blog_comments c
      WHERE c.id = comment_id AND c.is_approved = TRUE
    )
  );

-- Allow public to view likes
CREATE POLICY "Public can view blog post likes" ON portfolio.blog_post_likes
  FOR SELECT USING (TRUE);

CREATE POLICY "Public can view blog comment likes" ON portfolio.blog_comment_likes
  FOR SELECT USING (TRUE);

-- Allow users to unlike (delete their own likes)
CREATE POLICY "Users can unlike blog posts" ON portfolio.blog_post_likes
  FOR DELETE USING (user_identifier = current_setting('request.headers')::json->>'x-user-identifier');

CREATE POLICY "Users can unlike blog comments" ON portfolio.blog_comment_likes
  FOR DELETE USING (user_identifier = current_setting('request.headers')::json->>'x-user-identifier');

-- Add comments for documentation
COMMENT ON TABLE portfolio.blog_post_likes IS 'Likes for blog posts';
COMMENT ON TABLE portfolio.blog_comment_likes IS 'Likes for blog comments';
COMMENT ON COLUMN portfolio.blog_posts.likes_count IS 'Count of likes for this post';
COMMENT ON COLUMN portfolio.blog_comments.likes_count IS 'Count of likes for this comment';
COMMENT ON COLUMN portfolio.blog_post_analytics.likes_count IS 'Count of likes for analytics tracking';
