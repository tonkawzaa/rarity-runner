-- Strava Connections Table
-- Stores Strava OAuth tokens and connection info for each user

CREATE TABLE IF NOT EXISTS strava_connections (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_user_id BIGINT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  athlete_data JSONB, -- Store athlete profile data from Strava
  connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id) -- One Strava connection per user
);

-- Running Activities Table
-- Stores running activity data from Strava

CREATE TABLE IF NOT EXISTS running_activities (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT NOT NULL UNIQUE,
  name VARCHAR(500),
  distance DECIMAL(10, 2), -- in meters
  moving_time INTEGER, -- in seconds
  elapsed_time INTEGER, -- in seconds
  total_elevation_gain DECIMAL(10, 2), -- in meters
  activity_type VARCHAR(50), -- Run, Trail Run, etc.
  start_date TIMESTAMP,
  start_date_local TIMESTAMP,
  timezone VARCHAR(100),
  average_speed DECIMAL(10, 2), -- in meters/second
  max_speed DECIMAL(10, 2), -- in meters/second
  average_heartrate DECIMAL(10, 2),
  max_heartrate INTEGER,
  calories DECIMAL(10, 2),
  map_polyline TEXT, -- Encoded polyline for route visualization
  raw_data JSONB, -- Store full Strava activity JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_strava_connections_user_id ON strava_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_running_activities_user_id ON running_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_running_activities_start_date ON running_activities(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_running_activities_strava_id ON running_activities(strava_activity_id);

-- Update trigger for strava_connections
DROP TRIGGER IF EXISTS set_timestamp_strava_connections ON strava_connections;
CREATE TRIGGER set_timestamp_strava_connections
BEFORE UPDATE ON strava_connections
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Update trigger for running_activities
DROP TRIGGER IF EXISTS set_timestamp_running_activities ON running_activities;
CREATE TRIGGER set_timestamp_running_activities
BEFORE UPDATE ON running_activities
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();
