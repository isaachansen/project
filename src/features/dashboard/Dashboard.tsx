import { useState } from "react";
import { toast } from "sonner";
import { useCharging } from "@/hooks/useCharging";
import { Header } from "@/components/Header";
import { ChargingStation } from "@/components/ChargingStation";
import { ChargingDialog } from "@/components/ChargingDialog";
import { QueueList } from "@/components/QueueList";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User, UserUpdate } from "@/lib/auth";
import { type User as AuthUser } from "@supabase/supabase-js";
import { LoadingScreen } from "../common/LoadingScreen";

interface DashboardProps {
  user: AuthUser;
  userProfile: User;
  onSignOut: () => void;
  onUpdateProfile: (updates: UserUpdate) => Promise<void>;
}

export function Dashboard({
  user,
  userProfile,
  onSignOut,
  onUpdateProfile,
}: DashboardProps) {
  const {
    chargers,
    queue,
    userSession,
    userQueueEntry,
    loading,
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
      await onUpdateProfile(updates);
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

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen gradient-bg text-gray-800 dark:text-gray-200">
      <Header
        user={userProfile}
        onOpenSettings={() => setShowSettingsDialog(true)}
        onSignOut={onSignOut}
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
