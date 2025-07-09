import { TeslaModel } from "../types";

export interface TeslaVehicleData {
  model: TeslaModel;
  trim: string;
  yearStart: number;
  yearEnd: number;
  battery_kWh: number;
  charge_time_0_to_80: string;
  imageName: string;
}

export const teslaVehiclesData: TeslaVehicleData[] = [
  // Model S
  {
    model: "Model S",
    trim: "2016 (60 / 60D)",
    yearStart: 2016,
    yearEnd: 2016,
    battery_kWh: 60,
    charge_time_0_to_80: "8h 54m",
    imageName: "model-s.avif",
  },
  {
    model: "Model S",
    trim: "2016 (75 / 75D)",
    yearStart: 2016,
    yearEnd: 2016,
    battery_kWh: 72,
    charge_time_0_to_80: "10h 42m",
    imageName: "model-s.avif",
  },
  {
    model: "Model S",
    trim: "2016 (90D)",
    yearStart: 2016,
    yearEnd: 2016,
    battery_kWh: 86,
    charge_time_0_to_80: "12h 48m",
    imageName: "model-s.avif",
  },
  {
    model: "Model S",
    trim: "2016-2020 (100D / P100D)",
    yearStart: 2016,
    yearEnd: 2020,
    battery_kWh: 98,
    charge_time_0_to_80: "14h 36m",
    imageName: "model-s.avif",
  },
  {
    model: "Model S",
    trim: "2021-2025 (Long Range)",
    yearStart: 2021,
    yearEnd: 2025,
    battery_kWh: 100,
    charge_time_0_to_80: "14h 54m",
    imageName: "model-s.avif",
  },
  {
    model: "Model S",
    trim: "2021-2025 (Plaid)",
    yearStart: 2021,
    yearEnd: 2025,
    battery_kWh: 100,
    charge_time_0_to_80: "14h 54m",
    imageName: "model-s.avif",
  },

  // Model 3 - Use old image for vehicles that don't include 2025
  {
    model: "Model 3",
    trim: "2017-2020 (Std Range / SR+)",
    yearStart: 2017,
    yearEnd: 2020,
    battery_kWh: 50,
    charge_time_0_to_80: "7h 24m",
    imageName: "model-3-old.png", // Doesn't include 2025, use old image
  },
  {
    model: "Model 3",
    trim: "2021-2025 (RWD / Std Range)",
    yearStart: 2021,
    yearEnd: 2025,
    battery_kWh: 58,
    charge_time_0_to_80: "8h 36m",
    imageName: "model-3-new.avif", // Includes 2025, use new image
  },
  {
    model: "Model 3",
    trim: "2018-2025 (Long Range)",
    yearStart: 2018,
    yearEnd: 2025,
    battery_kWh: 79,
    charge_time_0_to_80: "11h 48m",
    imageName: "model-3-new.avif", // Includes 2025, use new image
  },
  {
    model: "Model 3",
    trim: "2018-2025 (Performance)",
    yearStart: 2018,
    yearEnd: 2025,
    battery_kWh: 79,
    charge_time_0_to_80: "11h 48m",
    imageName: "model-3-new.avif", // Includes 2025, use new image
  },

  // Model X
  {
    model: "Model X",
    trim: "2016 (60D)",
    yearStart: 2016,
    yearEnd: 2016,
    battery_kWh: 60,
    charge_time_0_to_80: "8h 54m",
    imageName: "model-x.avif",
  },
  {
    model: "Model X",
    trim: "2016 (75D)",
    yearStart: 2016,
    yearEnd: 2016,
    battery_kWh: 72,
    charge_time_0_to_80: "10h 42m",
    imageName: "model-x.avif",
  },
  {
    model: "Model X",
    trim: "2016 (90D)",
    yearStart: 2016,
    yearEnd: 2016,
    battery_kWh: 86,
    charge_time_0_to_80: "12h 48m",
    imageName: "model-x.avif",
  },
  {
    model: "Model X",
    trim: "2016-2020 (100D / P100D)",
    yearStart: 2016,
    yearEnd: 2020,
    battery_kWh: 98,
    charge_time_0_to_80: "14h 36m",
    imageName: "model-x.avif",
  },
  {
    model: "Model X",
    trim: "2021-2025 (Long Range)",
    yearStart: 2021,
    yearEnd: 2025,
    battery_kWh: 100,
    charge_time_0_to_80: "14h 54m",
    imageName: "model-x.avif",
  },
  {
    model: "Model X",
    trim: "2021-2025 (Plaid)",
    yearStart: 2021,
    yearEnd: 2025,
    battery_kWh: 100,
    charge_time_0_to_80: "14h 54m",
    imageName: "model-x.avif",
  },

  // Model Y - Use old image for vehicles that don't include 2025
  {
    model: "Model Y",
    trim: "2020-2025 (Long Range)",
    yearStart: 2020,
    yearEnd: 2025,
    battery_kWh: 79,
    charge_time_0_to_80: "11h 48m",
    imageName: "model-y-new.avif", // Includes 2025, use new image
  },
  {
    model: "Model Y",
    trim: "2020-2025 (Performance)",
    yearStart: 2020,
    yearEnd: 2025,
    battery_kWh: 79,
    charge_time_0_to_80: "11h 48m",
    imageName: "model-y-new.avif", // Includes 2025, use new image
  },
  {
    model: "Model Y",
    trim: "2022-2025 (RWD / Std Range)",
    yearStart: 2022,
    yearEnd: 2025,
    battery_kWh: 58,
    charge_time_0_to_80: "8h 36m",
    imageName: "model-y-new.avif", // Includes 2025, use new image
  },

  // Cybertruck
  {
    model: "Cybertruck",
    trim: "2024-2025 (AWD)",
    yearStart: 2024,
    yearEnd: 2025,
    battery_kWh: 123,
    charge_time_0_to_80: "18h 18m",
    imageName: "cybertruck.avif",
  },
  {
    model: "Cybertruck",
    trim: "2024-2025 (Cyberbeast)",
    yearStart: 2024,
    yearEnd: 2025,
    battery_kWh: 123,
    charge_time_0_to_80: "18h 18m",
    imageName: "cybertruck.avif",
  },
];

