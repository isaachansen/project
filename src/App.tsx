import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./hooks/useAuth";
import { useCharging } from "./hooks/useCharging";
import { LoginScreen } from "./components/LoginScreen";
import { ProfileSetup } from "./components/ProfileSetup";
import { Header } from "./components/Header";
import { ChargingStation } from "./components/ChargingStation";
import { ChargingDialog } from "./components/ChargingDialog";
import { QueueList } from "./components/QueueList";
import { SettingsDialog } from "./components/SettingsDialog";
import { RealtimeDemo } from "./components/RealtimeDemo";
import { RealtimeDebug } from "./components/RealtimeDebug";
import { Zap, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Toaster } from "sonner";

function App() {
  const {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signOut,
    createProfile,
    updateProfile,
  } = useAuth();
  const {
    chargers,
    queue,
    userSession,
    userQueueEntry,
    hasAvailableCharger,
    startCharging,
    stopCharging,
    joinQueue,
    leaveQueue,
  } = useCharging(user?.id);

  const [showChargingDialog, setShowChargingDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Check if Supabase is configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              Supabase Configuration Required
            </CardTitle>
            <p className="text-gray-600 mb-4">
              Please configure your Supabase environment variables in the .env
              file:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm font-mono">
              <div>VITE_SUPABASE_URL=your_supabase_url</div>
              <div>VITE_SUPABASE_ANON_KEY=your_anon_key</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              Connection Error
            </CardTitle>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginScreen onSignIn={signIn} loading={loading} />
        <Toaster position="top-right" />
      </>
    );
  }

  if (!userProfile && !loading) {
    return (
      <>
        <ProfileSetup
          user={user}
          onComplete={async (profileData) => {
            try {
              await createProfile(profileData);
              toast.success("Profile created successfully!");
            } catch {
              toast.error("Failed to create profile");
            }
          }}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show loading only for initial auth, not profile loading
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If we have a user but no profile yet, show a minimal loading state
  if (user && !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
        <Toaster position="top-right" />
      </div>
    );
  }

  const handleChargingAction = async (
    currentCharge: number,
    targetCharge: number
  ) => {
    try {
      if (hasAvailableCharger) {
        const availableCharger = chargers.find((c) => !c.is_occupied);
        if (availableCharger) {
          await startCharging(availableCharger.id, currentCharge, targetCharge);
          toast.success("Charging started!");
        }
      } else {
        await joinQueue(currentCharge, targetCharge);
        toast.success("Added to queue!");
      }
    } catch {
      toast.error("Failed to process request");
    }
  };

  const handleStopCharging = async () => {
    try {
      await stopCharging();
      toast.success("Charging stopped!");
    } catch {
      toast.error("Failed to stop charging");
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await leaveQueue();
      toast.success("Left the queue");
    } catch {
      toast.error("Failed to leave queue");
    }
  };

  const getActionButtonText = () => {
    if (userSession) return "Stop Charging";
    if (userQueueEntry) return "Leave Queue";
    if (hasAvailableCharger) return "Start Charging";
    return "Join Queue";
  };

  const getActionButtonVariant = () => {
    if (userSession) return "destructive";
    if (userQueueEntry) return "secondary";
    return "default";
  };

  const handleActionClick = () => {
    if (userSession) {
      handleStopCharging();
    } else if (userQueueEntry) {
      handleLeaveQueue();
    } else {
      setShowChargingDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={userProfile!}
        onSignOut={signOut}
        onOpenSettings={() => setShowSettingsDialog(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Realtime Status */}
          <RealtimeDemo />

          {/* Realtime Debug */}
          <RealtimeDebug />

          {/* Charging Stations */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Charging Stations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chargers.map((charger) => (
                <ChargingStation key={charger.id} charger={charger} />
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleActionClick}
              variant={getActionButtonVariant()}
              size="lg"
              className="px-8 py-4 text-white font-semibold h-auto transition-all duration-200 transform hover:scale-105"
            >
              {userSession ? (
                <Zap className="w-5 h-5 mr-2" />
              ) : (
                <Users className="w-5 h-5 mr-2" />
              )}
              {getActionButtonText()}
            </Button>
          </div>

          {/* Queue */}
          <QueueList
            queue={queue}
            currentUserId={user.id}
            onLeaveQueue={userQueueEntry ? handleLeaveQueue : undefined}
          />
        </div>
      </main>

      <ChargingDialog
        isOpen={showChargingDialog}
        onClose={() => setShowChargingDialog(false)}
        onSubmit={handleChargingAction}
        title={hasAvailableCharger ? "Start Charging" : "Join Queue"}
        defaultTarget={userProfile?.preferred_charge_percentage || 80}
      />

      <SettingsDialog
        isOpen={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        user={userProfile!}
        onSave={async (updates) => {
          try {
            await updateProfile(updates);
            toast.success("Profile updated successfully!");
          } catch {
            toast.error("Failed to update profile");
          }
        }}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid #e5e7eb",
            color: "#374151",
          },
        }}
      />
    </div>
  );
}

export default App;
