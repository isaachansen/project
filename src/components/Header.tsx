import { useState } from "react";
import { User } from "../types";
import { Zap, Settings, LogOut, Car, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "../hooks/useTheme";
import nikolaLogo from "../assets/nikola.png";

interface HeaderProps {
  user: User;
  onSignOut: () => void;
  onOpenSettings: () => void;
}

export function Header({ user, onSignOut, onOpenSettings }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="glass-effect border-b border-gray-200 dark:border-gray-600 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 charging-pulse">
              <AvatarImage src={nikolaLogo} alt="Nikola Logo" />
              <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80">
                <Zap className="w-5 h-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Nikola
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 h-auto hover:bg-gray-100 dark:hover:bg-gray-700/50 glow-on-hover"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-1">
                    <Car className="w-3 h-3" />
                    <Badge
                      variant="secondary"
                      className="text-xs px-1 py-0 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {user.tesla_year} {user.tesla_model}
                    </Badge>
                  </div>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center card-shadow">
                  <span className="text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 glass-effect rounded-lg card-shadow-lg py-1 z-50">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onOpenSettings();
                      setShowDropdown(false);
                    }}
                    className="w-full justify-start px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 h-auto"
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
                    className="w-full justify-start px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 h-auto"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 glow-on-hover"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
