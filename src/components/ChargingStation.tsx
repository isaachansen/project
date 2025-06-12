import React from "react";
import { Charger } from "../types";
import { Zap, Clock, Battery } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ChargingStationProps {
  charger: Charger;
}

export function ChargingStation({ charger }: ChargingStationProps) {
  const getTeslaImage = (model: string) => {
    const imageMap: { [key: string]: string } = {
      "Model S":
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
      "Model 3":
        "https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400",
      "Model X":
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
      "Model Y":
        "https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400",
      Cybertruck:
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
      Roadster:
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
    };
    return imageMap[model] || imageMap["Model 3"];
  };

  const getChargingProgress = () => {
    if (!charger.current_session) return 0;

    const { start_time, estimated_end_time } = charger.current_session;
    const now = new Date().getTime();
    const start = new Date(start_time || "").getTime();
    const end = new Date(estimated_end_time || "").getTime();

    const elapsed = now - start;
    const total = end - start;
    const progress = Math.min((elapsed / total) * 100, 100);

    return Math.max(0, progress);
  };

  const getRemainingTime = () => {
    if (!charger.current_session) return "";

    const end = new Date(
      charger.current_session.estimated_end_time || ""
    ).getTime();
    const now = new Date().getTime();
    const remaining = Math.max(0, end - now);

    const minutes = Math.floor(remaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getCurrentBatteryLevel = () => {
    if (!charger.current_session) return 0;

    const { current_charge, target_charge, start_time } =
      charger.current_session;
    const now = new Date().getTime();
    const start = new Date(start_time || "").getTime();
    const elapsed = now - start;

    // Simulate charging: roughly 1% per minute
    const chargedAmount = Math.floor(elapsed / (1000 * 60));
    const currentLevel = Math.min(
      current_charge + chargedAmount,
      target_charge
    );

    return currentLevel;
  };

  if (!charger.is_occupied) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
              {charger.name}
            </CardTitle>
            <Badge variant="secondary" className="text-gray-500">
              Available
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const session = charger.current_session!;
  const user = session.user;
  const progress = getChargingProgress();
  const remainingTime = getRemainingTime();
  const currentBattery = getCurrentBatteryLevel();

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {charger.name}
          </CardTitle>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <Zap className="w-4 h-4 mr-1" />
            Charging
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <img
            src={getTeslaImage(user?.tesla_model || "Model 3")}
            alt={`${user?.tesla_model}`}
            className="w-20 h-12 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{user?.name}</h4>
            <Badge variant="outline" className="text-sm">
              {user?.tesla_year} {user?.tesla_model}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Battery Level
              </span>
              <Badge variant="secondary" className="text-blue-600">
                {currentBattery}% → {session.target_charge}%
              </Badge>
            </div>
            <Progress value={currentBattery} className="h-3" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Charging Progress
              </span>
              <Badge variant="secondary" className="text-blue-600">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Time remaining: {remainingTime}</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Battery className="w-4 h-4" />
              <span>{session.target_charge - currentBattery}% to go</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
