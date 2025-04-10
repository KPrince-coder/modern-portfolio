-- Create ai_prompts table
CREATE TABLE IF NOT EXISTS portfolio.ai_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_template TEXT NOT NULL,
    prompt_type VARCHAR(50) NOT NULL, -- e.g., 'blog_post', 'email_response'
    parameters JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ai_generations table
CREATE TABLE IF NOT EXISTS portfolio.ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id UUID REFERENCES portfolio.ai_prompts(id) ON DELETE SET NULL,
    prompt_text TEXT NOT NULL,
    response TEXT NOT NULL,
    model VARCHAR(255) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}',
    tokens_used INTEGER,
    generation_time_ms INTEGER,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ai_feedback table
CREATE TABLE IF NOT EXISTS portfolio.ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID NOT NULL REFERENCES portfolio.ai_generations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create ai_message_templates table
CREATE TABLE IF NOT EXISTS portfolio.ai_message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_prompts_prompt_type ON portfolio.ai_prompts(prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_generations_prompt_id ON portfolio.ai_generations(prompt_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_user_id ON portfolio.ai_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created_at ON portfolio.ai_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_generation_id ON portfolio.ai_feedback(generation_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_rating ON portfolio.ai_feedback(rating);

-- Add triggers for updated_at
CREATE TRIGGER update_ai_prompts_updated_at
BEFORE UPDATE ON portfolio.ai_prompts
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_ai_message_templates_updated_at
BEFORE UPDATE ON portfolio.ai_message_templates
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.ai_prompts IS 'Templates for AI prompts';
COMMENT ON TABLE portfolio.ai_generations IS 'Records of AI content generations';
COMMENT ON TABLE portfolio.ai_feedback IS 'User feedback on AI generations';
COMMENT ON TABLE portfolio.ai_message_templates IS 'Templates for AI-generated messages';
COMMENT ON COLUMN portfolio.ai_prompts.prompt_template IS 'Template with placeholders for dynamic content';
COMMENT ON COLUMN portfolio.ai_prompts.prompt_type IS 'Type of content to generate';
COMMENT ON COLUMN portfolio.ai_prompts.parameters IS 'JSON object with default parameters';
COMMENT ON COLUMN portfolio.ai_generations.parameters IS 'JSON object with parameters used for generation';
COMMENT ON COLUMN portfolio.ai_generations.tokens_used IS 'Number of tokens used for generation';
COMMENT ON COLUMN portfolio.ai_generations.generation_time_ms IS 'Time taken for generation in milliseconds';
COMMENT ON COLUMN portfolio.ai_message_templates.variables IS 'JSON array of variable names used in the template';
