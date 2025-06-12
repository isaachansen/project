import React, { useState } from "react";
import { User } from "../types";
import { Zap, Settings, LogOut, Car, Wifi, WifiOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRealtimeStatus } from "../hooks/useRealtimeStatus";

interface HeaderProps {
  user: User;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

export function Header({ user, onSignOut, onOpenSettings }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { isConnected, connectionCount } = useRealtimeStatus();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Tesla Charging
              </h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">Queue Management</p>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Wifi className="w-3 h-3 text-green-500" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-500" />
                  )}
                  <Badge
                    variant="secondary"
                    className={`text-xs px-1 py-0 ${isConnected ? "text-green-600" : "text-red-600"}`}
                  >
                    {isConnected ? "Live" : "Offline"}
                  </Badge>
                  {connectionCount > 0 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      <Users className="w-2 h-2 mr-1" />
                      {connectionCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 p-2 h-auto"
            >
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="text-xs text-gray-600 flex items-center space-x-1">
                  <Car className="w-3 h-3" />
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {user.tesla_year} {user.tesla_model}
                  </Badge>
                </div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </Button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onOpenSettings();
                    setShowDropdown(false);
                  }}
                  className="w-full justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 h-auto"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    onSignOut();
                    setShowDropdown(false);
                  }}
                  className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 h-auto"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
