import React from "react";
import { QueueEntry, User } from "../types";
import { Users, Battery, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QueueEntryWithUser extends QueueEntry {
  user?: User;
}

interface QueueListProps {
  queue: QueueEntryWithUser[];
  currentUserId?: string;
  onLeaveQueue?: () => void;
}

export function QueueList({
  queue,
  currentUserId,
  onLeaveQueue,
}: QueueListProps) {
  const getTeslaImage = (model: string) => {
    const imageMap: { [key: string]: string } = {
      "Model S":
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
      "Model 3":
        "https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400",
      "Model X":
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
      "Model Y":
        "https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400",
      Cybertruck:
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
      Roadster:
        "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400",
    };
    return imageMap[model] || imageMap["Model 3"];
  };

  const getEstimatedWaitTime = (position: number) => {
    // Rough estimation: 45 minutes average charging time per person ahead
    const waitTime = (position - 1) * 45;
    if (waitTime <= 0) return "Next up!";

    const hours = Math.floor(waitTime / 60);
    const minutes = waitTime % 60;

    if (hours > 0) {
      return `~${hours}h ${minutes}m`;
    }
    return `~${minutes}m`;
  };

  if (queue.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-700 mb-2">
            No one in queue
          </CardTitle>
          <p className="text-gray-500">
            Chargers are available or queue is empty
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Charging Queue
          </CardTitle>
          <Badge variant="secondary" className="text-blue-600">
            <Users className="w-4 h-4 mr-1" />
            {queue.length} {queue.length === 1 ? "person" : "people"} waiting
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {queue.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 ${entry.user_id === currentUserId ? "bg-blue-50" : "bg-white"}`}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <Badge
                    variant={entry.position === 1 ? "default" : "secondary"}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      entry.position === 1
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {entry.position}
                  </Badge>
                </div>

                <div className="flex-shrink-0">
                  <img
                    src={getTeslaImage(entry.user?.tesla_model || "Model 3")}
                    alt={`${entry.user?.tesla_model}`}
                    className="w-16 h-10 object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">
                      {entry.user?.name}
                      {entry.user_id === currentUserId && (
                        <Badge variant="outline" className="ml-2 text-blue-600">
                          You
                        </Badge>
                      )}
                    </h4>
                    <Badge
                      variant="secondary"
                      className="text-sm text-gray-500"
                    >
                      {getEstimatedWaitTime(entry.position)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="outline" className="text-sm">
                      {entry.user?.tesla_year} {entry.user?.tesla_model}
                    </Badge>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Battery className="w-3 h-3" />
                      <span>{entry.current_charge}%</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Target className="w-3 h-3" />
                      <span>{entry.target_charge}%</span>
                    </div>
                  </div>
                </div>

                {entry.user_id === currentUserId && onLeaveQueue && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLeaveQueue}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    Leave Queue
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
