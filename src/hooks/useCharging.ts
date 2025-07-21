import { useState, useEffect, useCallback, useRef } from "react";
import { ChargingService } from "../lib/charging";
import { Charger, QueueEntry, ChargingSession, User } from "../types";
import { toast as sonner } from "sonner";

export function useCharging(userId?: string, userProfile?: User) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [userSession, setUserSession] = useState<ChargingSession | null>(null);
  const [userQueueEntry, setUserQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers] = useState(0);
  const pollingIntervalRef = useRef<number | null>(null);

  const loadData = useCallback(
    async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setLoading(true);
      }
      try {
        const [chargersData, queueData] = await Promise.all([
          ChargingService.getChargers(),
          ChargingService.getQueue(),
        ]);

        setChargers(chargersData);
        setQueue(queueData);

        if (userId) {
          const [sessionData, queueEntryData] = await Promise.all([
            ChargingService.getUserChargingSession(userId),
            ChargingService.getUserQueueEntry(userId),
          ]);
          setUserSession(sessionData);
          setUserQueueEntry(queueEntryData);
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes("406")) {
          console.error("Error loading charging data:", error);
          sonner.error("Failed to load charging data.");
        }
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    },
    [userId]
  );

  useEffect(() => {
    if (!userId || !userProfile) {
      setLoading(false);
      return;
    }

    loadData(true);
    // start polling every 5 seconds to update data
    if (pollingIntervalRef.current == null) {
      pollingIntervalRef.current = window.setInterval(() => {
        loadData();
      }, 5000);
    }

    return () => {
      // Clear polling interval if set
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [userId, userProfile, loadData]);

  const startCharging = async (
    chargerId: number,
    currentCharge: number,
    targetCharge: number
  ) => {
    if (!userId) throw new Error("User not logged in");

    try {
      await ChargingService.startCharging(
        userId,
        chargerId,
        currentCharge,
        targetCharge
      );
      await loadData();
    } catch (error) {
      console.error("Error starting charging:", error);
      throw error;
    }
  };

  const stopCharging = async () => {
    if (!userId) throw new Error("User not logged in");

    try {
      await ChargingService.stopCharging(userId);
      await loadData();
    } catch (error) {
      console.error("Error stopping charging:", error);
      throw error;
    }
  };

  const joinQueue = async (currentCharge: number, targetCharge: number) => {
    if (!userId) throw new Error("User not logged in");

    try {
      await ChargingService.joinQueue(userId, currentCharge, targetCharge);
      await loadData();
    } catch (error) {
      console.error("Error joining queue:", error);
      throw error;
    }
  };

  const leaveQueue = async () => {
    if (!userId) throw new Error("User not logged in");

    try {
      await ChargingService.leaveQueue(userId);
      await loadData();
    } catch (error) {
      console.error("Error leaving queue:", error);
      throw error;
    }
  };

  return {
    chargers,
    queue,
    userSession,
    userQueueEntry,
    loading,
    startCharging,
    stopCharging,
    joinQueue,
    leaveQueue,
    onlineUsers,
    // channelRef removed for polling-only
  };
}
