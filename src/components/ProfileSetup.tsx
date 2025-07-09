import React, { useState } from "react";
import { TeslaModel } from "../types";
import { User as AuthUser } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  getUniqueModels,
  getVehiclesByModel,
  getVehicleByModelAndTrim,
  calculateChargingTime,
  formatChargingTime,
} from "../data/teslaVehicles";

interface ProfileSetupProps {
  user: AuthUser;
  onComplete: (profile: Record<string, unknown>) => void;
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    tesla_model: "" as TeslaModel,
    tesla_trim: "",
    tesla_year: new Date().getFullYear(),
    preferred_charge_percentage: 80,
    use_custom_battery: false,
    custom_battery_kwh: 75,
  });

  const availableModels = getUniqueModels();
  const availableTrims = formData.tesla_model
    ? getVehiclesByModel(formData.tesla_model)
    : [];
  const selectedVehicle =
    formData.tesla_model && formData.tesla_trim
      ? getVehicleByModelAndTrim(formData.tesla_model, formData.tesla_trim)
      : null;

  const availableYears = selectedVehicle
    ? Array.from(
        { length: selectedVehicle.yearEnd - selectedVehicle.yearStart + 1 },
        (_, i) => selectedVehicle.yearEnd - i
      )
    : [];

  // Get the effective battery capacity (custom or from vehicle spec)
  const effectiveBatteryKwh = formData.use_custom_battery
    ? formData.custom_battery_kwh || 75
    : selectedVehicle?.battery_kWh || 75;

  // Calculate custom charging time if using custom battery
  const customChargeTime = formData.use_custom_battery
    ? formatChargingTime(calculateChargingTime(effectiveBatteryKwh, 0, 80))
    : selectedVehicle?.charge_time_0_to_80 || "N/A";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a modified vehicle spec if using custom battery
    let vehicleSpec = selectedVehicle;
    if (formData.use_custom_battery && selectedVehicle) {
      vehicleSpec = {
        ...selectedVehicle,
        battery_kWh: formData.custom_battery_kwh,
        charge_time_0_to_80: customChargeTime,
      };
    }

    onComplete({
      email: user.email || "",
      name: formData.name,
      tesla_model: formData.tesla_model,
      tesla_year: formData.tesla_year,
      preferred_charge_percentage: formData.preferred_charge_percentage,
      tesla_trim: formData.tesla_trim,
      vehicle_spec: vehicleSpec as unknown,
    });
  };

  const handleModelChange = (model: TeslaModel) => {
    setFormData({
      ...formData,
      tesla_model: model,
      tesla_trim: "",
      tesla_year: new Date().getFullYear(),
    });
  };

  const handleTrimChange = (trim: string) => {
    const vehicle = getVehicleByModelAndTrim(formData.tesla_model, trim);
    setFormData({
      ...formData,
      tesla_trim: trim,
      tesla_year: vehicle ? vehicle.yearEnd : new Date().getFullYear(),
      // Reset custom battery when changing trim
      use_custom_battery: false,
      custom_battery_kwh: vehicle?.battery_kWh || 75,
    });
  };

  return (
    <div className="fixed inset-0 gradient-bg backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto glass-effect card-shadow-lg border-gray-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-100">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-400">
            Tell us about your Tesla to personalize your charging experience
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-300 mb-2">
                Your Name
              </Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                required
                className="mt-2 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-300 mb-2">
                Tesla Model
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {availableModels.map((model) => (
                  <Button
                    key={model}
                    type="button"
                    variant={
                      formData.tesla_model === model ? "default" : "outline"
                    }
                    onClick={() => handleModelChange(model)}
                    className={`p-3 h-auto ${
                      formData.tesla_model === model
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-sm font-medium">{model}</div>
                  </Button>
                ))}
              </div>
            </div>

            {formData.tesla_model && (
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2">
                  Trim Level
                </Label>
                <Select
                  value={formData.tesla_trim}
                  onValueChange={handleTrimChange}
                >
                  <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select trim level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {availableTrims.map((vehicle) => (
                      <SelectItem
                        key={vehicle.trim}
                        value={vehicle.trim}
                        className="text-gray-100 focus:bg-gray-600"
                      >
                        {vehicle.trim}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.tesla_trim && availableYears.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2">
                  Year
                </Label>
                <Select
                  value={formData.tesla_year.toString()}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      tesla_year: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {availableYears.map((year) => (
                      <SelectItem
                        key={year}
                        value={year.toString()}
                        className="text-gray-100 focus:bg-gray-600"
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-300 mb-2">
                Preferred Charge Percentage
              </Label>
              <div className="space-y-3 mt-3">
                <Slider
                  value={[formData.preferred_charge_percentage]}
                  onValueChange={(value: number[]) =>
                    setFormData({
                      ...formData,
                      preferred_charge_percentage: value[0],
                    })
                  }
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>50%</span>
                  <span className="font-semibold text-primary">
                    {formData.preferred_charge_percentage}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {selectedVehicle && (
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-600">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={selectedVehicle.imageUrl}
                    alt={`${selectedVehicle.model} ${selectedVehicle.trim}`}
                    className="w-16 h-10 object-cover rounded-lg border border-gray-600"
                  />
                  <div>
                    <div className="font-medium text-gray-100">
                      {formData.tesla_year} {selectedVehicle.model}{" "}
                      {selectedVehicle.trim}
                    </div>
                    <div className="text-sm text-gray-400">
                      {effectiveBatteryKwh} kWh Battery
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Charge Time (0-80%):</span>
                    <span className="text-gray-300">{customChargeTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Battery Capacity:</span>
                    <span className="text-gray-300">
                      {effectiveBatteryKwh} kWh
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="use_custom_battery"
                checked={formData.use_custom_battery}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    use_custom_battery: e.target.checked,
                  })
                }
                className="rounded border-gray-600 bg-gray-700 text-primary focus:ring-primary"
              />
              <Label
                htmlFor="use_custom_battery"
                className="text-sm text-gray-300"
              >
                Use custom battery capacity
              </Label>
            </div>

            {formData.use_custom_battery && (
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2">
                  Custom Battery Capacity (kWh)
                </Label>
                <Input
                  type="number"
                  value={formData.custom_battery_kwh}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      custom_battery_kwh: parseFloat(e.target.value) || 75,
                    })
                  }
                  min="40"
                  max="200"
                  step="0.1"
                  className="mt-2 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={
                !formData.name || !formData.tesla_model || !formData.tesla_trim
              }
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 h-auto glow-on-hover"
            >
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
