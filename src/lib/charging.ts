import { supabase } from "./supabase";
import {
  ChargingSession,
  QueueEntry,
  Charger,
  User,
  TeslaModel,
} from "../types";
import {
  getVehicleByModelAndTrim,
  calculateEstimatedEndTime,
  TeslaVehicle,
} from "../data/teslaVehicles";
import { getSlackService } from "./slack";

export class ChargingService {
  static async getChargers(): Promise<Charger[]> {
    try {
      // Get active charging sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("charging_sessions")
        .select(
          `
          *,
          user:users(*)
        `
        )
        .eq("status", "charging");

      if (sessionsError) throw sessionsError;

      // Return two chargers with their current sessions
      const chargers: Charger[] = [
        {
          id: 1,
          name: "Charger A",
          is_occupied: false,
          current_session: undefined,
        },
        {
          id: 2,
          name: "Charger B",
          is_occupied: false,
          current_session: undefined,
        },
      ];

      // Assign sessions to chargers
      sessions?.forEach((session) => {
        const charger = chargers.find((c) => c.id === session.charger_id);
        if (charger) {
          charger.is_occupied = true;
          charger.current_session = session as ChargingSession & {
            user?: User;
          };
        }
      });

      return chargers;
    } catch (error) {
      console.error("Error getting chargers:", error);
      return [];
    }
  }

