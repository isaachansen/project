import { supabase } from './supabase';
import { ChargingSession, QueueEntry, Charger, User } from '../types';

export class ChargingService {
  static async getChargers(): Promise<Charger[]> {
    try {
      // Get active charging sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('charging_sessions')
        .select(`
          *,
          user:users(*)
        `)
        .eq('status', 'charging');
      
      if (sessionsError) throw sessionsError;

      // Return two chargers with their current sessions
      const chargers: Charger[] = [
        {
          id: 1,
          name: 'Charger A',
          is_occupied: false,
          current_session: undefined
        },
        {
          id: 2,
          name: 'Charger B',
          is_occupied: false,
          current_session: undefined
        }
      ];

      // Assign sessions to chargers
      sessions?.forEach(session => {
        const charger = chargers.find(c => c.id === session.charger_id);
        if (charger) {
          charger.is_occupied = true;
          charger.current_session = session as ChargingSession & { user?: User };
        }
      });

      return chargers;
    } catch (error) {
      console.error('Error getting chargers:', error);
      return [];
    }
  }

  static async startCharging(userId: string, chargerId: number, currentCharge: number, targetCharge: number) {
    try {
      const estimatedEndTime = new Date();
      // Rough estimation: 1% per minute (adjust based on real charging speeds)
      const chargingTime = (targetCharge - currentCharge) * 1;
      estimatedEndTime.setMinutes(estimatedEndTime.getMinutes() + chargingTime);

      const { data, error } = await supabase
        .from('charging_sessions')
        .insert([{
          user_id: userId,
          charger_id: chargerId,
          current_charge: currentCharge,
          target_charge: targetCharge,
          start_time: new Date().toISOString(),
          estimated_end_time: estimatedEndTime.toISOString(),
          status: 'charging'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting charging:', error);
      throw error;
    }
  }

  static async stopCharging(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('charging_sessions')
        .update({
          status: 'completed'
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      // Move next person from queue to charger
      await this.processQueue();
      
      return data;
    } catch (error) {
      console.error('Error stopping charging:', error);
      throw error;
    }
  }

  static async joinQueue(userId: string, currentCharge: number, targetCharge: number) {
    try {
      // Get current queue length
      const { count } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact' });

      const { data, error } = await supabase
        .from('queue_entries')
        .insert([{
          user_id: userId,
          current_charge: currentCharge,
          target_charge: targetCharge,
          position: (count || 0) + 1
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining queue:', error);
      throw error;
    }
  }

  static async getQueue(): Promise<QueueEntry[]> {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select(`
          *,
          user:users(*)
        `)
        .order('position', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting queue:', error);
      return [];
    }
  }

  static async leaveQueue(userId: string) {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Reorder queue positions
      await this.reorderQueue();
    } catch (error) {
      console.error('Error leaving queue:', error);
      throw error;
    }
  }

  static async getUserChargingSession(userId: string): Promise<ChargingSession | null> {
    try {
      const { data, error } = await supabase
        .from('charging_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'charging')
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Error getting user charging session:', error);
      return null;
    }
  }

  static async getUserQueueEntry(userId: string): Promise<QueueEntry | null> {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      console.error('Error getting user queue entry:', error);
      return null;
    }
  }

  private static async processQueue() {
    try {
      // Get first person in queue
      const { data: nextInQueue } = await supabase
        .from('queue_entries')
        .select('*')
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (nextInQueue) {
        // Find available charger
        const chargers = await this.getChargers();
        const availableCharger = chargers.find(c => !c.is_occupied);

        if (availableCharger) {
          // Start charging for next person
          await this.startCharging(
            nextInQueue.user_id,
            availableCharger.id,
            nextInQueue.current_charge,
            nextInQueue.target_charge
          );

          // Remove from queue
          await supabase
            .from('queue_entries')
            .delete()
            .eq('id', nextInQueue.id);

          // Reorder remaining queue
          await this.reorderQueue();

          // Send notification (mock Slack integration)
          console.log(`Notifying user ${nextInQueue.user_id} that charger is available`);
        }
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    }
  }

  private static async reorderQueue() {
    try {
      const { data: queueEntries } = await supabase
        .from('queue_entries')
        .select('*')
        .order('position', { ascending: true });

      if (queueEntries) {
        for (let i = 0; i < queueEntries.length; i++) {
          await supabase
            .from('queue_entries')
            .update({ position: i + 1 })
            .eq('id', queueEntries[i].id);
        }
      }
    } catch (error) {
      console.error('Error reordering queue:', error);
    }
  }
}