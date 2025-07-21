import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  TeslaVehicleDatabase,
  TeslaModelName,
  Trim,
  ChargerSpecs,
} from "../types/tesla-models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vehicleData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "all-tesla-models-research.json"),
    "utf-8"
  )
) as TeslaVehicleDatabase;

const db = vehicleData;

export const modelNames = Object.keys(db.tesla_data) as TeslaModelName[];

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
  // Return the global charger specs from the database
  return db.charging_infrastructure.charger_specs;
}
