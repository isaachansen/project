import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionCount, setConnectionCount] = useState(0);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");

  // Use refs to prevent duplicate subscriptions
  const channelsRef = useRef<{
    status: ReturnType<typeof supabase.channel>;
    presence: ReturnType<typeof supabase.channel>;
  } | null>(null);
  const isInitializedRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setupConnection = () => {
    if (isInitializedRef.current || channelsRef.current) {
      console.log("Realtime status already initialized, skipping");
      return;
    }

    isInitializedRef.current = true;
    console.log("🔄 Initializing realtime status tracking...");

    // Create unique channel names with timestamp
    const timestamp = Date.now();

    // Track realtime connection status with simpler approach
    const statusChannel = supabase.channel(`status_${timestamp}`, {
      config: {
        broadcast: { self: true },
        presence: { key: "status" },
      },
    });

    statusChannel.subscribe((status) => {
      console.log("📡 Realtime connection status:", status);
      setConnectionStatus(status);

      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        console.log("✅ Realtime status connected!");
      } else if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
        setIsConnected(false);
        console.log("⚠️ Realtime connection issue:", status);

        // Retry connection after timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        retryTimeoutRef.current = setTimeout(() => {
          console.log("🔄 Retrying realtime connection...");
          cleanup();
          setTimeout(setupConnection, 1000);
        }, 5000);
      } else {
        setIsConnected(false);
      }
    });

    // Track presence for user count (simplified)
    const presenceChannel = supabase.channel(`presence_${timestamp}`, {
      config: {
        presence: { key: "user_id" },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        setConnectionCount(count);
        console.log(`👥 ${count} users online`);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        console.log("👋 User joined:", key);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        console.log("👋 User left:", key);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          try {
            // Track this user's presence
            await presenceChannel.track({
              user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
              online_at: new Date().toISOString(),
            });
          } catch (error) {
            console.error("Error tracking presence:", error);
          }
        }
      });

    // Store channels for cleanup
    channelsRef.current = {
      status: statusChannel,
      presence: presenceChannel,
    };
  };

  const cleanup = () => {
    console.log("🧹 Cleaning up realtime status tracking...");

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (channelsRef.current) {
      const { status, presence } = channelsRef.current;

      Promise.all([
        supabase.removeChannel(status),
        supabase.removeChannel(presence),
      ])
        .catch((error) => {
          console.error("Error cleaning up realtime status channels:", error);
        })
        .finally(() => {
          channelsRef.current = null;
          isInitializedRef.current = false;
        });
    }
  };

  useEffect(() => {
    // Initial setup with delay
    const initTimer = setTimeout(setupConnection, 500);

    return () => {
      clearTimeout(initTimer);
      cleanup();
    };
  }, []);

  return {
    isConnected,
    connectionCount,
    connectionStatus,
  };
}