// Helper functions
export function getUniqueModels(): TeslaModel[] {
  const models = [...new Set(teslaVehiclesData.map((v) => v.model))];
  return models as TeslaModel[];
}

export function getVehiclesByModel(model: TeslaModel): TeslaVehicleData[] {
  return teslaVehiclesData.filter((v) => v.model === model);
}

export function getVehicleByModelAndTrim(
  model: TeslaModel,
  trim: string
): TeslaVehicleData | null {
  return (
    teslaVehiclesData.find((v) => v.model === model && v.trim === trim) || null
  );
}

// Charging calculations based on real Tesla data from Tessie
// Updated from 6.72kW to 7.00kW based on actual charging session data
const CHARGING_POWER_KW = 7.0;

// Real-world charging curve based on Tessie data analysis
// Charging rate varies by battery level and temperature
interface ChargingCurve {
  batteryLevel: number;
  chargingRatePerHour: number; // %/hour
  powerKw: number;
}

// Charging curve based on real Tesla data (7.00kW Level 2)
const TESLA_CHARGING_CURVE: ChargingCurve[] = [
  { batteryLevel: 0, chargingRatePerHour: 8.5, powerKw: 7.0 },
  { batteryLevel: 10, chargingRatePerHour: 8.2, powerKw: 7.0 },
  { batteryLevel: 20, chargingRatePerHour: 7.8, powerKw: 7.0 },
  { batteryLevel: 25, chargingRatePerHour: 6.44, powerKw: 7.0 }, // Based on actual data
  { batteryLevel: 30, chargingRatePerHour: 6.2, powerKw: 7.0 },
  { batteryLevel: 40, chargingRatePerHour: 5.8, powerKw: 7.0 },
  { batteryLevel: 50, chargingRatePerHour: 5.5, powerKw: 7.0 },
  { batteryLevel: 60, chargingRatePerHour: 5.2, powerKw: 7.0 },
  { batteryLevel: 70, chargingRatePerHour: 4.8, powerKw: 7.0 },
  { batteryLevel: 80, chargingRatePerHour: 4.2, powerKw: 7.0 },
  { batteryLevel: 90, chargingRatePerHour: 3.5, powerKw: 7.0 },
  { batteryLevel: 95, chargingRatePerHour: 2.8, powerKw: 7.0 },
  { batteryLevel: 100, chargingRatePerHour: 2.0, powerKw: 7.0 },
];

