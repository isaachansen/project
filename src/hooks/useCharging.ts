import { useState, useEffect, useCallback } from "react";
import { ChargingService } from "../lib/charging";
import { Charger, QueueEntry, ChargingSession } from "../types";
import { supabase } from "../lib/supabase";

export function useCharging(userId?: string) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [userSession, setUserSession] = useState<ChargingSession | null>(null);
  const [userQueueEntry, setUserQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true); // Avoids UI flicker on reloads
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
      setLoading(false);
      return;
    }

    loadData();

    const channel = supabase.channel(`charging-user-${userId}`);

    const handleDataChange = () => {
      loadData();
    };

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "charging_sessions" },
        handleDataChange
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "queue_entries" },
        handleDataChange
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        handleDataChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadData]);

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
