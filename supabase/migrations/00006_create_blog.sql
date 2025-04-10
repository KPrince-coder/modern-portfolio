-- Create blog_categories table
CREATE TABLE IF NOT EXISTS portfolio.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS portfolio.blog_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS portfolio.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    summary TEXT, -- Short summary for previews
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category_id UUID REFERENCES portfolio.blog_categories(id) ON DELETE SET NULL,
    reading_time_minutes INTEGER,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) CHECK (status IN ('draft', 'published', 'archived')) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    meta_title VARCHAR(255), -- For SEO optimization
    meta_description TEXT,   -- For SEO optimization
    meta_keywords TEXT,      -- For SEO optimization
    structured_data JSONB,   -- For structured data (JSON-LD)
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE, -- Flag for AI-generated content
    ai_prompt TEXT, -- The prompt used to generate the content
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure published_at is set when status is published
    CONSTRAINT valid_published_status CHECK (
        (status != 'published') OR
        (status = 'published' AND published_at IS NOT NULL)
    )
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS portfolio.blog_post_tags (
    post_id UUID NOT NULL REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES portfolio.blog_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- Create blog_comments table
CREATE TABLE IF NOT EXISTS portfolio.blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES portfolio.blog_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES portfolio.blog_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(255),
    content TEXT NOT NULL,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON portfolio.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON portfolio.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON portfolio.blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON portfolio.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON portfolio.blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON portfolio.blog_post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON portfolio.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON portfolio.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_is_approved ON portfolio.blog_comments(is_approved);

-- Add GIN index for full-text search on blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON portfolio.blog_posts 
USING GIN ((setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
            setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(content, '')), 'C')));

-- Add triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON portfolio.blog_categories
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_blog_tags_updated_at
BEFORE UPDATE ON portfolio.blog_tags
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON portfolio.blog_posts
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON portfolio.blog_comments
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.blog_categories IS 'Categories for blog posts';
COMMENT ON TABLE portfolio.blog_tags IS 'Tags for blog posts';
COMMENT ON TABLE portfolio.blog_posts IS 'Blog posts';
COMMENT ON TABLE portfolio.blog_post_tags IS 'Junction table for blog posts and tags';
COMMENT ON TABLE portfolio.blog_comments IS 'Comments on blog posts';
COMMENT ON COLUMN portfolio.blog_posts.reading_time_minutes IS 'Estimated reading time in minutes';
COMMENT ON COLUMN portfolio.blog_posts.meta_title IS 'Custom title for SEO purposes';
COMMENT ON COLUMN portfolio.blog_posts.meta_description IS 'Custom description for SEO purposes';
COMMENT ON COLUMN portfolio.blog_posts.meta_keywords IS 'Keywords for SEO purposes';
COMMENT ON COLUMN portfolio.blog_posts.structured_data IS 'JSON-LD structured data for rich snippets';
COMMENT ON COLUMN portfolio.blog_posts.ai_generated IS 'Whether the content was generated by AI';
COMMENT ON COLUMN portfolio.blog_posts.ai_prompt IS 'The prompt used to generate the content';
