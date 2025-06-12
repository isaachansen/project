-- Enable realtime for charging queue tables
-- This allows all users to see real-time updates when charging sessions start/stop
-- and when people join/leave the queue

-- Enable realtime on charging_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE charging_sessions;

-- Enable realtime on queue_entries table  
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;

-- Enable realtime on users table (for profile updates)
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Add comments for documentation
COMMENT ON TABLE charging_sessions IS 'Realtime enabled for live charging status updates';
COMMENT ON TABLE queue_entries IS 'Realtime enabled for live queue position updates';
COMMENT ON TABLE users IS 'Realtime enabled for live profile updates in queue display'; 