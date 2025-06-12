export interface User {
  id: string;
  email: string;
  name: string;
  tesla_model: string;
  tesla_year: number;
  preferred_charge_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface ChargingSession {
  id: string;
  user_id: string;
  charger_id: number;
  current_charge: number;
  target_charge: number;
  start_time: string;
  estimated_end_time: string;
  status: 'charging' | 'completed';
  created_at: string;
}

export interface QueueEntry {
  id: string;
  user_id: string;
  current_charge: number;
  target_charge: number;
  position: number;
  created_at: string;
  user?: User;
}

export interface Charger {
  id: number;
  name: string;
  is_occupied: boolean;
  current_session?: ChargingSession & { user?: User };
}

export type TeslaModel = 'Model S' | 'Model 3' | 'Model X' | 'Model Y' | 'Cybertruck' | 'Roadster';