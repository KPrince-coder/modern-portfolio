-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- For UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- For cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- For text search using trigrams
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- For accent-insensitive text search

-- Create custom schema for our application
CREATE SCHEMA IF NOT EXISTS portfolio;

-- Set search path to include our schema
ALTER DATABASE postgres SET search_path TO public, portfolio;

-- Comment on schema for documentation
COMMENT ON SCHEMA portfolio IS 'Schema for portfolio application data';