// Temperature adjustment factors based on real data
interface TemperatureEffect {
  temperatureF: number;
  chargingMultiplier: number;
}

const TEMPERATURE_EFFECTS: TemperatureEffect[] = [
  { temperatureF: 32, chargingMultiplier: 0.65 }, // Very cold
  { temperatureF: 50, chargingMultiplier: 0.85 }, // Cold
  { temperatureF: 68, chargingMultiplier: 1.0 }, // Optimal
  { temperatureF: 80, chargingMultiplier: 0.98 }, // Warm
  { temperatureF: 95, chargingMultiplier: 0.92 }, // Hot (based on real data)
  { temperatureF: 110, chargingMultiplier: 0.85 }, // Very hot
  { temperatureF: 120, chargingMultiplier: 0.75 }, // Extreme heat
];

function getChargingRateAtBatteryLevel(batteryLevel: number): number {
  // Find the closest charging curve points
  const curve = TESLA_CHARGING_CURVE;

  if (batteryLevel <= curve[0].batteryLevel) {
    return curve[0].chargingRatePerHour;
  }

  if (batteryLevel >= curve[curve.length - 1].batteryLevel) {
    return curve[curve.length - 1].chargingRatePerHour;
  }

  // Linear interpolation between curve points
  for (let i = 0; i < curve.length - 1; i++) {
    if (
      batteryLevel >= curve[i].batteryLevel &&
      batteryLevel <= curve[i + 1].batteryLevel
    ) {
      const t =
        (batteryLevel - curve[i].batteryLevel) /
        (curve[i + 1].batteryLevel - curve[i].batteryLevel);
      return (
        curve[i].chargingRatePerHour +
        t * (curve[i + 1].chargingRatePerHour - curve[i].chargingRatePerHour)
      );
    }
  }

  return 6.44; // Default to measured real-world rate
}

function getTemperatureMultiplier(temperatureF: number): number {
  const effects = TEMPERATURE_EFFECTS;

  if (temperatureF <= effects[0].temperatureF) {
    return effects[0].chargingMultiplier;
  }

  if (temperatureF >= effects[effects.length - 1].temperatureF) {
    return effects[effects.length - 1].chargingMultiplier;
  }

  // Linear interpolation between temperature points
  for (let i = 0; i < effects.length - 1; i++) {
    if (
      temperatureF >= effects[i].temperatureF &&
      temperatureF <= effects[i + 1].temperatureF
    ) {
      const t =
        (temperatureF - effects[i].temperatureF) /
        (effects[i + 1].temperatureF - effects[i].temperatureF);
      return (
        effects[i].chargingMultiplier +
        t * (effects[i + 1].chargingMultiplier - effects[i].chargingMultiplier)
      );
    }
  }

  return 1.0; // Default multiplier
}

