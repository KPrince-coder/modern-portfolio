-- Create page_views table
CREATE TABLE IF NOT EXISTS portfolio.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(255) NOT NULL,
    page_title VARCHAR(255),
    referrer TEXT,
    user_agent TEXT,
    ip_address VARCHAR(45), -- IPv4 or IPv6 address
    session_id VARCHAR(255),
    visitor_id VARCHAR(255),
    device_type VARCHAR(50),
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table for tracking user interactions
CREATE TABLE IF NOT EXISTS portfolio.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(255) NOT NULL,
    event_category VARCHAR(255),
    event_label VARCHAR(255),
    event_value INTEGER,
    page_path VARCHAR(255) NOT NULL,
    element_id VARCHAR(255),
    element_class VARCHAR(255),
    element_text TEXT,
    session_id VARCHAR(255),
    visitor_id VARCHAR(255),
    ip_address VARCHAR(45), -- IPv4 or IPv6 address
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create time_on_page table
CREATE TABLE IF NOT EXISTS portfolio.time_on_page (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(255),
    time_seconds INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS portfolio.social_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'blog_post', 'project', etc.
    content_id UUID NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'facebook', etc.
    visitor_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON portfolio.page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON portfolio.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON portfolio.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON portfolio.page_views(visitor_id);

CREATE INDEX IF NOT EXISTS idx_events_event_type ON portfolio.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_page_path ON portfolio.events(page_path);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON portfolio.events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON portfolio.events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_visitor_id ON portfolio.events(visitor_id);

CREATE INDEX IF NOT EXISTS idx_time_on_page_page_path ON portfolio.time_on_page(page_path);
CREATE INDEX IF NOT EXISTS idx_time_on_page_session_id ON portfolio.time_on_page(session_id);
CREATE INDEX IF NOT EXISTS idx_time_on_page_visitor_id ON portfolio.time_on_page(visitor_id);

CREATE INDEX IF NOT EXISTS idx_social_shares_content_type_id ON portfolio.social_shares(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON portfolio.social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_created_at ON portfolio.social_shares(created_at);

-- Add comments for documentation
COMMENT ON TABLE portfolio.page_views IS 'Tracks page views';
COMMENT ON TABLE portfolio.events IS 'Tracks user interactions';
COMMENT ON TABLE portfolio.time_on_page IS 'Tracks time spent on pages';
COMMENT ON TABLE portfolio.social_shares IS 'Tracks social media shares';
COMMENT ON COLUMN portfolio.page_views.session_id IS 'Unique identifier for the user session';
COMMENT ON COLUMN portfolio.page_views.visitor_id IS 'Unique identifier for the visitor';
COMMENT ON COLUMN portfolio.events.event_type IS 'Type of event (e.g., click, scroll, form_submit)';
COMMENT ON COLUMN portfolio.events.event_category IS 'Category of the event (e.g., navigation, content, form)';
COMMENT ON COLUMN portfolio.social_shares.content_type IS 'Type of content being shared (e.g., blog_post, project)';
COMMENT ON COLUMN portfolio.social_shares.content_id IS 'ID of the content being shared';
