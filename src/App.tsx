import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { useAuth } from "./hooks/useAuth";
import { useCharging } from "./hooks/useCharging";
import { useTheme } from "./hooks/useTheme";
import { LoginScreen } from "./components/LoginScreen";
import { ProfileSetup } from "./components/ProfileSetup";
import { Header } from "./components/Header";
import { ChargingStation } from "./components/ChargingStation";
import { ChargingDialog } from "./components/ChargingDialog";
import { QueueList } from "./components/QueueList";
import { SettingsDialog } from "./components/SettingsDialog";
import { Zap, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { getAppConfig } from "./lib/config";
import { initializeSlack } from "./lib/slack";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { User, UserUpdate } from "./lib/auth";

function App() {
  return (
    <RealtimeProvider>
      <MainContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(216 16% 10%)",
            border: "1px solid hsl(216 16% 20%)",
            color: "hsl(210 40% 98%)",
          },
        }}
      />
    </RealtimeProvider>
  );
}

function MainContent() {
  useTheme();

  useEffect(() => {
    const config = getAppConfig();
    if (config.slack.enabled) {
      try {
        initializeSlack();
        console.log("✅ Slack service initialized successfully");
      } catch (error) {
        console.error("❌ Failed to initialize Slack service:", error);
      }
    }
  }, []);

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
    startCharging,
    stopCharging,
    joinQueue,
    leaveQueue,
  } = useCharging(user?.id);

  const availableChargers = chargers.filter((c) => !c.is_occupied);
  const hasAvailableCharger = availableChargers.length > 0;

  const [showChargingDialog, setShowChargingDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleChargingSubmit = async (
    currentCharge: number,
    targetCharge: number
  ) => {
    if (actionLoading) return;

    setActionLoading(true);
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
      setShowChargingDialog(false);
    } catch {
      toast.error("Failed to process request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopCharging = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await stopCharging();
      toast.success("Charging stopped!");
    } catch {
      toast.error("Failed to stop charging");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await leaveQueue();
      toast.success("Left the queue");
    } catch {
      toast.error("Failed to leave queue");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateProfile = async (updates: UserUpdate) => {
    try {
      await updateProfile(updates);
      toast.success("Profile updated successfully!");
      setShowSettingsDialog(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
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

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("placeholder")) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full card-shadow-lg border-gray-200 dark:border-gray-600">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Supabase Configuration Required
            </CardTitle>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full card-shadow-lg border-gray-200 dark:border-gray-600">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Connection Error
            </CardTitle>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} loading={loading} />;
  }

  if (!userProfile) {
    return (
      <ProfileSetup
        user={user}
        onComplete={(profileData) =>
          createProfile(profileData as Omit<User, "id">)
        }
      />
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-gray-800 dark:text-gray-200">
      <Header
        user={userProfile}
        onOpenSettings={() => setShowSettingsDialog(true)}
        onSignOut={signOut}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Charging Stations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {chargers.map((charger) => (
                <ChargingStation
                  key={charger.id}
                  charger={charger}
                  currentUserId={user.id}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={handleActionClick}
              variant={getActionButtonVariant()}
              size="lg"
              disabled={actionLoading}
              className="px-8 py-4 font-semibold h-auto transition-all duration-200 transform hover:scale-105 glow-on-hover card-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {actionLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
              ) : userSession ? (
                <Zap className="w-5 h-5 mr-2" />
              ) : (
                <Users className="w-5 h-5 mr-2" />
              )}
              {actionLoading ? "Processing..." : getActionButtonText()}
            </Button>
          </div>
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
        onSubmit={handleChargingSubmit}
        title={hasAvailableCharger ? "Start Charging" : "Join Queue"}
        defaultTarget={userProfile?.preferred_charge_percentage || 80}
        user={userProfile}
      />
      {userProfile && (
        <SettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          user={userProfile}
          onSave={handleUpdateProfile}
        />
      )}
    </div>
  );
}

export default App;
