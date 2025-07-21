CREATE POLICY "Users can delete own charging session"
  ON charging_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 