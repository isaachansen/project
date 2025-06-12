import React from "react";
import { Zap, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginScreenProps {
  onSignIn: () => void;
  loading?: boolean;
}

export function LoginScreen({ onSignIn, loading }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Tesla Charging</h2>
          <p className="text-gray-400 text-lg">Queue Management System</p>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-white mb-2">
              Welcome Back
            </CardTitle>
            <p className="text-gray-400">
              Sign in to manage your charging sessions
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Button
              onClick={onSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 h-auto transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Secure authentication powered by Google
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Join the charging queue and manage your Tesla's power needs
          </p>
        </div>
      </div>
    </div>
  );
}
