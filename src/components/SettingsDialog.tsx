import React, { useState } from "react";
import { User, TeslaModel } from "../types";
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
import { Slider } from "@/components/ui/slider";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updates: Partial<User>) => void;
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

export function SettingsDialog({
  isOpen,
  onClose,
  user,
  onSave,
}: SettingsDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    tesla_model: user.tesla_model as TeslaModel,
    tesla_year: user.tesla_year,
    preferred_charge_percentage: user.preferred_charge_percentage,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Profile Settings
          </DialogTitle>
        </DialogHeader>

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
                setFormData({ ...formData, tesla_year: parseInt(value) })
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
                value={[formData.preferred_charge_percentage || 80]}
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

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
