import React, { useState } from "react";
import { User } from "../types";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { formatModelName } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  modelNames,
  getYearsForModel,
  getTrimsForModelYear,
} from "../data/tesla-models";
import { TeslaModelName } from "../types/tesla-models";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updates: Record<string, unknown>) => void;
}

export function SettingsDialog({
  isOpen,
  onClose,
  user,
  onSave,
}: SettingsDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    tesla_model: user.tesla_model as TeslaModelName,
    tesla_year: user.tesla_year?.toString() || "",
    tesla_trim: user.tesla_trim || "",
    preferred_charge_percentage: user.preferred_charge_percentage || 80,
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
    onSave({
      ...formData,
      tesla_year: Number(formData.tesla_year),
    });
    onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto glass-effect border-gray-200 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              className="mt-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  onClick={() => handleModelChange(model)}
                  className={`p-3 h-auto ${
                    formData.tesla_model === model
                      ? "bg-primary hover:bg-primary/90 text-white border-primary"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
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
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Year
              </Label>
              <Select
                value={formData.tesla_year}
                onValueChange={handleYearChange}
                disabled={availableYears.length === 0}
              >
                <SelectTrigger className="mt-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  {availableYears.map((year) => (
                    <SelectItem
                      key={year}
                      value={year}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
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
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trim Level
              </Label>
              <Select
                value={formData.tesla_trim}
                onValueChange={handleTrimChange}
                disabled={availableTrims.length === 0}
              >
                <SelectTrigger className="mt-2 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Select trim level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  {availableTrims.map((trim) => (
                    <SelectItem
                      key={trim.name}
                      value={trim.name}
                      className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {trim.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-white font-bold"
              disabled={
                !formData.name ||
                !formData.tesla_model ||
                !formData.tesla_year ||
                !formData.tesla_trim
              }
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
