-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role TEXT NOT NULL
);

-- Create applications table
CREATE TABLE applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT,
  phone_number TEXT,
  completed_course TEXT NOT NULL,
  counselor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  planned_courses TEXT[] NOT NULL,
  preferred_colleges TEXT[],
  preferred_locations TEXT[] NOT NULL,
  application_status TEXT NOT NULL DEFAULT 'pending'
);

-- Create application status enum
CREATE TYPE application_status AS ENUM (
  'pending',
  'review',
  'interview',
  'accepted',
  'rejected',
  'deferred'
);

-- Create education level enum
CREATE TYPE education_level AS ENUM (
  'science',
  'commerce',
  'arts',
  'vocational',
  'other'
);

-- Create function for getting application status counts
CREATE OR REPLACE FUNCTION get_application_status_counts(
  agent_filter UUID DEFAULT NULL,
  counselor_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  application_status TEXT,
  count BIGINT
)
LANGUAGE SQL
AS $$
  SELECT 
    application_status,
    COUNT(*) as count
  FROM 
    applications
  WHERE
    (agent_filter IS NULL OR agent_id = agent_filter) AND
    (counselor_filter IS NULL OR counselor_id = counselor_filter)
  GROUP BY 
    application_status;
$$;