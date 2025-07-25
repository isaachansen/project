import React from "react";
import { QueueEntry, User } from "../types";
import { Users, Battery, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Import the local asset images
import modelSImage from "../assets/model-s.avif";
import model3NewImage from "../assets/model-3-new.avif";
import modelXImage from "../assets/model-x.avif";
import modelYNewImage from "../assets/model-y-new.avif";
import cybertruckImage from "../assets/cybertruck.avif";

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
      "Model S": modelSImage,
      "Model 3": model3NewImage, // Using new image as default
      "Model X": modelXImage,
      "Model Y": modelYNewImage, // Using new image as default
      Cybertruck: cybertruckImage,
      Roadster: modelSImage, // Using Model S as fallback for Roadster
    };
    return imageMap[model] || model3NewImage; // Default to Model 3 new image
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
      <Card className="card-shadow border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No one in queue
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Chargers are available or queue is empty
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
      <CardHeader className="glass-effect border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Charging Queue
          </CardTitle>
          <Badge variant="secondary" className="text-primary bg-primary/20">
            <Users className="w-4 h-4 mr-1" />
            {queue.length} {queue.length === 1 ? "person" : "people"} waiting
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {queue.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId;
            return (
              <div
                key={entry.id}
                className={`p-4 ${
                  isCurrentUser
                    ? "bg-primary/10 border-l-4 border-primary"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <Badge
                      variant={entry.position === 1 ? "default" : "secondary"}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        entry.position === 1
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : isCurrentUser
                            ? "bg-primary text-white"
                            : "bg-gray-700 text-gray-300"
                      }`}
                    >
                      {entry.position}
                    </Badge>
                  </div>

                  <div className="flex-shrink-0">
                    <img
                      src={getTeslaImage(entry.user?.tesla_model || "Model 3")}
                      alt={`${entry.user?.tesla_model}`}
                      className="w-16 h-10 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {entry.user?.name}
                        {isCurrentUser && (
                          <Badge
                            variant="default"
                            className="ml-2 bg-primary hover:bg-primary/90 text-white"
                          >
                            You
                          </Badge>
                        )}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="text-sm text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700"
                      >
                        {getEstimatedWaitTime(entry.position)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge
                        variant="outline"
                        className="text-sm border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                      >
                        {entry.user?.tesla_year} {entry.user?.tesla_model}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <Battery className="w-3 h-3" />
                        <span>{entry.current_charge}%</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <Target className="w-3 h-3" />
                        <span>{entry.target_charge}%</span>
                      </div>
                    </div>
                  </div>

                  {isCurrentUser && onLeaveQueue && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onLeaveQueue}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      Leave Queue
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