// Enhanced charging time calculation with real-world accuracy
export function calculateChargingTime(
  batteryKwh: number,
  startPercent: number,
  targetPercent: number,
  temperatureF: number = 68 // Default to optimal temperature
): number {
  if (startPercent >= targetPercent) return 0;

  let totalMinutes = 0;
  let currentPercent = startPercent;
  const step = 0.5; // Calculate in 0.5% increments for accuracy

  const tempMultiplier = getTemperatureMultiplier(temperatureF);

  while (currentPercent < targetPercent) {
    const nextPercent = Math.min(currentPercent + step, targetPercent);
    const avgPercent = (currentPercent + nextPercent) / 2;

    const baseChargingRate = getChargingRateAtBatteryLevel(avgPercent);
    const adjustedChargingRate = baseChargingRate * tempMultiplier;

    const percentageToCharge = nextPercent - currentPercent;
    const timeForThisStep = (percentageToCharge / adjustedChargingRate) * 60; // Convert to minutes

    totalMinutes += timeForThisStep;
    currentPercent = nextPercent;
  }

  return Math.ceil(totalMinutes);
}

// Enhanced estimated end time calculation
export function calculateEstimatedEndTime(
  batteryKwh: number,
  startPercent: number,
  targetPercent: number,
  temperatureF: number = 68
): Date {
  const chargingTimeMinutes = calculateChargingTime(
    batteryKwh,
    startPercent,
    targetPercent,
    temperatureF
  );
  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + chargingTimeMinutes);
  return endTime;
}

// Real-time charging progress calculation
export function calculateCurrentBatteryLevel(
  startPercent: number,
  targetPercent: number,
  startTime: Date,
  currentTime: Date = new Date(),
  temperatureF: number = 68
): number {
  if (startPercent >= targetPercent) return targetPercent;

  const elapsedMinutes =
    (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
  let currentPercent = startPercent;
  let accumulatedTime = 0;
  const step = 0.5;

  const tempMultiplier = getTemperatureMultiplier(temperatureF);

  while (currentPercent < targetPercent && accumulatedTime < elapsedMinutes) {
    const nextPercent = Math.min(currentPercent + step, targetPercent);
    const avgPercent = (currentPercent + nextPercent) / 2;

    const baseChargingRate = getChargingRateAtBatteryLevel(avgPercent);
    const adjustedChargingRate = baseChargingRate * tempMultiplier;

    const percentageToCharge = nextPercent - currentPercent;
    const timeForThisStep = (percentageToCharge / adjustedChargingRate) * 60;

    if (accumulatedTime + timeForThisStep <= elapsedMinutes) {
      accumulatedTime += timeForThisStep;
      currentPercent = nextPercent;
    } else {
      // Partial step
      const remainingTime = elapsedMinutes - accumulatedTime;
      const partialPercentage =
        (remainingTime / timeForThisStep) * percentageToCharge;
      currentPercent += partialPercentage;
      break;
    }
  }

  return Math.min(currentPercent, targetPercent);
}

// Get charging insights based on real data
export function getChargingInsights(
  startPercent: number,
  targetPercent: number,
  temperatureF: number = 68
): {
  averageRate: number;
  estimatedPower: number;
  temperatureImpact: string;
  efficiency: string;
} {
  const tempMultiplier = getTemperatureMultiplier(temperatureF);
  const midpointPercent = (startPercent + targetPercent) / 2;
  const baseRate = getChargingRateAtBatteryLevel(midpointPercent);
  const adjustedRate = baseRate * tempMultiplier;

  let temperatureImpact = "Optimal";
  if (tempMultiplier < 0.9) temperatureImpact = "Reduced";
  if (tempMultiplier < 0.8) temperatureImpact = "Significantly Reduced";
  if (tempMultiplier > 1.0) temperatureImpact = "Enhanced";

  let efficiency = "Good";
  if (adjustedRate > 7.0) efficiency = "Excellent";
  if (adjustedRate < 5.0) efficiency = "Fair";
  if (adjustedRate < 3.0) efficiency = "Poor";

  return {
    averageRate: adjustedRate,
    estimatedPower: CHARGING_POWER_KW,
    temperatureImpact,
    efficiency,
  };
}

export function formatChargingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}
