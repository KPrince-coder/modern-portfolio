-- Create blog post analytics table
CREATE TABLE IF NOT EXISTS portfolio.blog_post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  avg_time_spent FLOAT DEFAULT 0,
  -- Average time spent in seconds
  total_time_spent FLOAT DEFAULT 0,
  -- Total time spent in seconds
  view_count_for_time INTEGER DEFAULT 0,
  -- Number of views with time tracking
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_feedback_rating FLOAT DEFAULT 0,
  -- Average AI feedback rating (1-5)
  ai_feedback_count INTEGER DEFAULT 0,
  -- Number of AI feedback submissions
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id)
);
-- Create blog post shares table
CREATE TABLE IF NOT EXISTS portfolio.blog_post_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  -- e.g., 'twitter', 'facebook'
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create AI content feedback table
CREATE TABLE IF NOT EXISTS portfolio.ai_content_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (
    rating BETWEEN 1 AND 5
  ),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS blog_post_analytics_post_id_idx ON portfolio.blog_post_analytics(post_id);
CREATE INDEX IF NOT EXISTS blog_post_analytics_ai_generated_idx ON portfolio.blog_post_analytics(ai_generated);
CREATE INDEX IF NOT EXISTS blog_post_shares_post_id_idx ON portfolio.blog_post_shares(post_id);
CREATE INDEX IF NOT EXISTS blog_post_shares_platform_idx ON portfolio.blog_post_shares(platform);
CREATE INDEX IF NOT EXISTS ai_content_feedback_post_id_idx ON portfolio.ai_content_feedback(post_id);
CREATE INDEX IF NOT EXISTS ai_content_feedback_rating_idx ON portfolio.ai_content_feedback(rating);
-- Create function to get AI content performance
CREATE OR REPLACE FUNCTION portfolio.get_ai_content_performance() RETURNS TABLE (
    ai_generated BOOLEAN,
    total_posts BIGINT,
    total_views BIGINT,
    avg_views_per_post FLOAT,
    avg_time_spent FLOAT,
    avg_rating FLOAT
  ) AS $$ BEGIN RETURN QUERY
SELECT a.ai_generated,
  COUNT(DISTINCT a.post_id) AS total_posts,
  SUM(a.views) AS total_views,
  CASE
    WHEN COUNT(DISTINCT a.post_id) > 0 THEN SUM(a.views)::FLOAT / COUNT(DISTINCT a.post_id)
    ELSE 0
  END AS avg_views_per_post,
  AVG(a.avg_time_spent) AS avg_time_spent,
  AVG(a.ai_feedback_rating) AS avg_rating
FROM portfolio.blog_post_analytics a
GROUP BY a.ai_generated;
END;
$$ LANGUAGE plpgsql;