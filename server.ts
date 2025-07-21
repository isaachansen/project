import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { getTrimData } from "./src/data/tesla-models";
import { calculateChargingTime } from "./src/lib/charging-calculator";
import { formatModelName } from "./src/lib/utils";
import { TeslaModelName } from "./src/types/tesla-models";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory (for Railway deployment)
app.use(express.static(path.join(__dirname, "../dist")));

interface HealthResponse {
  status: "ok";
  message: string;
}

interface SlackBlock {
  type: "section" | "context" | "divider";
  text?: {
    type: "mrkdwn";
    text: string;
  };
  fields?: { type: "mrkdwn"; text: string }[];
  elements?: { type: "mrkdwn"; text: string }[];
}

interface SlackPayload {
  blocks: SlackBlock[];
  text: string;
}

// Health check endpoint
app.get("/health", (req: Request, res: Response<HealthResponse>) => {
  res.json({ status: "ok", message: "Slack webhook proxy server is running" });
});

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function getVehicleEmoji(model: string): string {
  const emojiMap: Record<string, string> = {
    "Model S": "🚗",
    "Model 3": "🚙",
    "Model X": "🚐",
    "Model Y": "🚕",
    Cybertruck: "🚚",
  };
  return emojiMap[model] || "🚗";
}

async function sendWebhook(payload: SlackPayload): Promise<void> {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!slackWebhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL environment variable not configured");
  }

  // wrap blocks with divider at the top and bottom for better separation
  const decoratedBlocks: SlackBlock[] = [
    { type: "divider" },
    ...payload.blocks,
    { type: "divider" },
  ];
  const decoratedPayload: SlackPayload = {
    text: payload.text,
    blocks: decoratedBlocks,
  };
  const response = await fetch(slackWebhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(decoratedPayload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `Slack webhook failed: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
}

// --- Notification Endpoints ---

app.post(
  "/api/slack/notify/charger-join",
  async (req: Request, res: Response) => {
    try {
      const { user, chargerId, currentCharge, targetCharge, estimatedEndTime } =
        req.body;

      const vehicleSpec =
        user.tesla_model && user.tesla_year && user.tesla_trim
          ? getTrimData(
              user.tesla_model as TeslaModelName,
              user.tesla_year.toString(),
              user.tesla_trim
            )
          : null;

      const endTime = new Date(estimatedEndTime);
      const startTime = new Date();
      const chargingTimeMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      const formattedModelName = formatModelName(user.tesla_model);
      const vehicleEmoji = getVehicleEmoji(formattedModelName);

      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${formattedModelName} ${user.tesla_trim}`
        : `${user.tesla_year} ${formattedModelName}`;

      const blocks: SlackBlock[] = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `⚡ *${
              user.name
            }* started charging at *Charger ${String.fromCharCode(
              64 + chargerId
            )}*`,
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
              text: `⏱️ *Est. Time:*\n${formatDuration(chargingTimeMinutes)}`,
            },
            {
              type: "mrkdwn",
              text: `🏁 *Est. Finish:*\n<!date^${Math.floor(
                endTime.getTime() / 1000
              )}^{time}|${endTime.toLocaleTimeString()}>`,
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
              text: `📊 Battery: ${vehicleSpec.battery_capacity_kwh}kWh`,
            },
          ],
        });
      }

      await sendWebhook({
        blocks,
        text: `${user.name} started charging at Charger ${String.fromCharCode(
          64 + chargerId
        )} (${currentCharge}% → ${targetCharge}%)`,
      });

      res.json({ success: true, message: "Notification sent." });
    } catch (error) {
      console.error("Error in /charger-join:", error);
      res.status(500).json({ error: "Failed to send notification." });
    }
  }
);

app.post(
  "/api/slack/notify/charger-leave",
  async (req: Request, res: Response) => {
    try {
      const { user, chargerId, finalCharge, wasCompleted } = req.body;

      const formattedModelName = formatModelName(user.tesla_model);
      const vehicleEmoji = getVehicleEmoji(formattedModelName);
      const statusEmoji = wasCompleted ? "✅" : "⏹️";
      const statusText = wasCompleted
        ? "completed charging"
        : "stopped charging early";

      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${formattedModelName} ${user.tesla_trim}`
        : `${user.tesla_year} ${formattedModelName}`;

      await sendWebhook({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${statusEmoji} *${
                user.name
              }* ${statusText} at *Charger ${String.fromCharCode(
                64 + chargerId
              )}*`,
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
        text: `${user.name} ${statusText} at Charger ${String.fromCharCode(
          64 + chargerId
        )}`,
      });
      res.json({ success: true, message: "Notification sent." });
    } catch (error) {
      console.error("Error in /charger-leave:", error);
      res.status(500).json({ error: "Failed to send notification." });
    }
  }
);

