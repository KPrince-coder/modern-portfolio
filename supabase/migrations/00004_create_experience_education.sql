-- Create work_experience table
CREATE TABLE IF NOT EXISTS portfolio.work_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE, -- NULL means current position
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    company_url TEXT,
    company_logo_url TEXT,
    technologies TEXT[], -- Array of technologies used
    achievements TEXT[], -- Array of key achievements
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure end_date is after start_date if provided
    CONSTRAINT valid_work_dates CHECK (end_date IS NULL OR end_date >= start_date),
    
    -- Ensure is_current is true only if end_date is null
    CONSTRAINT valid_current_job CHECK (
        (is_current = TRUE AND end_date IS NULL) OR
        (is_current = FALSE)
    )
);

-- Create education table
CREATE TABLE IF NOT EXISTS portfolio.education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    institution_url TEXT,
    institution_logo_url TEXT,
    achievements TEXT[], -- Array of key achievements
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure end_date is after start_date if provided
    CONSTRAINT valid_education_dates CHECK (end_date IS NULL OR end_date >= start_date),
    
    -- Ensure is_current is true only if end_date is null
    CONSTRAINT valid_current_education CHECK (
        (is_current = TRUE AND end_date IS NULL) OR
        (is_current = FALSE)
    )
);

-- Create interests table
CREATE TABLE IF NOT EXISTS portfolio.interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_work_experience_display_order ON portfolio.work_experience(display_order);
CREATE INDEX IF NOT EXISTS idx_work_experience_start_date ON portfolio.work_experience(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_work_experience_is_current ON portfolio.work_experience(is_current);

CREATE INDEX IF NOT EXISTS idx_education_display_order ON portfolio.education(display_order);
CREATE INDEX IF NOT EXISTS idx_education_start_date ON portfolio.education(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_education_is_current ON portfolio.education(is_current);

CREATE INDEX IF NOT EXISTS idx_interests_display_order ON portfolio.interests(display_order);

-- Add triggers for updated_at
CREATE TRIGGER update_work_experience_updated_at
BEFORE UPDATE ON portfolio.work_experience
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_education_updated_at
BEFORE UPDATE ON portfolio.education
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_interests_updated_at
BEFORE UPDATE ON portfolio.interests
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.work_experience IS 'Work experience of the portfolio owner';
COMMENT ON TABLE portfolio.education IS 'Educational background of the portfolio owner';
COMMENT ON TABLE portfolio.interests IS 'Personal interests and hobbies of the portfolio owner';
COMMENT ON COLUMN portfolio.work_experience.technologies IS 'Array of technologies used in this position';
COMMENT ON COLUMN portfolio.work_experience.achievements IS 'Key achievements during this position';
COMMENT ON COLUMN portfolio.education.achievements IS 'Key achievements during this education';
