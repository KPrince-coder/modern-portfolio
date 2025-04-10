-- Create project_categories table
CREATE TABLE IF NOT EXISTS portfolio.project_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS portfolio.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT, -- Short summary for previews
    thumbnail_url TEXT,
    category_id UUID REFERENCES portfolio.project_categories(id) ON DELETE SET NULL,
    technologies TEXT[] NOT NULL, -- Array of technologies used
    demo_url TEXT,
    code_url TEXT,
    case_study_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) CHECK (status IN ('draft', 'published', 'archived')) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    meta_title VARCHAR(255), -- For SEO optimization
    meta_description TEXT,   -- For SEO optimization
    meta_keywords TEXT,      -- For SEO optimization
    structured_data JSONB,   -- For structured data (JSON-LD)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure published_at is set when status is published
    CONSTRAINT valid_published_status CHECK (
        (status != 'published') OR
        (status = 'published' AND published_at IS NOT NULL)
    )
);

-- Create project_images table for project galleries
CREATE TABLE IF NOT EXISTS portfolio.project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES portfolio.projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255) NOT NULL, -- For accessibility
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create project_testimonials table
CREATE TABLE IF NOT EXISTS portfolio.project_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES portfolio.projects(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_title VARCHAR(255),
    author_company VARCHAR(255),
    author_image_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON portfolio.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON portfolio.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON portfolio.projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON portfolio.projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_published_at ON portfolio.projects(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON portfolio.project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_testimonials_project_id ON portfolio.project_testimonials(project_id);

-- Add GIN index for full-text search on projects
CREATE INDEX IF NOT EXISTS idx_projects_search ON portfolio.projects 
USING GIN ((setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
            setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(content, '')), 'C')));

-- Add GIN index for technologies array
CREATE INDEX IF NOT EXISTS idx_projects_technologies ON portfolio.projects USING GIN(technologies);

-- Add triggers for updated_at
CREATE TRIGGER update_project_categories_updated_at
BEFORE UPDATE ON portfolio.project_categories
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON portfolio.projects
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_project_images_updated_at
BEFORE UPDATE ON portfolio.project_images
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_project_testimonials_updated_at
BEFORE UPDATE ON portfolio.project_testimonials
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.project_categories IS 'Categories for grouping projects';
COMMENT ON TABLE portfolio.projects IS 'Portfolio projects';
COMMENT ON TABLE portfolio.project_images IS 'Images for project galleries';
COMMENT ON TABLE portfolio.project_testimonials IS 'Client testimonials for projects';
COMMENT ON COLUMN portfolio.projects.technologies IS 'Array of technologies used in this project';
COMMENT ON COLUMN portfolio.projects.meta_title IS 'Custom title for SEO purposes';
COMMENT ON COLUMN portfolio.projects.meta_description IS 'Custom description for SEO purposes';
COMMENT ON COLUMN portfolio.projects.meta_keywords IS 'Keywords for SEO purposes';
COMMENT ON COLUMN portfolio.projects.structured_data IS 'JSON-LD structured data for rich snippets';
COMMENT ON COLUMN portfolio.project_images.alt_text IS 'Alternative text for accessibility';
