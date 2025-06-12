import { useState, useEffect, useRef } from "react";
import { ChargingService } from "../lib/charging";
import { Charger, QueueEntry, ChargingSession } from "../types";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

export function useCharging(userId?: string) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [userSession, setUserSession] = useState<ChargingSession | null>(null);
  const [userQueueEntry, setUserQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Simplified subscription tracking with retry logic
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSetupRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  const loadData = async () => {
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
      // 406 errors are normal for empty tables, don't show as errors
      if (error instanceof Error && !error.message.includes("406")) {
        console.error("Error loading charging data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    if (isSetupRef.current || channelRef.current) {
      console.log("Realtime already setup, skipping...");
      return;
    }

    console.log(
      "🔄 Setting up realtime (attempt",
      retryCountRef.current + 1,
      ")..."
    );
    isSetupRef.current = true;

    // Create a single channel with better configuration
    const channel = supabase.channel(`charging_app_${Date.now()}`, {
      config: {
        broadcast: { self: false },
        presence: { key: "charging_app" },
      },
    });

    // Listen to all charging_sessions changes
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "charging_sessions" },
      (payload) => {
        console.log("🔌 Charging session change:", payload);

        if (payload.eventType === "INSERT") {
          toast.success("⚡ Someone started charging!");
        } else if (payload.eventType === "DELETE") {
          toast.info("🔌 Charging station available!");
        }

        // Refresh data
        loadData();
      }
    );

    // Listen to all queue_entries changes
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "queue_entries" },
      (payload) => {
        console.log("👥 Queue change:", payload);

        if (payload.eventType === "INSERT") {
          toast.info("👥 Someone joined the queue");
        } else if (payload.eventType === "DELETE") {
          toast.info("👋 Someone left the queue");
        }

        // Refresh data
        loadData();
      }
    );

    // Listen to user profile changes
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "users" },
      (payload) => {
        console.log("👤 User profile change:", payload);
        loadData();
      }
    );

    // Subscribe to the channel with better error handling
    channel.subscribe((status) => {
      console.log("📡 Charging realtime status:", status);

      if (status === "SUBSCRIBED") {
        console.log("✅ Charging realtime connected successfully!");
        retryCountRef.current = 0; // Reset retry count on success
        toast.success("🔄 Live updates active!", { duration: 2000 });
      } else if (status === "TIMED_OUT") {
        console.warn("⏰ Realtime connection timed out");
        handleConnectionFailure();
      } else if (status === "CHANNEL_ERROR") {
        console.error("❌ Realtime connection failed");
        handleConnectionFailure();
      } else if (status === "CLOSED") {
        console.log("🔒 Realtime connection closed");
        handleConnectionFailure();
      }
    });

    channelRef.current = channel;
  };

  const handleConnectionFailure = () => {
    retryCountRef.current += 1;
    const maxRetries = 3;

    if (retryCountRef.current <= maxRetries) {
      const retryDelay = Math.min(5000 * retryCountRef.current, 15000); // Exponential backoff

      console.log(
        `🔄 Retrying realtime connection in ${retryDelay / 1000}s (attempt ${retryCountRef.current}/${maxRetries})`
      );

      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }

      retryTimeoutRef.current = setTimeout(() => {
        cleanup();
        setTimeout(setupRealtime, 1000);
      }, retryDelay);
    } else {
      console.log("❌ Max retries reached, giving up on realtime");
      toast.error("Realtime unavailable - using manual refresh", {
        duration: 3000,
      });
    }
  };

  const cleanup = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (channelRef.current) {
      console.log("🧹 Cleaning up realtime...");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      isSetupRef.current = false;
    }
  };

  useEffect(() => {
    // Load initial data
    loadData();

    // Setup realtime with a delay to ensure proper initialization
    const timer = setTimeout(setupRealtime, 1000);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [userId]);

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
      // Immediate refresh for better UX
      setTimeout(loadData, 500);
    } catch (error) {
      console.error("Error starting charging:", error);
      throw error;
    }
  };

  const stopCharging = async () => {
    if (!userSession) throw new Error("No active charging session");

    try {
      await ChargingService.stopCharging(userSession.id);
      setTimeout(loadData, 500);
    } catch (error) {
      console.error("Error stopping charging:", error);
      throw error;
    }
  };

  const joinQueue = async (currentCharge: number, targetCharge: number) => {
    if (!userId) throw new Error("User not logged in");

    try {
      await ChargingService.joinQueue(userId, currentCharge, targetCharge);
      setTimeout(loadData, 500);
    } catch (error) {
      console.error("Error joining queue:", error);
      throw error;
    }
  };

  const leaveQueue = async () => {
    if (!userId) throw new Error("User not logged in");

    try {
      await ChargingService.leaveQueue(userId);
      setTimeout(loadData, 500);
    } catch (error) {
      console.error("Error leaving queue:", error);
      throw error;
    }
  };

  const availableChargers = chargers.filter((c) => !c.is_occupied);
  const hasAvailableCharger = availableChargers.length > 0;

  return {
    chargers,
    queue,
    userSession,
    userQueueEntry,
    loading,
    hasAvailableCharger,
    startCharging,
    stopCharging,
    joinQueue,
    leaveQueue,
    refresh: loadData,
  };
}
