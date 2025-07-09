import { useState, useEffect, useCallback } from "react";
import { ChargingService } from "../lib/charging";
import { Charger, QueueEntry, ChargingSession } from "../types";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";
import { useRealtimeContext } from "../contexts/RealtimeContext";

export function useCharging(userId?: string) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [userSession, setUserSession] = useState<ChargingSession | null>(null);
  const [userQueueEntry, setUserQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { setRealtimeState } = useRealtimeContext();

  const loadData = useCallback(async () => {
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
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setRealtimeState({ isConnected: false, connectionStatus: "NO_USER" });
      return;
    }

    loadData();

    console.log("🔄 Setting up realtime connection for user:", userId);
    const channel = supabase.channel("charging_app", {
      config: {
        broadcast: { self: false },
        presence: { key: userId },
      },
    });

    const handleDataChange = (
      payload: any,
      type: "CHARGING" | "QUEUE" | "USER"
    ) => {
      console.log(`📦 Realtime event received: ${type}`, payload);
      loadData();
    };

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "charging_sessions" },
        (p) => handleDataChange(p, "CHARGING")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries" },
        (p) => handleDataChange(p, "QUEUE")
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (p) => handleDataChange(p, "USER")
      )
      .on("presence", { event: "sync" }, () => {
        const count = Object.keys(channel.presenceState()).length;
        setRealtimeState({ connectionCount: count });
      })
      .subscribe((status, err) => {
        const timestamp = new Date().toISOString();
        const connectionStatus =
          err?.message || status.toUpperCase().replace(/_/g, " ");
        const isConnected = status === "SUBSCRIBED";

        setRealtimeState({
          isConnected,
          connectionStatus,
        });

        console.log(
          `📡 [${timestamp}] Realtime status: ${connectionStatus}`,
          err ? err : ""
        );
      });

    return () => {
      console.log("🧹 Cleaning up realtime connection...");
      supabase.removeChannel(channel).catch((error) => {
        console.error("Error removing channel:", error);
      });
      setRealtimeState({
        isConnected: false,
        connectionStatus: "DISCONNECTED",
        connectionCount: 0,
      });
    };
  }, [userId, loadData, setRealtimeState]);

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
  };
}
