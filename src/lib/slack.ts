import { User } from "../types";

export class SlackService {
  constructor() {
    // console.log("🔔 SlackService initialized");
  }

  private async sendRequest(
    endpoint: string,
    body: Record<string, unknown>
  ): Promise<void> {
    try {
      const proxyUrl = `/api/slack/notify/${endpoint}`;
      const response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Slack notification failed: ${response.status} ${response.statusText} - ${
            errorData.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.warn("⚠️  Could not connect to Slack notification server");
        console.warn("💡 Make sure to run: npm run server");
      } else {
        console.warn("❌ Slack notification failed:", error);
      }
    }
  }

  async notifyChargerJoin(
    user: User,
    chargerId: number,
    currentCharge: number,
    targetCharge: number,
    estimatedEndTime: string
  ): Promise<void> {
    await this.sendRequest("charger-join", {
      user,
      chargerId,
      currentCharge,
      targetCharge,
      estimatedEndTime,
    });
  }

  async notifyChargerLeave(
    user: User,
    chargerId: number,
    finalCharge: number,
    wasCompleted: boolean
  ): Promise<void> {
    await this.sendRequest("charger-leave", {
      user,
      chargerId,
      finalCharge,
      wasCompleted,
    });
  }

  async notifyQueueJoin(
    user: User,
    position: number,
    currentCharge: number,
    targetCharge: number
  ): Promise<void> {
    await this.sendRequest("queue-join", {
      user,
      position,
      currentCharge,
      targetCharge,
    });
  }

  async notifyQueueLeave(
    user: User,
    position: number,
    reason: "left" | "moved_to_charger"
  ): Promise<void> {
    await this.sendRequest("queue-leave", { user, position, reason });
  }

  async notifyQueueUpdate(queueLength: number): Promise<void> {
    await this.sendRequest("queue-update", { queueLength });
  }
}

let slackServiceInstance: SlackService | null = null;

export function initializeSlack(): SlackService {
  if (!slackServiceInstance) {
    slackServiceInstance = new SlackService();
  }
  return slackServiceInstance;
}

export function getSlackService(): SlackService | null {
  return slackServiceInstance;
}
