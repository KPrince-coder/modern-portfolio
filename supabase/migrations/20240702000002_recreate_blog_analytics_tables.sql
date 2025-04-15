-- Recreate blog analytics tables with correct relationships

-- First, backup the existing data
CREATE TEMPORARY TABLE temp_blog_audience_data AS
SELECT * FROM portfolio.blog_audience_data;

CREATE TEMPORARY TABLE temp_blog_content_engagement AS
SELECT * FROM portfolio.blog_content_engagement;

-- Drop the existing tables
DROP TABLE IF EXISTS portfolio.blog_audience_data CASCADE;
DROP TABLE IF EXISTS portfolio.blog_content_engagement CASCADE;

-- Recreate the blog_audience_data table with a single foreign key
CREATE TABLE portfolio.blog_audience_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device_type TEXT NOT NULL,
  browser TEXT NOT NULL,
  country TEXT,
  region TEXT,
  city TEXT,
  is_new_visitor BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate the blog_content_engagement table with a single foreign key
CREATE TABLE portfolio.blog_content_engagement (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  scroll_depth INTEGER,
  element_type TEXT,
  element_id TEXT,
  interaction_type TEXT,
  time_spent_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate the indexes
CREATE INDEX IF NOT EXISTS idx_audience_post_id ON portfolio.blog_audience_data(post_id);
CREATE INDEX IF NOT EXISTS idx_audience_device ON portfolio.blog_audience_data(device_type);
CREATE INDEX IF NOT EXISTS idx_audience_country ON portfolio.blog_audience_data(country);
CREATE INDEX IF NOT EXISTS idx_audience_created_at ON portfolio.blog_audience_data(created_at);

CREATE INDEX IF NOT EXISTS idx_engagement_post_id ON portfolio.blog_content_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_engagement_element_type ON portfolio.blog_content_engagement(element_type);
CREATE INDEX IF NOT EXISTS idx_engagement_created_at ON portfolio.blog_content_engagement(created_at);

-- Restore the data
INSERT INTO portfolio.blog_audience_data
SELECT * FROM temp_blog_audience_data;

INSERT INTO portfolio.blog_content_engagement
SELECT * FROM temp_blog_content_engagement;

-- Add comments for documentation
COMMENT ON TABLE portfolio.blog_audience_data IS 'Stores audience data for blog posts including device, browser, and location information';
COMMENT ON TABLE portfolio.blog_content_engagement IS 'Tracks user engagement with blog content including scroll depth and element interactions';
