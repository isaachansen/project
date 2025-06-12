import { useState, useEffect } from 'react';
import { ChargingService } from '../lib/charging';
import { Charger, QueueEntry, ChargingSession } from '../types';

export function useCharging(userId?: string) {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [userSession, setUserSession] = useState<ChargingSession | null>(null);
  const [userQueueEntry, setUserQueueEntry] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [chargersData, queueData] = await Promise.all([
        ChargingService.getChargers(),
        ChargingService.getQueue()
      ]);

      setChargers(chargersData);
      setQueue(queueData);

      if (userId) {
        const [sessionData, queueEntryData] = await Promise.all([
          ChargingService.getUserChargingSession(userId),
          ChargingService.getUserQueueEntry(userId)
        ]);

        setUserSession(sessionData);
        setUserQueueEntry(queueEntryData);
      }
    } catch (error) {
      console.error('Error loading charging data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const startCharging = async (chargerId: number, currentCharge: number, targetCharge: number) => {
    if (!userId) throw new Error('User not logged in');
    
    try {
      await ChargingService.startCharging(userId, chargerId, currentCharge, targetCharge);
      await loadData();
    } catch (error) {
      console.error('Error starting charging:', error);
      throw error;
    }
  };

  const stopCharging = async () => {
    if (!userSession) throw new Error('No active charging session');
    
    try {
      await ChargingService.stopCharging(userSession.id);
      await loadData();
    } catch (error) {
      console.error('Error stopping charging:', error);
      throw error;
    }
  };

  const joinQueue = async (currentCharge: number, targetCharge: number) => {
    if (!userId) throw new Error('User not logged in');
    
    try {
      await ChargingService.joinQueue(userId, currentCharge, targetCharge);
      await loadData();
    } catch (error) {
      console.error('Error joining queue:', error);
      throw error;
    }
  };

  const leaveQueue = async () => {
    if (!userId) throw new Error('User not logged in');
    
    try {
      await ChargingService.leaveQueue(userId);
      await loadData();
    } catch (error) {
      console.error('Error leaving queue:', error);
      throw error;
    }
  };

  const availableChargers = chargers.filter(c => !c.is_occupied);
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
    refresh: loadData
  };
}