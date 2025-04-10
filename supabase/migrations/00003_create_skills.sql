-- Create skill_categories table
CREATE TABLE IF NOT EXISTS portfolio.skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS portfolio.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT,
    category_id UUID REFERENCES portfolio.skill_categories(id) ON DELETE SET NULL,
    level INTEGER CHECK (level >= 1 AND level <= 5), -- Skill proficiency level (1-5)
    type VARCHAR(50) CHECK (type IN ('technical', 'soft')), -- Type of skill
    display_order INTEGER NOT NULL DEFAULT 0,
    years_experience NUMERIC(4,1), -- Years of experience with this skill
    is_featured BOOLEAN NOT NULL DEFAULT FALSE, -- Whether to feature on homepage
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_skills_category_id ON portfolio.skills(category_id);
CREATE INDEX IF NOT EXISTS idx_skills_type ON portfolio.skills(type);
CREATE INDEX IF NOT EXISTS idx_skills_is_featured ON portfolio.skills(is_featured);
CREATE INDEX IF NOT EXISTS idx_skills_display_order ON portfolio.skills(display_order);

-- Add triggers for updated_at
CREATE TRIGGER update_skill_categories_updated_at
BEFORE UPDATE ON portfolio.skill_categories
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON portfolio.skills
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.skill_categories IS 'Categories for grouping skills';
COMMENT ON TABLE portfolio.skills IS 'Skills of the portfolio owner';
COMMENT ON COLUMN portfolio.skills.level IS 'Skill proficiency level from 1 to 5';
COMMENT ON COLUMN portfolio.skills.type IS 'Type of skill: technical or soft';
COMMENT ON COLUMN portfolio.skills.years_experience IS 'Years of experience with this skill';
COMMENT ON COLUMN portfolio.skills.is_featured IS 'Whether to feature this skill on the homepage';
