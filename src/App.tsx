import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "./hooks/useAuth";
import { useCharging } from "./hooks/useCharging";
import { LoginScreen } from "./components/LoginScreen";
import { ProfileSetup } from "./components/ProfileSetup";
import { Header } from "./components/Header";
import { ChargingStation } from "./components/ChargingStation";
import { ChargingDialog } from "./components/ChargingDialog";
import { QueueList } from "./components/QueueList";
import { SettingsDialog } from "./components/SettingsDialog";
import { Zap, Users, AlertCircle } from "lucide-react";

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
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Supabase Configuration Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please configure your Supabase environment variables in the .env
            file:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm font-mono">
            <div>VITE_SUPABASE_URL=your_supabase_url</div>
            <div>VITE_SUPABASE_ANON_KEY=your_anon_key</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Connection Error
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
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

  const getActionButtonColor = () => {
    if (userSession) return "bg-red-600 hover:bg-red-700";
    if (userQueueEntry) return "bg-gray-600 hover:bg-gray-700";
    return "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800";
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
            <button
              onClick={handleActionClick}
              className={`px-8 py-4 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-105 ${getActionButtonColor()}`}
            >
              <div className="flex items-center space-x-2">
                {userSession ? (
                  <Zap className="w-5 h-5" />
                ) : (
                  <Users className="w-5 h-5" />
                )}
                <span>{getActionButtonText()}</span>
              </div>
            </button>
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

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
