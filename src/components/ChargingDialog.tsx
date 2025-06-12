import React, { useState } from "react";
import { X, Battery, Zap } from "lucide-react";

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(currentCharge, targetCharge);
    onClose();
  };

  const estimatedTime = Math.max(0, targetCharge - currentCharge);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Current Battery Level
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentCharge}
                  onChange={(e) => setCurrentCharge(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Charge Level
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min={currentCharge}
                  max="100"
                  value={targetCharge}
                  onChange={(e) => setTargetCharge(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={targetCharge <= currentCharge}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
