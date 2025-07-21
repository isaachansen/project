import vehicleData from "./all-tesla-models-research.json";
import {
  TeslaVehicleDatabase,
  TeslaModelName,
  Trim,
  ChargerSpecs,
} from "../types/tesla-models";

const db = vehicleData as TeslaVehicleDatabase;

export const modelNames = Object.keys(db.tesla_data) as TeslaModelName[];

export function getYearsForModel(model: TeslaModelName): string[] {
  if (!db.tesla_data[model]) return [];
  return Object.keys(db.tesla_data[model]).sort(
    (a, b) => Number(b) - Number(a)
  );
}

export function getTrimsForModelYear(
  model: TeslaModelName,
  year: string
): Trim[] {
  if (!db.tesla_data[model] || !db.tesla_data[model][year]) return [];
  return db.tesla_data[model][year].trims;
}

export function getTrimData(
  model: TeslaModelName,
  year: string,
  trimName: string
): Trim | null {
  const trims = getTrimsForModelYear(model, year);
  return trims.find((t) => t.name === trimName) || null;
}

// Add function to retrieve charger specs from the database
export function getChargerSpecs(): ChargerSpecs {
  return db.charging_infrastructure.charger_specs;
}
