/*
  # Tesla Charging Queue Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Supabase auth.users
      - `email` (text, unique)
      - `name` (text)
      - `tesla_model` (text)
      - `tesla_year` (integer)
      - `preferred_charge_percentage` (integer, default 80)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `charging_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `charger_id` (integer) - 1 or 2 for the two chargers
      - `current_charge` (integer) - starting battery percentage
      - `target_charge` (integer) - target battery percentage
      - `start_time` (timestamp)
      - `estimated_end_time` (timestamp)
      - `status` (text) - 'charging' or 'completed'
      - `created_at` (timestamp)
    
    - `queue_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `current_charge` (integer)
      - `target_charge` (integer)
      - `position` (integer) - queue position
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can read/write their own data
    - All users can read charging sessions and queue (for display purposes)
    - Only authenticated users can access the system

  3. Indexes
    - Performance indexes on frequently queried columns
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  tesla_model text NOT NULL,
  tesla_year integer NOT NULL,
  preferred_charge_percentage integer DEFAULT 80 CHECK (preferred_charge_percentage >= 50 AND preferred_charge_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create charging_sessions table
CREATE TABLE IF NOT EXISTS charging_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charger_id integer NOT NULL CHECK (charger_id IN (1, 2)),
  current_charge integer NOT NULL CHECK (current_charge >= 0 AND current_charge <= 100),
  target_charge integer NOT NULL CHECK (target_charge >= 0 AND target_charge <= 100),
  start_time timestamptz DEFAULT now(),
  estimated_end_time timestamptz NOT NULL,
  status text DEFAULT 'charging' CHECK (status IN ('charging', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create queue_entries table
CREATE TABLE IF NOT EXISTS queue_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_charge integer NOT NULL CHECK (current_charge >= 0 AND current_charge <= 100),
  target_charge integer NOT NULL CHECK (target_charge >= 0 AND target_charge <= 100),
  position integer NOT NULL CHECK (position > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Charging sessions policies
CREATE POLICY "Anyone can read charging sessions"
  ON charging_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own charging sessions"
  ON charging_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charging sessions"
  ON charging_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Queue entries policies
CREATE POLICY "Anyone can read queue entries"
  ON queue_entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own queue entries"
  ON queue_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue entries"
  ON queue_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue entries"
  ON queue_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_charging_sessions_user_id ON charging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_charger_id ON charging_sessions(charger_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_status ON charging_sessions(status);
CREATE INDEX IF NOT EXISTS idx_queue_entries_user_id ON queue_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_position ON queue_entries(position);

-- Create updated_at trigger for users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one active charging session per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_charging_session 
  ON charging_sessions(user_id) 
  WHERE status = 'charging';

-- Ensure only one queue entry per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_queue_entry 
  ON queue_entries(user_id);

-- Ensure only one charging session per charger at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_charger_session 
  ON charging_sessions(charger_id) 
  WHERE status = 'charging';