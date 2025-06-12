import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  WifiOff,
  Users,
  Zap,
  Clock,
  Database,
  AlertTriangle,
} from "lucide-react";
import { useRealtimeStatus } from "../hooks/useRealtimeStatus";
import { toast } from "sonner";

export function RealtimeDemo() {
  const { isConnected, connectionCount, connectionStatus } =
    useRealtimeStatus();

  const testToast = () => {
    toast.success("🚗 Realtime is working!", {
      description: "This toast shows that realtime notifications are active",
    });
  };

  const testInfoToast = () => {
    toast.info("ℹ️ Database is empty", {
      description:
        "Add some charging sessions or queue entries to see realtime updates",
    });
  };

  const getStatusColor = () => {
    if (connectionStatus === "SUBSCRIBED") return "default";
    if (connectionStatus === "TIMED_OUT") return "secondary";
    if (connectionStatus === "CHANNEL_ERROR" || connectionStatus === "CLOSED")
      return "destructive";
    return "outline";
  };

  const getStatusIcon = () => {
    if (connectionStatus === "SUBSCRIBED")
      return <Wifi className="w-4 h-4 text-green-500" />;
    if (connectionStatus === "TIMED_OUT")
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <WifiOff className="w-4 h-4 text-red-500" />;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>Realtime Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">Connection Status</span>
          </div>
          <Badge variant={getStatusColor()} className="text-xs">
            {connectionStatus}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Active Users</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {connectionCount} online
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium">Database Status</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            Ready
          </Badge>
        </div>

        {connectionStatus === "TIMED_OUT" && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Connection Timeout
              </span>
            </div>
            <p className="text-xs text-yellow-700">
              The realtime connection is experiencing timeouts. This is common
              and the app will automatically retry. Your actions will still
              work, but live updates may be delayed.
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-600 mb-3">
            When realtime is connected, you'll see instant updates when:
          </p>
          <ul className="text-xs text-gray-600 space-y-1 mb-3">
            <li>• Someone starts or stops charging</li>
            <li>• People join or leave the queue</li>
            <li>• Charging stations become available</li>
          </ul>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={testToast}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Clock className="w-3 h-3 mr-1" />
              Test Success
            </Button>
            <Button
              onClick={testInfoToast}
              size="sm"
              variant="secondary"
              className="text-xs"
            >
              <Database className="w-3 h-3 mr-1" />
              Test Info
            </Button>
          </div>

          {!isConnected && connectionStatus !== "TIMED_OUT" && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              <strong>Note:</strong> Realtime is disconnected. The app will
              retry automatically and use manual refresh as backup.
            </div>
          )}

          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <strong>Tip:</strong> Open this app in multiple browser tabs to test
            realtime synchronization!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