app.post(
  "/api/slack/notify/queue-join",
  async (req: Request, res: Response) => {
    try {
      const { user, position, currentCharge, targetCharge } = req.body;
      const vehicleSpec =
        user.tesla_model && user.tesla_year && user.tesla_trim
          ? getTrimData(
              user.tesla_model as TeslaModelName,
              user.tesla_year.toString(),
              user.tesla_trim
            )
          : null;

      if (!vehicleSpec) {
        // Handle case where vehicle spec is not found
        // For example, send a simplified notification or log an error
        await sendWebhook({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `👋 *${user.name}* joined the queue at position *#${position}*`,
              },
            },
          ],
          text: `${user.name} joined the queue at position #${position}`,
        });
        return res.json({
          success: true,
          message: "Simplified notification sent.",
        });
      }

      const chargingTimeMinutes = calculateChargingTime(
        vehicleSpec,
        currentCharge,
        targetCharge
      );

      const formattedModelName = formatModelName(user.tesla_model);
      const vehicleEmoji = getVehicleEmoji(formattedModelName);

      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${formattedModelName} ${user.tesla_trim}`
        : `${user.tesla_year} ${formattedModelName}`;

      await sendWebhook({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `👥 *${user.name}* joined the queue at position *#${position}*`,
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
                text: `⏱️ *Est. Wait:*\n~${formatDuration(
                  position * chargingTimeMinutes
                )}`,
              },
              {
                type: "mrkdwn",
                text: `🔌 *Est. Charge Time:*\n${formatDuration(
                  chargingTimeMinutes
                )}`,
              },
            ],
          },
        ],
        text: `${user.name} joined the queue at position #${position}`,
      });
      res.json({ success: true, message: "Notification sent." });
    } catch (error) {
      console.error("Error in /queue-join:", error);
      res.status(500).json({ error: "Failed to send notification." });
    }
  }
);

app.post(
  "/api/slack/notify/queue-leave",
  async (req: Request, res: Response) => {
    try {
      const { user, position, reason } = req.body;
      const formattedModelName = formatModelName(user.tesla_model);
      const vehicleEmoji = getVehicleEmoji(formattedModelName);
      const vehicleInfo = user.tesla_trim
        ? `${user.tesla_year} ${formattedModelName} ${user.tesla_trim}`
        : `${user.tesla_year} ${formattedModelName}`;

      let text;
      if (reason === "moved_to_charger") {
        text = `🔼 *${user.name}* moved from the queue to a charger`;
      } else {
        text = `👋 *${user.name}* left the queue from position *#${position}*`;
      }

      await sendWebhook({
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `${vehicleEmoji} ${vehicleInfo}`,
              },
            ],
          },
        ],
        text:
          reason === "moved_to_charger"
            ? `${user.name} moved from the queue to a charger`
            : `${user.name} left the queue`,
      });
      res.json({ success: true, message: "Notification sent." });
    } catch (error) {
      console.error("Error in /queue-leave:", error);
      res.status(500).json({ error: "Failed to send notification." });
    }
  }
);

app.post(
  "/api/slack/notify/queue-update",
  async (req: Request, res: Response) => {
    try {
      const { queueLength } = req.body;
      await sendWebhook({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `🔄 Queue updated. *${queueLength}* users waiting.`,
            },
          },
        ],
        text: `Queue updated. ${queueLength} users waiting.`,
      });
      res.json({ success: true, message: "Notification sent." });
    } catch (error) {
      console.error("Error in /queue-update:", error);
      res.status(500).json({ error: "Failed to send notification." });
    }
  }
);

// Catch all handler: send back React's index.html file for any non-API routes
// This must be after all API routes
app.get("*", (req: Request, res: Response) => {
  if (!req.path.startsWith("/api/") && !req.path.startsWith("/health")) {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  } else {
    res.status(404).json({ error: "API endpoint not found" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Tesla Charging Queue server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Frontend served from: http://localhost:${PORT}`);

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn("⚠️  SLACK_WEBHOOK_URL environment variable not set");
    console.warn(
      "💡 Add SLACK_WEBHOOK_URL to your .env file to enable Slack notifications"
    );
  }
});
