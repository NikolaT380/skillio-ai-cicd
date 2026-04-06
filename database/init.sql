-- Enable the pgvector extension for AI similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Users Table (HR / Public Admin)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin', -- e.g., 'super_admin', 'hr_manager'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Token Blacklist Table (For JWT Logout)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jti VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast token validation during every API request
CREATE INDEX IF NOT EXISTS token_blacklist_jti_idx ON token_blacklist(jti);
-- Index for fast cleanup of expired tokens
CREATE INDEX IF NOT EXISTS token_blacklist_expires_at_idx ON token_blacklist(expires_at);

-- Job Postings Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    mandatory_criteria TEXT[] DEFAULT '{}',
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    skills TEXT[] DEFAULT '{}',
    experience_years INTEGER DEFAULT 0,
    education TEXT,
    cv_url VARCHAR(255),
    raw_text TEXT,
    embedding vector(1536),
    match_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS candidates_job_id_idx ON candidates(job_id);
-- Note: IVFFlat index works best after you have some data.
-- For a small starter DB, a simple HNSW or no index is also fine, but keeping yours:
-- CREATE INDEX IF NOT EXISTS candidates_embedding_idx ON candidates USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);