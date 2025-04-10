-- Create contact_messages table
CREATE TABLE IF NOT EXISTS portfolio.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    ip_address VARCHAR(45), -- IPv4 or IPv6 address
    user_agent TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_spam BOOLEAN NOT NULL DEFAULT FALSE,
    ai_response TEXT, -- AI-generated response
    ai_response_sent BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create social_links table
CREATE TABLE IF NOT EXISTS portfolio.social_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON portfolio.contact_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_archived ON portfolio.contact_messages(is_archived);
CREATE INDEX IF NOT EXISTS idx_contact_messages_is_spam ON portfolio.contact_messages(is_spam);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON portfolio.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_links_display_order ON portfolio.social_links(display_order);
CREATE INDEX IF NOT EXISTS idx_social_links_is_featured ON portfolio.social_links(is_featured);

-- Add triggers for updated_at
CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON portfolio.contact_messages
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON portfolio.social_links
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.contact_messages IS 'Messages received through the contact form';
COMMENT ON TABLE portfolio.social_links IS 'Social media links';
COMMENT ON COLUMN portfolio.contact_messages.ip_address IS 'IP address of the sender for spam prevention';
COMMENT ON COLUMN portfolio.contact_messages.user_agent IS 'Browser user agent of the sender';
COMMENT ON COLUMN portfolio.contact_messages.ai_response IS 'AI-generated response to the message';
COMMENT ON COLUMN portfolio.contact_messages.ai_response_sent IS 'Whether the AI response has been sent';
