-- Create roles table
CREATE TABLE IF NOT EXISTS portfolio.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS portfolio.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES portfolio.roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS portfolio.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS portfolio.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '{}',
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON portfolio.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON portfolio.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON portfolio.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON portfolio.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON portfolio.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON portfolio.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON portfolio.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON portfolio.api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON portfolio.api_keys(expires_at);

-- Add triggers for updated_at
CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON portfolio.roles
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON portfolio.api_keys
FOR EACH ROW
EXECUTE FUNCTION portfolio.update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE portfolio.roles IS 'User roles for authorization';
COMMENT ON TABLE portfolio.user_roles IS 'Junction table for users and roles';
COMMENT ON TABLE portfolio.audit_logs IS 'Logs of user actions for auditing';
COMMENT ON TABLE portfolio.api_keys IS 'API keys for external access';
COMMENT ON COLUMN portfolio.roles.permissions IS 'JSON object with permission settings';
COMMENT ON COLUMN portfolio.audit_logs.action IS 'Action performed (e.g., create, update, delete)';
COMMENT ON COLUMN portfolio.audit_logs.entity_type IS 'Type of entity affected (e.g., blog_post, project)';
COMMENT ON COLUMN portfolio.audit_logs.entity_id IS 'ID of the entity affected';
COMMENT ON COLUMN portfolio.audit_logs.old_values IS 'Previous values before the action';
COMMENT ON COLUMN portfolio.audit_logs.new_values IS 'New values after the action';
COMMENT ON COLUMN portfolio.api_keys.key_hash IS 'Hashed API key for security';
COMMENT ON COLUMN portfolio.api_keys.permissions IS 'JSON object with permission settings';
