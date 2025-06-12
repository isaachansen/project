import React, { useState } from 'react';
import { User, TeslaModel } from '../types';
import { X, Save } from 'lucide-react';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSave: (updates: Partial<User>) => void;
}

const TESLA_MODELS: TeslaModel[] = [
  'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export function SettingsDialog({ isOpen, onClose, user, onSave }: SettingsDialogProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    tesla_model: user.tesla_model as TeslaModel,
    tesla_year: user.tesla_year,
    preferred_charge_percentage: user.preferred_charge_percentage
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const getTeslaImage = (model: TeslaModel) => {
    const imageMap = {
      'Model S': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Model 3': 'https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Model X': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Model Y': 'https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Cybertruck': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Roadster': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400'
    };
    return imageMap[model];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Profile Settings
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tesla Model
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TESLA_MODELS.map((model) => (
                <button
                  key={model}
                  type="button"
                  onClick={() => setFormData({ ...formData, tesla_model: model })}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.tesla_model === model
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{model}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={formData.tesla_year}
              onChange={(e) => setFormData({ ...formData, tesla_year: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Charging Percentage
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="50"
                max="100"
                value={formData.preferred_charge_percentage}
                onChange={(e) => setFormData({ ...formData, preferred_charge_percentage: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}