import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

// Helper function to generate a proper UUID
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export function RealtimeDebug() {
  const [connectionStatus, setConnectionStatus] =
    useState<string>("Not connected");
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const debugChannel = supabase.channel("debug_channel");

    debugChannel.subscribe((status) => {
      setConnectionStatus(status);
      console.log("Debug channel status:", status);
    });

    return () => {
      supabase.removeChannel(debugChannel);
    };
  }, []);

  const testRealtimeConnection = async () => {
    const results: string[] = [];

    try {
      // Test 1: Basic channel subscription
      const testChannel = supabase.channel("test_basic");
      const result1 = await testChannel.subscribe();
      results.push(`✅ Basic subscription: ${result1}`);

      // Test 2: Postgres changes subscription for queue_entries
      const testPgChannel = supabase.channel("test_postgres_queue");
      testPgChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
        },
        (payload) => {
          console.log("Test postgres change (queue):", payload);
          toast.success("🔥 Realtime test successful!");
        }
      );

      const result2 = await testPgChannel.subscribe();
      results.push(`✅ Queue subscription: ${result2}`);

      // Test 3: Check realtime status
      const realtimeStatus = supabase.realtime.isConnected();
      results.push(`📡 Realtime connected: ${realtimeStatus}`);

      // Test 4: List active channels
      const channels = supabase.getChannels();
      results.push(`📺 Active channels: ${channels.length}`);

      setTestResults(results);

      // Cleanup test channels
      setTimeout(() => {
        supabase.removeChannel(testChannel);
        supabase.removeChannel(testPgChannel);
      }, 5000);
    } catch (error) {
      results.push(`❌ Error: ${error}`);
      setTestResults(results);
    }
  };

  const testQueueInsert = async () => {
    try {
      // First, get an existing user to use for the queue test
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (userError || !users || users.length === 0) {
        toast.error("No users found - create a profile first");
        return;
      }

      const userId = users[0].id;
      const queueId = generateUUID();

      console.log("Inserting test queue entry with UUID:", queueId);

      // Insert a test queue entry
      const { data, error } = await supabase
        .from("queue_entries")
        .insert({
          id: queueId,
          user_id: userId,
          current_charge: 30,
          target_charge: 80,
          position: 1,
        })
        .select();

      if (error) {
        console.error("Queue insert error:", error);
        toast.error(`Queue error: ${error.message}`);
      } else {
        console.log("Test queue entry inserted:", data);
        toast.success("Test queue entry added - should trigger realtime!");

        // Clean up after 5 seconds
        setTimeout(async () => {
          try {
            await supabase.from("queue_entries").delete().eq("id", queueId);
            console.log("Test queue entry cleaned up");
            toast.info("Test queue entry cleaned up");
          } catch (cleanupError) {
            console.error("Queue cleanup error:", cleanupError);
          }
        }, 5000);
      }
    } catch (error) {
      console.error("Queue test failed:", error);
      toast.error(`Queue test failed: ${error}`);
    }
  };

  const testChargingSessionInsert = async () => {
    try {
      // Get an existing user for the charging session test
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (userError || !users || users.length === 0) {
        toast.error("No users found - create a profile first");
        return;
      }

      const userId = users[0].id;
      const sessionId = generateUUID();

      console.log("Inserting test charging session with UUID:", sessionId);

      // Calculate estimated end time (1 hour from now)
      const estimatedEndTime = new Date();
      estimatedEndTime.setHours(estimatedEndTime.getHours() + 1);

      // Insert a test charging session
      const { data, error } = await supabase
        .from("charging_sessions")
        .insert({
          id: sessionId,
          user_id: userId,
          charger_id: 1, // Use charger 1
          current_charge: 40,
          target_charge: 90,
          estimated_end_time: estimatedEndTime.toISOString(),
          status: "charging",
        })
        .select();

      if (error) {
        console.error("Charging session insert error:", error);
        toast.error(`Charging session error: ${error.message}`);
      } else {
        console.log("Test charging session inserted:", data);
        toast.success("Test charging session added - should trigger realtime!");

        // Clean up after 5 seconds
        setTimeout(async () => {
          try {
            await supabase
              .from("charging_sessions")
              .delete()
              .eq("id", sessionId);
            console.log("Test charging session cleaned up");
            toast.info("Test charging session cleaned up");
          } catch (cleanupError) {
            console.error("Charging session cleanup error:", cleanupError);
          }
        }, 5000);
      }
    } catch (error) {
      console.error("Charging session test failed:", error);
      toast.error(`Charging session test failed: ${error}`);
    }
  };

  return (
    <Card className="mb-6 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-700">
          <span>🔧 Realtime Debug</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Connection Status</span>
          <Badge
            variant={
              connectionStatus === "SUBSCRIBED" ? "default" : "destructive"
            }
          >
            {connectionStatus}
          </Badge>
        </div>

        <div className="space-y-2">
          <Button onClick={testRealtimeConnection} size="sm" className="w-full">
            🧪 Test Realtime Connection
          </Button>
          <Button
            onClick={testQueueInsert}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            👥 Test Queue Insert (Triggers Realtime)
          </Button>
          <Button
            onClick={testChargingSessionInsert}
            size="sm"
            variant="outline"
            className="w-full"
          >
            ⚡ Test Charging Session (Triggers Realtime)
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Test Results:</h4>
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>Debug Steps:</strong>
          </p>
          <p>1. Check connection status above</p>
          <p>2. Run connection test</p>
          <p>3. Try queue or charging session test</p>
          <p>4. Watch browser console for logs</p>
          <p>5. Check for toast notifications</p>
          <p>6. Open multiple tabs to see realtime sync</p>
        </div>
      </CardContent>
    </Card>
  );
}
