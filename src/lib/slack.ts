import { User } from "../types";
import {
  TeslaVehicle,
  getVehicleByModelAndTrim,
  calculateChargingTime,
} from "../data/teslaVehicles";

export class SlackService {
  constructor() {
    console.log("🔔 SlackService initialized");
  }

  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }

  private getVehicleEmoji(model: string): string {
    const emojiMap: Record<string, string> = {
      "Model S": "🚗",
      "Model 3": "🚙",
      "Model X": "🚐",
      "Model Y": "🚕",
      Cybertruck: "🚚",
    };
    return emojiMap[model] || "🚗";
  }

  private calculateAccurateChargingTime(
    currentCharge: number,
    targetCharge: number,
    vehicleSpec?: TeslaVehicle | null
  ): number {
    if (vehicleSpec && vehicleSpec.battery_kWh) {
      // Use the accurate Tesla charging curve calculation
      const accurateTime = calculateChargingTime(
        vehicleSpec.battery_kWh,
        currentCharge,
        targetCharge,
        68 // Default temperature (optimal)
      );

      console.log(`🔋 Accurate charging time calculation:`, {
        vehicle: `${vehicleSpec.battery_kWh}kWh`,
        charge: `${currentCharge}% → ${targetCharge}%`,
        timeMinutes: accurateTime,
        formatted: this.formatDuration(accurateTime),
      });

      return accurateTime;
    } else {
      // Fallback: improved estimation based on real-world data
      // Tesla charging slows significantly after 80%
      const chargeNeeded = targetCharge - currentCharge;
      let fallbackTime: number;

      if (currentCharge >= 80) {
        // Very slow charging above 80%
        fallbackTime = chargeNeeded * 4; // ~4 minutes per % above 80%
      } else if (targetCharge > 80) {
        // Split calculation: fast up to 80%, slow after
        const fastCharge = 80 - currentCharge;
        const slowCharge = targetCharge - 80;
        fallbackTime = fastCharge * 1.5 + slowCharge * 4; // 1.5 min/% up to 80%, 4 min/% after
      } else {
        // Fast charging below 80%
        fallbackTime = chargeNeeded * 1.5; // ~1.5 minutes per % below 80%
      }

      console.log(`🔋 Fallback charging time calculation:`, {
        vehicle: "Unknown specs",
        charge: `${currentCharge}% → ${targetCharge}%`,
        timeMinutes: fallbackTime,
        formatted: this.formatDuration(fallbackTime),
      });

      return fallbackTime;
    }
  }

  private async sendWebhook(payload: any): Promise<void> {
    try {
      console.log("🔔 Attempting to send Slack notification...");

      // Use our local proxy server to avoid CORS issues
      const proxyUrl = "http://localhost:3001/api/slack/webhook";

      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Slack webhook proxy failed: ${response.status} ${response.statusText} - ${errorData.error || ""}`
        );
      }

      const result = await response.json();
      console.log("✅ Slack notification sent successfully:", result.message);
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn("⚠️  Could not connect to Slack proxy server");
        console.warn("💡 Make sure to run: npm run server");
      } else {
        console.warn("❌ Slack notification failed:", error);
      }
      // Don't throw the error to avoid breaking the app
    }
  }

  async notifyChargerJoin(
    user: User,
    chargerId: number,
    currentCharge: number,
    targetCharge: number,
    estimatedEndTime: string
  ): Promise<void> {
    try {
      const vehicleSpec =
        (user.vehicle_spec as unknown as TeslaVehicle) ||
        getVehicleByModelAndTrim(
          user.tesla_model as any,
          user.tesla_trim || ""
        );

      // Calculate the actual charging time from the estimated end time
      // This ensures consistency with the UI and database
      const endTime = new Date(estimatedEndTime);
      const startTime = new Date();
      const chargingTimeMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      console.log(
        `🔋 Using pre-calculated charging time from estimated end time:`,
        {
          estimatedEndTime,
          calculatedMinutes: chargingTimeMinutes,
          formatted: this.formatDuration(chargingTimeMinutes),
          charge: `${currentCharge}% → ${targetCharge}%`,
        }
      );

      const vehicleEmoji = this.getVehicleEmoji(user.tesla_model);

      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${user.tesla_model} ${user.tesla_trim}`
        : `${user.tesla_year} ${user.tesla_model}`;

      const blocks: any[] = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `⚡ *${user.name}* started charging at *Charger ${String.fromCharCode(64 + chargerId)}*`,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `${vehicleEmoji} *Vehicle:*\n${vehicleInfo}`,
            },
            {
              type: "mrkdwn",
              text: `🔋 *Battery:*\n${currentCharge}% → ${targetCharge}%`,
            },
            {
              type: "mrkdwn",
              text: `⏱️ *Est. Time:*\n${this.formatDuration(chargingTimeMinutes)}`,
            },
            {
              type: "mrkdwn",
              text: `🏁 *Est. Finish:*\n<!date^${Math.floor(endTime.getTime() / 1000)}^{time}|${endTime.toLocaleTimeString()}>`,
            },
          ],
        },
      ];

      if (vehicleSpec) {
        blocks.push({
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📊 Battery: ${vehicleSpec.battery_kWh}kWh | Est. Charge Time (0-80%): ${vehicleSpec.charge_time_0_to_80}`,
            },
          ],
        });
      }

      await this.sendWebhook({
        blocks,
        text: `${user.name} started charging at Charger ${String.fromCharCode(64 + chargerId)} (${currentCharge}% → ${targetCharge}%)`,
      });
    } catch (error) {
      console.error(
        "Error sending Slack notification for charger join:",
        error
      );
    }
  }

  async notifyChargerLeave(
    user: User,
    chargerId: number,
    finalCharge: number,
    wasCompleted: boolean
  ): Promise<void> {
    try {
      const vehicleEmoji = this.getVehicleEmoji(user.tesla_model);
      const statusEmoji = wasCompleted ? "✅" : "⏹️";
      const statusText = wasCompleted
        ? "completed charging"
        : "stopped charging early";

      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${user.tesla_model} ${user.tesla_trim}`
        : `${user.tesla_year} ${user.tesla_model}`;

      await this.sendWebhook({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${statusEmoji} *${user.name}* ${statusText} at *Charger ${String.fromCharCode(64 + chargerId)}*`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `${vehicleEmoji} *Vehicle:*\n${vehicleInfo}`,
              },
              {
                type: "mrkdwn",
                text: `🔋 *Final Charge:*\n${finalCharge}%`,
              },
            ],
          },
        ],
        text: `${user.name} ${statusText} at Charger ${String.fromCharCode(64 + chargerId)} (${finalCharge}%)`,
      });
    } catch (error) {
      console.error(
        "Error sending Slack notification for charger leave:",
        error
      );
    }
  }

  async notifyQueueJoin(
    user: User,
    position: number,
    currentCharge: number,
    targetCharge: number
  ): Promise<void> {
    try {
      const vehicleEmoji = this.getVehicleEmoji(user.tesla_model);
      const vehicleSpec =
        (user.vehicle_spec as unknown as TeslaVehicle) ||
        getVehicleByModelAndTrim(
          user.tesla_model as any,
          user.tesla_trim || ""
        );

      // Use the accurate charging time calculation for queue notifications
      const chargingTimeMinutes = this.calculateAccurateChargingTime(
        currentCharge,
        targetCharge,
        vehicleSpec
      );

      console.log(`📋 Queue join notification charging time:`, {
        user: user.name,
        position,
        charge: `${currentCharge}% → ${targetCharge}%`,
        timeMinutes: chargingTimeMinutes,
        formatted: this.formatDuration(chargingTimeMinutes),
        vehicleSpec: vehicleSpec ? `${vehicleSpec.battery_kWh}kWh` : "Unknown",
      });

      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${user.tesla_model} ${user.tesla_trim}`
        : `${user.tesla_year} ${user.tesla_model}`;

      const positionEmoji =
        position === 1
          ? "🥇"
          : position === 2
            ? "🥈"
            : position === 3
              ? "🥉"
              : "📍";

      await this.sendWebhook({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📋 *${user.name}* joined the charging queue`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `${positionEmoji} *Position:*\n#${position} in queue`,
              },
              {
                type: "mrkdwn",
                text: `${vehicleEmoji} *Vehicle:*\n${vehicleInfo}`,
              },
              {
                type: "mrkdwn",
                text: `🔋 *Planned Charge:*\n${currentCharge}% → ${targetCharge}%`,
              },
              {
                type: "mrkdwn",
                text: `⏱️ *Est. Time Needed:*\n${this.formatDuration(chargingTimeMinutes)}`,
              },
            ],
          },
        ],
        text: `${user.name} joined the charging queue at position ${position} (${currentCharge}% → ${targetCharge}%)`,
      });
    } catch (error) {
      console.error("Error sending Slack notification for queue join:", error);
    }
  }

  async notifyQueueLeave(
    user: User,
    position: number,
    reason: "left" | "moved_to_charger"
  ): Promise<void> {
    try {
      const vehicleEmoji = this.getVehicleEmoji(user.tesla_model);
      const reasonEmoji = reason === "moved_to_charger" ? "⚡" : "🚪";
      const reasonText =
        reason === "moved_to_charger" ? "moved to charger" : "left the queue";

      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${user.tesla_model} ${user.tesla_trim}`
        : `${user.tesla_year} ${user.tesla_model}`;

      await this.sendWebhook({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${reasonEmoji} *${user.name}* ${reasonText}`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `${vehicleEmoji} *Vehicle:*\n${vehicleInfo}`,
              },
              {
                type: "mrkdwn",
                text: `📍 *Was at position:*\n#${position}`,
              },
            ],
          },
        ],
        text: `${user.name} ${reasonText} (was at position ${position})`,
      });
    } catch (error) {
      console.error("Error sending Slack notification for queue leave:", error);
    }
  }

  async notifyQueueUpdate(queueLength: number): Promise<void> {
    try {
      if (queueLength === 0) {
        await this.sendWebhook({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "🎉 *Queue is now empty!* All chargers are available.",
              },
            },
          ],
          text: "Queue is now empty - all chargers available",
        });
      }
    } catch (error) {
      console.error(
        "Error sending Slack notification for queue update:",
        error
      );
    }
  }
}

// Singleton instance
let slackService: SlackService | null = null;

export function initializeSlack(): SlackService {
  slackService = new SlackService();
  return slackService;
}

export function getSlackService(): SlackService | null {
  return slackService;
}
