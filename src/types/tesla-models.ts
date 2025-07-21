export type BatteryChemistry =
  | "NCA"
  | "LFP"
  | "NMC"
  | "Li-ion"
  | "Advanced Li-ion";

export interface ChargerSpecs {
  amperage: number;
  voltage: number;
  power_rating: string;
  actual_power: string;
  effective_power: string;
  efficiency_factor: number;
}

export interface ChargingInfrastructure {
  charger_specs: ChargerSpecs;
}

export interface Trim {
  name: string;
  battery_capacity_kwh: number;
  charging_time_hours: number;
}

export interface YearData {
  trims: Trim[];
}

export type TeslaModelName = "model_s" | "model_3" | "model_x" | "model_y";

export interface TeslaData {
  model_s: Record<string, YearData>;
  model_3: Record<string, YearData>;
  model_x: Record<string, YearData>;
  model_y: Record<string, YearData>;
}

export interface TeslaVehicleDatabase {
  charging_infrastructure: ChargingInfrastructure;
  tesla_data: TeslaData;
}
