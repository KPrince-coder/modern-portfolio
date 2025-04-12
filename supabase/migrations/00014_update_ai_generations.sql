-- Add a prompt_type column to ai_generations table for easier filtering
ALTER TABLE portfolio.ai_generations ADD COLUMN IF NOT EXISTS prompt_type VARCHAR(50);

-- Update existing records based on related prompt
UPDATE portfolio.ai_generations g
SET prompt_type = p.prompt_type
FROM portfolio.ai_prompts p
WHERE g.prompt_id = p.id;

-- Create an index on the new column
CREATE INDEX IF NOT EXISTS idx_ai_generations_prompt_type ON portfolio.ai_generations(prompt_type);

-- Add a comment for documentation
COMMENT ON COLUMN portfolio.ai_generations.prompt_type IS 'Type of content generated, copied from related prompt for easier filtering';
