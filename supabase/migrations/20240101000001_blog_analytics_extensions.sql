-- Create tables for extended blog analytics
-- Table for tracking audience data (device, browser, location)
CREATE TABLE IF NOT EXISTS portfolio.blog_audience_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  browser TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  is_new_visitor BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_blog_post FOREIGN KEY (post_id) REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE
);
-- Table for tracking content engagement (scroll depth, element interactions)
CREATE TABLE IF NOT EXISTS portfolio.blog_content_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  scroll_depth INTEGER,
  -- Percentage of page scrolled (0-100)
  element_type TEXT,
  -- Type of element interacted with (link, image, video, code, etc.)
  element_id TEXT,
  -- ID of the element if available
  interaction_type TEXT,
  -- Type of interaction (click, hover, etc.)
  time_spent_seconds INTEGER,
  -- Time spent on this interaction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_blog_post FOREIGN KEY (post_id) REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE
);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audience_post_id ON portfolio.blog_audience_data(post_id);
CREATE INDEX IF NOT EXISTS idx_audience_device ON portfolio.blog_audience_data(device_type);
CREATE INDEX IF NOT EXISTS idx_audience_country ON portfolio.blog_audience_data(country);
CREATE INDEX IF NOT EXISTS idx_audience_created_at ON portfolio.blog_audience_data(created_at);
CREATE INDEX IF NOT EXISTS idx_engagement_post_id ON portfolio.blog_content_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_engagement_element_type ON portfolio.blog_content_engagement(element_type);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON portfolio.blog_content_engagement(created_at);
-- Create function to get content engagement metrics for a specific post
CREATE OR REPLACE FUNCTION portfolio.get_post_engagement_metrics(post_uuid UUID) RETURNS TABLE (metric_name TEXT, metric_value NUMERIC) AS $$ BEGIN RETURN QUERY -- Average scroll depth
SELECT 'avg_scroll_depth' as metric_name,
  COALESCE(AVG(scroll_depth), 0) as metric_value
FROM portfolio.blog_content_engagement
WHERE post_id = post_uuid
  AND scroll_depth IS NOT NULL
UNION ALL
-- Element interaction counts
SELECT 'element_interactions' as metric_name,
  COUNT(*) as metric_value
FROM portfolio.blog_content_engagement
WHERE post_id = post_uuid
  AND element_type IS NOT NULL
UNION ALL
-- Completion rate (percentage of visitors who scrolled to at least 90%)
SELECT 'completion_rate' as metric_name,
  (
    COUNT(
      CASE
        WHEN scroll_depth >= 90 THEN 1
      END
    ) * 100.0 / NULLIF(COUNT(*), 0)
  ) as metric_value
FROM portfolio.blog_content_engagement
WHERE post_id = post_uuid
  AND scroll_depth IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
-- Create function to get audience metrics for a specific post
CREATE OR REPLACE FUNCTION portfolio.get_post_audience_metrics(post_uuid UUID) RETURNS TABLE (metric_name TEXT, metric_value NUMERIC) AS $$ BEGIN RETURN QUERY -- New vs returning visitors
SELECT 'new_visitors_percentage' as metric_name,
  (
    COUNT(
      CASE
        WHEN is_new_visitor THEN 1
      END
    ) * 100.0 / NULLIF(COUNT(*), 0)
  ) as metric_value
FROM portfolio.blog_audience_data
WHERE post_id = post_uuid
UNION ALL
-- Device distribution
SELECT 'mobile_percentage' as metric_name,
  (
    COUNT(
      CASE
        WHEN device_type = 'mobile' THEN 1
      END
    ) * 100.0 / NULLIF(COUNT(*), 0)
  ) as metric_value
FROM portfolio.blog_audience_data
WHERE post_id = post_uuid;
END;
$$ LANGUAGE plpgsql;
-- Insert sample data for testing
INSERT INTO portfolio.blog_audience_data (
    post_id,
    session_id,
    device_type,
    browser,
    country,
    is_new_visitor
  )
SELECT p.id,
  'session-' || floor(random() * 1000)::text,
  CASE
    floor(random() * 3)::int
    WHEN 0 THEN 'desktop'
    WHEN 1 THEN 'mobile'
    ELSE 'tablet'
  END,
  CASE
    floor(random() * 4)::int
    WHEN 0 THEN 'Chrome'
    WHEN 1 THEN 'Safari'
    WHEN 2 THEN 'Firefox'
    ELSE 'Edge'
  END,
  CASE
    floor(random() * 6)::int
    WHEN 0 THEN 'United States'
    WHEN 1 THEN 'United Kingdom'
    WHEN 2 THEN 'Canada'
    WHEN 3 THEN 'Germany'
    WHEN 4 THEN 'India'
    ELSE 'Australia'
  END,
  random() > 0.35
FROM portfolio.blog_posts p
  CROSS JOIN generate_series(1, 50)
WHERE p.status = 'published';
INSERT INTO portfolio.blog_content_engagement (
    post_id,
    session_id,
    scroll_depth,
    element_type,
    interaction_type,
    time_spent_seconds
  )
SELECT p.id,
  'session-' || floor(random() * 1000)::text,
  floor(random() * 101)::int,
  CASE
    floor(random() * 5)::int
    WHEN 0 THEN 'link'
    WHEN 1 THEN 'image'
    WHEN 2 THEN 'video'
    WHEN 3 THEN 'code'
    ELSE 'text'
  END,
  CASE
    floor(random() * 2)::int
    WHEN 0 THEN 'click'
    ELSE 'hover'
  END,
  floor(random() * 300)::int
FROM portfolio.blog_posts p
  CROSS JOIN generate_series(1, 100)
WHERE p.status = 'published';