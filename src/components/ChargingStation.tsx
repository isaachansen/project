import { Charger } from "../types";
import { Zap, Clock, Battery, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTrimData } from "../data/tesla-models";
import {
  calculateCurrentBatteryLevel,
  formatChargingTime,
} from "../lib/charging-calculator";
import { TeslaModelName, Trim } from "../types/tesla-models";
import { getVehicleImage } from "@/data/image-map";
import { formatModelName } from "@/lib/utils";

interface ChargingStationProps {
  charger: Charger;
  currentUserId?: string;
}

// Tesla-inspired Battery Progress Component with charging animations
interface BatteryProgressProps {
  value: number;
  isCharging?: boolean;
  className?: string;
}

function BatteryProgress({
  value,
  isCharging = false,
  className = "",
}: BatteryProgressProps) {
  const batteryLevel = Math.min(Math.max(value, 0), 100);

  // Determine battery state for styling
  const getBatteryState = () => {
    if (batteryLevel <= 10) return "critical-battery";
    if (batteryLevel <= 20) return "low-battery";
    if (batteryLevel >= 95) return "full-battery";
    return "";
  };

  const batteryState = getBatteryState();

  return (
    <div className={`battery-progress h-5 ${batteryState} ${className}`}>
      <div
        className="battery-indicator"
        style={{ width: `${batteryLevel}%` }}
      />
      {isCharging && (
        <div className="charging-bolt">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.5 2L6.5 9h4v6l5-7h-4V2z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function ChargingStation({
  charger,
  currentUserId,
}: ChargingStationProps) {
  if (!charger.is_occupied) {
    return (
      <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 card-shadow">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {charger.name}
            </CardTitle>
            <Badge
              variant="secondary"
              className="text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700"
            >
              Available
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const session = charger.current_session!;
  const user = session.user;
  const isCurrentUser = currentUserId === user?.id;

  // Get vehicle specifications
  const vehicleSpec: Trim | null =
    user?.tesla_model && user?.tesla_year && user?.tesla_trim
      ? getTrimData(
          user.tesla_model as TeslaModelName,
          user.tesla_year.toString(),
          user.tesla_trim
        )
      : null;

  const vehicleImage =
    user?.tesla_model && user.tesla_year
      ? getVehicleImage(user.tesla_model as TeslaModelName, user.tesla_year)
      : "";

  const getChargingProgress = () => {
    if (!session.start_time || !session.estimated_end_time) return 0;

    const now = new Date().getTime();
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.estimated_end_time).getTime();

    const elapsed = now - start;
    const total = end - start;
    const progress = Math.min((elapsed / total) * 100, 100);

    return Math.max(0, progress);
  };

  const getRemainingTime = () => {
    if (!session.estimated_end_time) return "";

    const end = new Date(session.estimated_end_time).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, end - now);

    const minutes = Math.floor(remaining / (1000 * 60));
    return formatChargingTime(minutes);
  };

  const getCurrentBatteryLevel = () => {
    if (!session.start_time) return session.current_charge || 0;

    // Use enhanced charging calculation based on real Tesla data
    if (vehicleSpec) {
      return calculateCurrentBatteryLevel(
        vehicleSpec,
        session.current_charge || 0,
        session.target_charge || 80,
        new Date(session.start_time),
        new Date(),
        75 // Assume typical outdoor temperature - could be enhanced to fetch real weather data
      );
    }

    // Fallback: roughly 1% per minute
    const now = new Date().getTime();
    const start = new Date(session.start_time).getTime();
    const elapsed = now - start;
    const chargedAmount = Math.floor(elapsed / (1000 * 60));
    const currentLevel = Math.min(
      session.current_charge + chargedAmount,
      session.target_charge
    );

    return currentLevel;
  };

  const progress = getChargingProgress();
  const remainingTime = getRemainingTime();
  const currentBattery = getCurrentBatteryLevel();

  // Dynamic card styling based on whether this is the current user
  const cardClassName = isCurrentUser
    ? "card-shadow-lg border-2 border-primary bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 charging-pulse"
    : "card-shadow bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-600";

  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {charger.name}
            {isCurrentUser && (
              <Badge
                variant="default"
                className="ml-2 bg-primary hover:bg-primary/90 text-white"
              >
                You
              </Badge>
            )}
          </CardTitle>
          <Badge
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Zap className="w-4 h-4 mr-1" />
            Charging
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {vehicleImage ? (
            <img
              src={vehicleImage}
              alt={formatModelName(user?.tesla_model || "")}
              className="w-20 h-12 object-cover rounded-lg border border-gray-600"
            />
          ) : (
            <div className="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-600">
              <Car className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {user?.name || "Unknown User"}
              </h3>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.tesla_year} {formatModelName(user?.tesla_model || "")}
              </span>
            </div>
            <div className="text-sm flex justify-between text-gray-600 dark:text-gray-400">
              {user?.tesla_trim && (
                <Badge
                  variant="outline"
                  className="text-xs mr-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                >
                  {user.tesla_trim}
                </Badge>
              )}
              {vehicleSpec && (
                <span className="text-xs">
                  {vehicleSpec.battery_capacity_kwh}kWh
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Battery className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Battery Level
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {Math.round(currentBattery)}%
            </span>
          </div>

          <BatteryProgress
            value={currentBattery}
            isCharging={true}
            className="mb-2"
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Target: {session.target_charge}%
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Started: {Math.round(session.current_charge)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {remainingTime ? `${remainingTime} remaining` : "Calculating..."}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {Math.round(progress)}% Complete
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
