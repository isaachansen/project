import vehicleData from "./all-tesla-models-research.json" with { type: "json" };
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
  const modelData = db.tesla_data[model];
  if (!modelData) return null;

  const yearData = modelData[year];
  if (!yearData) return null;

  const trim = yearData.trims.find((t) => t.name === trimName);
  return trim || null;
}

export function getChargerSpecs(): ChargerSpecs {
  return db.charging_infrastructure.charger_specs;
}
