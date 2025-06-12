import React, { useState } from "react";
import { Battery, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ChargingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentCharge: number, targetCharge: number) => void;
  title: string;
  defaultTarget?: number;
}

export function ChargingDialog({
  isOpen,
  onClose,
  onSubmit,
  title,
  defaultTarget = 80,
}: ChargingDialogProps) {
  const [currentCharge, setCurrentCharge] = useState(20);
  const [targetCharge, setTargetCharge] = useState(defaultTarget);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(currentCharge, targetCharge);
    onClose();
  };

  const estimatedTime = Math.max(0, targetCharge - currentCharge);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3">
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
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0%</span>
                  <div className="flex items-center space-x-1">
                    <Battery className="w-4 h-4" />
                    <span className="font-semibold text-blue-600">
                      {currentCharge}%
                    </span>
                  </div>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3">
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
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{currentCharge}%</span>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span className="font-semibold text-green-600">
                      {targetCharge}%
                    </span>
                  </div>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  Estimated time:
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  ~{estimatedTime} minutes
                </span>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Charging from {currentCharge}% to {targetCharge}%
              </div>
            </div>
          </div>

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
              disabled={targetCharge <= currentCharge}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Confirm
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
