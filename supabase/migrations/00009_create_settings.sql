-- Create settings table
CREATE TABLE IF NOT EXISTS portfolio.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create themes table
CREATE TABLE IF NOT EXISTS portfolio.themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    colors JSONB NOT NULL,
    fonts JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create navigation_items table
CREATE TABLE IF NOT EXISTS portfolio.navigation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon TEXT,
    parent_id UUID REFERENCES portfolio.navigation_items(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_external BOOLEAN NOT NULL DEFAULT FALSE,
    requires_auth BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS portfolio.seo_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255),
    description TEXT,
    keywords TEXT,
    og_image_url TEXT,
    structured_data JSONB,
    canonical_url TEXT,
    robots_directives TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_settings_key ON portfolio.settings(key);
CREATE INDEX IF NOT EXISTS idx_themes_is_active ON portfolio.themes(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_items_parent_id ON portfolio.navigation_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_items_display_order ON portfolio.navigation_items(display_order);
CREATE INDEX IF NOT EXISTS idx_seo_settings_page_path ON portfolio.seo_settings(page_path);

-- Add triggers for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON portfolio.settings
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON portfolio.themes
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_navigation_items_updated_at
BEFORE UPDATE ON portfolio.navigation_items
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
BEFORE UPDATE ON portfolio.seo_settings
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.settings IS 'Application settings';
COMMENT ON TABLE portfolio.themes IS 'Theme configurations';
COMMENT ON TABLE portfolio.navigation_items IS 'Navigation menu items';
COMMENT ON TABLE portfolio.seo_settings IS 'SEO settings for specific pages';
COMMENT ON COLUMN portfolio.settings.key IS 'Unique key for the setting';
COMMENT ON COLUMN portfolio.settings.value IS 'JSON value for the setting';
COMMENT ON COLUMN portfolio.themes.colors IS 'JSON object with color values';
COMMENT ON COLUMN portfolio.themes.fonts IS 'JSON object with font configurations';
COMMENT ON COLUMN portfolio.seo_settings.structured_data IS 'JSON-LD structured data for rich snippets';
COMMENT ON COLUMN portfolio.seo_settings.robots_directives IS 'Directives for robots.txt';
