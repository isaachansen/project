import React, { useState } from "react";
import { Battery, Zap, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { User, TeslaModel } from "../types";
import {
  getVehicleByModelAndTrim,
  calculateChargingTime,
  calculateEstimatedEndTime,
  formatChargingTime,
  getChargingInsights,
  TeslaVehicle,
} from "../data/teslaVehicles";

interface ChargingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentCharge: number, targetCharge: number) => void;
  title: string;
  defaultTarget?: number;
  user?: User;
}

// Custom Battery Progress Component with elegant green animation
interface BatteryProgressProps {
  value: number;
  className?: string;
}

function BatteryProgress({ value, className = "" }: BatteryProgressProps) {
  return (
    <div className={`battery-progress h-3 ${className}`}>
      <div
        className="battery-indicator"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export function ChargingDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  defaultTarget = 80,
  user,
}: ChargingDialogProps) {
  const [currentCharge, setCurrentCharge] = useState(20);
  const [targetCharge, setTargetCharge] = useState(defaultTarget);

  // Get vehicle specifications
  const vehicleSpec: TeslaVehicle | null =
    (user?.vehicle_spec as unknown as TeslaVehicle) ||
    (user?.tesla_model && user?.tesla_trim
      ? getVehicleByModelAndTrim(
          user.tesla_model as TeslaModel,
          user.tesla_trim
        )
      : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(currentCharge, targetCharge);
    onClose();
  };

  // Calculate charging metrics using enhanced vehicle specifications
  const temperatureF = 75; // Assume typical temperature - could be enhanced with real weather data

  const chargingTimeMinutes = vehicleSpec
    ? calculateChargingTime(
        vehicleSpec.battery_kWh,
        currentCharge,
        targetCharge,
        temperatureF
      )
    : Math.max(0, targetCharge - currentCharge); // Fallback to simple calculation

  const estimatedEndTime = vehicleSpec
    ? calculateEstimatedEndTime(
        vehicleSpec.battery_kWh,
        currentCharge,
        targetCharge,
        temperatureF
      )
    : new Date(Date.now() + chargingTimeMinutes * 60000);

  const energyNeeded = vehicleSpec
    ? (vehicleSpec.battery_kWh * (targetCharge - currentCharge)) / 100
    : 0;

  const chargingInsights = vehicleSpec
    ? getChargingInsights(currentCharge, targetCharge, temperatureF)
    : null;

  const isLongSession = chargingTimeMinutes > 480; // More than 8 hours

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-effect border-gray-200 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-gray-900 dark:text-gray-100">{title}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Information */}
          {vehicleSpec && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={vehicleSpec.imageUrl}
                  alt={`${vehicleSpec.model} ${vehicleSpec.trim}`}
                  className="w-16 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {user?.tesla_year} {vehicleSpec.model} {vehicleSpec.trim}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {vehicleSpec.battery_kWh} kWh Battery
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Battery Level
              </Label>
              <div className="space-y-3 mt-3">
                <Slider
                  value={[currentCharge]}
                  onValueChange={(value: number[]) =>
                    setCurrentCharge(value[0])
                  }
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">0%</span>
                  <div className="flex items-center space-x-1">
                    <Battery className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <span className="font-semibold text-primary">
                      {currentCharge}%
                    </span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">100%</span>
                </div>
                {/* Battery level preview with green pulsing animation */}
                <div className="mt-2">
                  <BatteryProgress value={currentCharge} />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Target Charge Level
              </Label>
              <div className="space-y-3 mt-3">
                <Slider
                  value={[targetCharge]}
                  onValueChange={(value: number[]) => setTargetCharge(value[0])}
                  max={100}
                  min={currentCharge}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentCharge}%
                  </span>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    <span className="font-semibold text-green-400">
                      {targetCharge}%
                    </span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">100%</span>
                </div>
                {/* Target battery level preview with green pulsing animation */}
                <div className="mt-2">
                  <BatteryProgress value={targetCharge} />
                </div>
              </div>
            </div>
          </div>

          {/* Charging Summary */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              Charging Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Charge Needed:
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {targetCharge - currentCharge}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Estimated Time:
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatChargingTime(chargingTimeMinutes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Completion:
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {estimatedEndTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {energyNeeded > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Energy Needed:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {energyNeeded.toFixed(1)} kWh
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Charging Insights */}
          {chargingInsights && (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Charging Insights
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Avg. Rate:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {chargingInsights.averageRate.toFixed(1)}%/hr
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Power:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {chargingInsights.estimatedPower.toFixed(1)} kW
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Efficiency:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {chargingInsights.efficiency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Temperature:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {chargingInsights.temperatureImpact}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Long session warning */}
          {isLongSession && (
            <div className="bg-yellow-100 dark:bg-yellow-500/20 border border-yellow-300 dark:border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <div className="font-medium text-yellow-800 dark:text-yellow-300">
                    Long Charging Session
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-400">
                    This session will take over 8 hours. Consider charging to a
                    lower percentage.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              {title}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
