// Re-export database types for compatibility
import type { Database } from "./database";
export type { Database, Tables, TablesInsert, TablesUpdate } from "./database";

// Legacy type aliases for backward compatibility
export type User = Database["public"]["Tables"]["users"]["Row"];
export type ChargingSession =
  Database["public"]["Tables"]["charging_sessions"]["Row"] & {
    user: User;
  };
export type QueueEntry =
  Database["public"]["Tables"]["queue_entries"]["Row"] & {
    user: User;
  };

export interface Charger {
  id: number;
  name: string;
  is_occupied: boolean;
  current_session?: ChargingSession;
}

export type TeslaModel =
  | "Model S"
  | "Model 3"
  | "Model X"
  | "Model Y"
  | "Cybertruck"
  | "Roadster";
