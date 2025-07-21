import React, { useState } from "react";
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
import { formatModelName } from "@/lib/utils";
import {
  modelNames,
  getTrimsForModelYear,
  getYearsForModel,
} from "../data/tesla-models";
import { TeslaModelName } from "../types/tesla-models";

interface ProfileSetupProps {
  user: AuthUser;
  onComplete: (profile: Record<string, unknown>) => void;
}

export function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    tesla_model: "" as TeslaModelName,
    tesla_year: "",
    tesla_trim: "",
    preferred_charge_percentage: 80,
  });

  const availableYears = formData.tesla_model
    ? getYearsForModel(formData.tesla_model)
    : [];
  const availableTrims =
    formData.tesla_model && formData.tesla_year
      ? getTrimsForModelYear(formData.tesla_model, formData.tesla_year)
      : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const handleModelChange = (model: TeslaModelName) => {
    setFormData({
      ...formData,
      tesla_model: model,
      tesla_year: "",
      tesla_trim: "",
    });
  };

  const handleYearChange = (year: string) => {
    setFormData({ ...formData, tesla_year: year, tesla_trim: "" });
  };

  const handleTrimChange = (trim: string) => {
    setFormData({ ...formData, tesla_trim: trim });
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
              <Label htmlFor="tesla_model" className="text-lg font-semibold">
                Tesla Model
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {modelNames.map((model) => (
                  <Button
                    key={model}
                    type="button"
                    variant={
                      formData.tesla_model === model ? "default" : "outline"
                    }
                    onClick={() => handleModelChange(model as TeslaModelName)}
                    className={`p-3 h-auto ${
                      formData.tesla_model === model
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {formatModelName(model)}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {formData.tesla_model && (
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2">
                  Year
                </Label>
                <Select
                  value={formData.tesla_year}
                  onValueChange={handleYearChange}
                  disabled={availableYears.length === 0}
                >
                  <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {availableYears.map((year) => (
                      <SelectItem
                        key={year}
                        value={year}
                        className="text-gray-100 focus:bg-gray-600"
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.tesla_year && (
              <div>
                <Label className="text-sm font-medium text-gray-300 mb-2">
                  Trim Level
                </Label>
                <Select
                  value={formData.tesla_trim}
                  onValueChange={handleTrimChange}
                  disabled={availableTrims.length === 0}
                >
                  <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select trim level" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {availableTrims.map((trim) => (
                      <SelectItem
                        key={trim.name}
                        value={trim.name}
                        className="text-gray-100 focus:bg-gray-600"
                      >
                        {trim.name}
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

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
              disabled={
                !formData.name ||
                !formData.tesla_model ||
                !formData.tesla_year ||
                !formData.tesla_trim
              }
            >
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