  static async startCharging(
    userId: string,
    chargerId: number,
    currentCharge: number,
    targetCharge: number
  ) {
    try {
      // Get user profile to access vehicle specifications
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user profile:", userError);
        throw userError;
      }

      if (!userProfile) {
        throw new Error("User profile not found");
      }

      // Calculate accurate charging time using vehicle specifications
      let estimatedEndTime = new Date();

      if (userProfile) {
        // Try to get vehicle spec from saved data or lookup by model/trim
        const vehicleSpec: TeslaVehicle | null =
          (userProfile.vehicle_spec as unknown as TeslaVehicle) ||
          (userProfile.tesla_model && userProfile.tesla_trim
            ? getVehicleByModelAndTrim(
                userProfile.tesla_model as TeslaModel,
                userProfile.tesla_trim
              )
            : null);

        if (vehicleSpec) {
          // Use enhanced Tesla vehicle data for charging time calculation with temperature
          estimatedEndTime = calculateEstimatedEndTime(
            vehicleSpec.battery_kWh,
            currentCharge,
            targetCharge,
            75 // Assume typical outdoor temperature - could be enhanced with real weather data
          );
        } else {
          // Fallback: rough estimation of 1% per minute
          const chargingTime = (targetCharge - currentCharge) * 1;
          estimatedEndTime.setMinutes(
            estimatedEndTime.getMinutes() + chargingTime
          );
        }
      } else {
        // Fallback: rough estimation of 1% per minute
        const chargingTime = (targetCharge - currentCharge) * 1;
        estimatedEndTime.setMinutes(
          estimatedEndTime.getMinutes() + chargingTime
        );
      }

      const { data, error } = await supabase
        .from("charging_sessions")
        .insert([
          {
            user_id: userId,
            charger_id: chargerId,
            current_charge: currentCharge,
            target_charge: targetCharge,
            start_time: new Date().toISOString(),
            estimated_end_time: estimatedEndTime.toISOString(),
            status: "charging",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Send Slack notification
      const slackService = getSlackService();
      console.log("🔔 Slack service available:", !!slackService);
      if (slackService && userProfile) {
        try {
          console.log("🔔 Sending charger join notification...");
          await slackService.notifyChargerJoin(
            userProfile,
            chargerId,
            currentCharge,
            targetCharge,
            estimatedEndTime.toISOString()
          );
        } catch (slackError) {
          console.error("Failed to send Slack notification:", slackError);
        }
      }

      return data;
    } catch (error) {
      console.error("Error starting charging:", error);
      throw error;
    }
  }

  static async stopCharging(userId: string) {
    try {
      // Get session details before updating
      const { data: sessionData, error: fetchError } = await supabase
        .from("charging_sessions")
        .select(
          `
          *,
          user:users(*)
        `
        )
        .eq("user_id", userId)
        .eq("status", "charging")
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching charging session:", fetchError);
        throw fetchError;
      }

      if (!sessionData) {
        console.log("User has no active charging session, nothing to do");
        return;
      }

      const { data, error } = await supabase
        .from("charging_sessions")
        .update({
          status: "completed",
        })
        .eq("id", sessionData.id)
        .select()
        .single();

      if (error) throw error;

      // Send Slack notification
      const slackService = getSlackService();
      console.log(
        "🔔 Slack service available for charger leave:",
        !!slackService
      );
      if (slackService && sessionData?.user) {
        try {
          console.log("🔔 Sending charger leave notification...");
          const wasCompleted =
            sessionData.current_charge >= sessionData.target_charge;
          await slackService.notifyChargerLeave(
            sessionData.user as User,
            sessionData.charger_id,
            sessionData.current_charge,
            wasCompleted
          );
        } catch (slackError) {
          console.error("Failed to send Slack notification:", slackError);
        }
      }

      // Move next person from queue to charger
      await this.processQueue();

      return data;
    } catch (error) {
      console.error("Error stopping charging:", error);
      throw error;
    }
  }

  static async joinQueue(
    userId: string,
    currentCharge: number,
    targetCharge: number
  ) {
    try {
      // Get current queue length
      const { count } = await supabase
        .from("queue_entries")
        .select("*", { count: "exact" });

      const position = (count || 0) + 1;

      const { data, error } = await supabase
        .from("queue_entries")
        .insert([
          {
            user_id: userId,
            current_charge: currentCharge,
            target_charge: targetCharge,
            position,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Get user details for Slack notification
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (userError) {
        console.error("Error fetching user data:", userError);
      }

      // Send Slack notification
      const slackService = getSlackService();
      console.log("🔔 Slack service available for queue join:", !!slackService);
      if (slackService && userData) {
        try {
          console.log("🔔 Sending queue join notification...");
          await slackService.notifyQueueJoin(
            userData,
            position,
            currentCharge,
            targetCharge
          );
        } catch (slackError) {
          console.error("Failed to send Slack notification:", slackError);
        }
      }

      return data;
    } catch (error) {
      console.error("Error joining queue:", error);
      throw error;
    }
  }

  static async getQueue(): Promise<QueueEntry[]> {
    try {
      const { data, error } = await supabase
        .from("queue_entries")
        .select(
          `
          *,
          user:users(*)
        `
        )
        .order("position", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting queue:", error);
      return [];
    }
  }

  static async leaveQueue(userId: string) {
    try {
      // Get queue entry details before deleting
      const { data: queueData, error: fetchError } = await supabase
        .from("queue_entries")
        .select(
          `
          *,
          user:users(*)
        `
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching queue entry:", fetchError);
        throw fetchError;
      }

      if (!queueData) {
        console.log("User is not in queue, nothing to do");
        return;
      }

      const { error } = await supabase
        .from("queue_entries")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      // Send Slack notification
      const slackService = getSlackService();
      console.log(
        "🔔 Slack service available for queue leave:",
        !!slackService
      );
      if (slackService && queueData?.user) {
        try {
          console.log("🔔 Sending queue leave notification...");
          await slackService.notifyQueueLeave(
            queueData.user as User,
            queueData.position,
            "left"
          );
        } catch (slackError) {
          console.error("Failed to send Slack notification:", slackError);
        }
      }

      // Reorder queue positions
      await this.reorderQueue();

      // Check if queue is now empty
      const { count } = await supabase
        .from("queue_entries")
        .select("*", { count: "exact" });

      if (slackService && count === 0) {
        try {
          await slackService.notifyQueueUpdate(0);
        } catch (slackError) {
          console.error("Failed to send Slack notification:", slackError);
        }
      }
    } catch (error) {
      console.error("Error leaving queue:", error);
      throw error;
    }
  }

  static async getUserChargingSession(
    userId: string
  ): Promise<ChargingSession | null> {
    try {
      const { data, error } = await supabase
        .from("charging_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "charging")
        .maybeSingle();

      if (error) {
        console.error("Error getting user charging session:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting user charging session:", error);
      return null;
    }
  }

  static async getUserQueueEntry(userId: string): Promise<QueueEntry | null> {
    try {
      const { data, error } = await supabase
        .from("queue_entries")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error getting user queue entry:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Error getting user queue entry:", error);
      return null;
    }
  }

  private static async processQueue() {
    try {
      // Get first person in queue with user details
      const { data: nextInQueue, error: queueError } = await supabase
        .from("queue_entries")
        .select(
          `
          *,
          user:users(*)
        `
        )
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (queueError) {
        console.error("Error fetching next in queue:", queueError);
        return;
      }

      if (nextInQueue) {
        // Find available charger
        const chargers = await this.getChargers();
        const availableCharger = chargers.find((c) => !c.is_occupied);

        if (availableCharger) {
          // Send Slack notification for queue leave (moved to charger)
          const slackService = getSlackService();
          if (slackService && nextInQueue.user) {
            try {
              await slackService.notifyQueueLeave(
                nextInQueue.user as User,
                nextInQueue.position,
                "moved_to_charger"
              );
            } catch (slackError) {
              console.error("Failed to send Slack notification:", slackError);
            }
          }

          // Start charging for next person
          await this.startCharging(
            nextInQueue.user_id,
            availableCharger.id,
            nextInQueue.current_charge,
            nextInQueue.target_charge
          );

          // Remove from queue
          await supabase
            .from("queue_entries")
            .delete()
            .eq("id", nextInQueue.id);

          // Reorder remaining queue
          await this.reorderQueue();
        }
      }
    } catch (error) {
      console.error("Error processing queue:", error);
    }
  }

  private static async reorderQueue() {
    try {
      const { data: queueEntries } = await supabase
        .from("queue_entries")
        .select("*")
        .order("position", { ascending: true });

      if (queueEntries) {
        for (let i = 0; i < queueEntries.length; i++) {
          await supabase
            .from("queue_entries")
            .update({ position: i + 1 })
            .eq("id", queueEntries[i].id);
        }
      }
    } catch (error) {
      console.error("Error reordering queue:", error);
    }
  }
}
