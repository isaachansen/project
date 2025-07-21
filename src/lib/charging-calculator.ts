import { Trim } from "../types/tesla-models.js";
import { getChargerSpecs } from "../data/tesla-models.js";

// Temperature adjustment factors (simplified from previous implementation)
interface TemperatureEffect {
  temperatureF: number;
  chargingMultiplier: number;
}

const TEMPERATURE_EFFECTS: TemperatureEffect[] = [
  { temperatureF: 32, chargingMultiplier: 1.15 }, // 15% longer
  { temperatureF: 50, chargingMultiplier: 1.05 }, // 5% longer
  { temperatureF: 68, chargingMultiplier: 1.0 }, // Optimal
  { temperatureF: 86, chargingMultiplier: 1.02 }, // 2% longer
  { temperatureF: 104, chargingMultiplier: 1.08 }, // 8% longer
];

function getTemperatureMultiplier(temperatureF: number): number {
  if (temperatureF <= TEMPERATURE_EFFECTS[0].temperatureF) {
    return TEMPERATURE_EFFECTS[0].chargingMultiplier;
  }
  if (
    temperatureF >=
    TEMPERATURE_EFFECTS[TEMPERATURE_EFFECTS.length - 1].temperatureF
  ) {
    return TEMPERATURE_EFFECTS[TEMPERATURE_EFFECTS.length - 1]
      .chargingMultiplier;
  }

  for (let i = 0; i < TEMPERATURE_EFFECTS.length - 1; i++) {
    if (
      temperatureF >= TEMPERATURE_EFFECTS[i].temperatureF &&
      temperatureF <= TEMPERATURE_EFFECTS[i + 1].temperatureF
    ) {
      const t =
        (temperatureF - TEMPERATURE_EFFECTS[i].temperatureF) /
        (TEMPERATURE_EFFECTS[i + 1].temperatureF -
          TEMPERATURE_EFFECTS[i].temperatureF);
      return (
        TEMPERATURE_EFFECTS[i].chargingMultiplier +
        t *
          (TEMPERATURE_EFFECTS[i + 1].chargingMultiplier -
            TEMPERATURE_EFFECTS[i].chargingMultiplier)
      );
    }
  }

  return 1.0; // Default
}

export function calculateChargingTime(
  vehicle: Trim,
  startPercent: number,
  targetPercent: number,
  temperatureF: number = 68
): number {
  if (startPercent >= targetPercent) return 0;

  const chargeNeededPercentage = targetPercent - startPercent;
  // Calculate base charging time based on battery capacity and charger specs
  const chargerSpecs = getChargerSpecs();
  const effectivePowerKw = parseFloat(chargerSpecs.effective_power); // e.g., "6.18kW"
  const totalHours = vehicle.battery_capacity_kwh / effectivePowerKw;
  const baseMinutes = (chargeNeededPercentage / 100) * totalHours * 60;

  const tempMultiplier = getTemperatureMultiplier(temperatureF);
  const adjustedMinutes = baseMinutes * tempMultiplier;

  return Math.ceil(adjustedMinutes);
}

export function calculateEstimatedEndTime(
  vehicle: Trim,
  startPercent: number,
  targetPercent: number,
  temperatureF: number = 68
): Date {
  const chargingTimeMinutes = calculateChargingTime(
    vehicle,
    startPercent,
    targetPercent,
    temperatureF
  );
  const endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + chargingTimeMinutes);
  return endTime;
}

export function calculateCurrentBatteryLevel(
  vehicle: Trim,
  startPercent: number,
  targetPercent: number,
  startTime: Date,
  currentTime: Date = new Date(),
  temperatureF: number = 68
): number {
  if (startPercent >= targetPercent) return startPercent;

  const elapsedMinutes =
    (currentTime.getTime() - startTime.getTime()) / (1000 * 60);
  const totalChargingMinutes = calculateChargingTime(
    vehicle,
    startPercent,
    targetPercent,
    temperatureF
  );

  if (elapsedMinutes >= totalChargingMinutes) {
    return targetPercent;
  }

  const percentageCharged =
    (elapsedMinutes / totalChargingMinutes) * (targetPercent - startPercent);

  return Math.min(startPercent + percentageCharged, targetPercent);
}

export function formatChargingTime(minutes: number): string {
  if (minutes < 1) {
    return "<1m";
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
}
