import React from 'react';
import { QueueEntry } from '../types';
import { Users, Battery, Target, Clock } from 'lucide-react';

interface QueueListProps {
  queue: QueueEntry[];
  currentUserId?: string;
  onLeaveQueue?: () => void;
}

export function QueueList({ queue, currentUserId, onLeaveQueue }: QueueListProps) {
  const getTeslaImage = (model: string) => {
    const imageMap: { [key: string]: string } = {
      'Model S': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Model 3': 'https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Model X': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Model Y': 'https://images.pexels.com/photos/3729460/pexels-photo-3729460.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Cybertruck': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400',
      'Roadster': 'https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=400'
    };
    return imageMap[model] || imageMap['Model 3'];
  };

  const getEstimatedWaitTime = (position: number) => {
    // Rough estimation: 45 minutes average charging time per person ahead
    const waitTime = (position - 1) * 45;
    if (waitTime <= 0) return 'Next up!';
    
    const hours = Math.floor(waitTime / 60);
    const minutes = waitTime % 60;
    
    if (hours > 0) {
      return `~${hours}h ${minutes}m`;
    }
    return `~${minutes}m`;
  };

  if (queue.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No one in queue
          </h3>
          <p className="text-gray-500">
            Chargers are available or queue is empty
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Charging Queue
          </h3>
          <div className="flex items-center space-x-2 text-blue-600">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">
              {queue.length} {queue.length === 1 ? 'person' : 'people'} waiting
            </span>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {queue.map((entry, index) => (
          <div 
            key={entry.id} 
            className={`p-4 ${entry.user_id === currentUserId ? 'bg-blue-50' : 'bg-white'}`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  entry.position === 1 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {entry.position}
                </div>
              </div>

              <div className="flex-shrink-0">
                <img
                  src={getTeslaImage(entry.user?.tesla_model || 'Model 3')}
                  alt={`${entry.user?.tesla_model}`}
                  className="w-16 h-10 object-cover rounded-lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 truncate">
                    {entry.user?.name}
                    {entry.user_id === currentUserId && (
                      <span className="ml-2 text-sm text-blue-600 font-medium">
                        (You)
                      </span>
                    )}
                  </h4>
                  <div className="text-sm text-gray-500">
                    {getEstimatedWaitTime(entry.position)}
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span>{entry.user?.tesla_year} {entry.user?.tesla_model}</span>
                  <div className="flex items-center space-x-1">
                    <Battery className="w-3 h-3" />
                    <span>{entry.current_charge}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{entry.target_charge}%</span>
                  </div>
                </div>
              </div>

              {entry.user_id === currentUserId && onLeaveQueue && (
                <button
                  onClick={onLeaveQueue}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Leave Queue
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}