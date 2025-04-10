-- Create personal_data table to store portfolio owner information
CREATE TABLE IF NOT EXISTS portfolio.personal_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    profile_image_url TEXT,
    resume_url TEXT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    meta_title VARCHAR(255), -- For SEO optimization
    meta_description TEXT,   -- For SEO optimization
    meta_keywords TEXT,      -- For SEO optimization
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published BOOLEAN NOT NULL DEFAULT FALSE,
    seo_slug VARCHAR(255) UNIQUE,
    structured_data JSONB,   -- For structured data (JSON-LD)
    
    -- Ensure only one active personal profile
    CONSTRAINT single_active_profile CHECK (
        NOT published OR 
        (published AND id = (SELECT id FROM portfolio.personal_data WHERE published = TRUE LIMIT 1))
    )
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_personal_data_published ON portfolio.personal_data(published);

-- Add function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION portfolio.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update the updated_at column
CREATE TRIGGER update_personal_data_updated_at
BEFORE UPDATE ON portfolio.personal_data
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.personal_data IS 'Stores personal information about the portfolio owner';
COMMENT ON COLUMN portfolio.personal_data.meta_title IS 'Custom title for SEO purposes';
COMMENT ON COLUMN portfolio.personal_data.meta_description IS 'Custom description for SEO purposes';
COMMENT ON COLUMN portfolio.personal_data.meta_keywords IS 'Keywords for SEO purposes';
COMMENT ON COLUMN portfolio.personal_data.seo_slug IS 'URL-friendly slug for SEO purposes';
COMMENT ON COLUMN portfolio.personal_data.structured_data IS 'JSON-LD structured data for rich snippets';
