import React, { useState } from "react";
import { TeslaModel } from "../types";
import { User as AuthUser } from "@supabase/supabase-js";
import { UserInsert } from "../lib/auth";
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

interface ProfileSetupProps {
  user: AuthUser;
  onComplete: (profile: Omit<UserInsert, "id">) => void;
}

const TESLA_MODELS: TeslaModel[] = [
  "Model S",
  "Model 3",
  "Model X",
  "Model Y",
  "Cybertruck",
  "Roadster",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    tesla_model: "" as TeslaModel,
    tesla_year: CURRENT_YEAR,
    preferred_charge_percentage: 80,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      email: user.email || "",
      ...formData,
    });
  };

  const getTeslaImage = (model: TeslaModel) => {
    const imageMap = {
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
    return imageMap[model];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-600">
            Tell us about your Tesla to personalize your charging experience
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
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
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Tesla Model
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {TESLA_MODELS.map((model) => (
                  <Button
                    key={model}
                    type="button"
                    variant={
                      formData.tesla_model === model ? "default" : "outline"
                    }
                    onClick={() =>
                      setFormData({ ...formData, tesla_model: model })
                    }
                    className="p-3 h-auto"
                  >
                    <div className="text-sm font-medium">{model}</div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
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
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Preferred Charging Percentage
              </Label>
              <div className="space-y-3 mt-2">
                <Slider
                  value={[formData.preferred_charge_percentage]}
                  onValueChange={(value: number[]) =>
                    setFormData({
                      ...formData,
                      preferred_charge_percentage: value[0],
                    })
                  }
                  min={50}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>50%</span>
                  <span className="font-semibold text-blue-600">
                    {formData.preferred_charge_percentage}%
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {formData.tesla_model && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
                <div className="flex items-center space-x-3">
                  <img
                    src={getTeslaImage(formData.tesla_model)}
                    alt={formData.tesla_model}
                    className="w-16 h-10 object-cover rounded-lg"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {formData.tesla_year} {formData.tesla_model}
                    </div>
                    <div className="text-sm text-gray-600">
                      Target: {formData.preferred_charge_percentage}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={!formData.name || !formData.tesla_model}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold py-4 px-6 h-auto transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
