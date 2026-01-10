-- Database Setup Script for Rarity Runner
-- This script creates the database and initial schema

-- Create database (run this separately as it can't be in a transaction)
-- You need to run this command manually from your PostgreSQL client:
--
-- Option 1: Using psql command line:
-- psql -U tonkawzaa -h localhost -p 5432 -c "CREATE DATABASE rarity_runner;"
--
-- Option 2: Using PostgreSQL GUI (pgAdmin, DBeaver, etc.):
-- CREATE DATABASE rarity_runner;
--
-- Option 3: Using Docker if PostgreSQL is in Docker:
-- docker exec -it <container_name> psql -U tonkawzaa -c "CREATE DATABASE rarity_runner;"

-- After creating the database, you can run additional setup queries here
-- For example:

-- Create a sample users table (optional, for demonstration)
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY,
--   email VARCHAR(255) UNIQUE NOT NULL,
--   name VARCHAR(255),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Create updated_at trigger function (optional)
-- CREATE OR REPLACE FUNCTION trigger_set_timestamp()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
