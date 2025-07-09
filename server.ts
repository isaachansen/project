import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

interface SlackWebhookPayload {
  blocks?: Array<{
    type: string;
    text?: {
      type: string;
      text: string;
    };
    fields?: Array<{
      type: string;
      text: string;
    }>;
    elements?: Array<{
      type: string;
      text: string;
    }>;
  }>;
  text: string;
}

interface HealthResponse {
  status: "ok";
  message: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

interface SuccessResponse {
  success: true;
  message: string;
}

// Health check endpoint
app.get("/health", (req: Request, res: Response<HealthResponse>) => {
  res.json({ status: "ok", message: "Slack webhook proxy server is running" });
});

// Slack webhook proxy endpoint
app.post(
  "/api/slack/webhook",
  async (
    req: Request<{}, SuccessResponse | ErrorResponse, SlackWebhookPayload>,
    res: Response<SuccessResponse | ErrorResponse>
  ) => {
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

      if (!slackWebhookUrl) {
        return res.status(400).json({
          error: "SLACK_WEBHOOK_URL environment variable not configured",
        });
      }

      const response = await fetch(slackWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(
          `Slack webhook failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      res.json({
        success: true,
        message: "Slack notification sent successfully",
      });
    } catch (error) {
      console.error("Error proxying Slack webhook:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({
        error: "Failed to send Slack notification",
        details: errorMessage,
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(
    `🚀 Slack webhook proxy server running on http://localhost:${PORT}`
  );
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🔗 Webhook endpoint: http://localhost:${PORT}/api/slack/webhook`
  );

  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn("⚠️  SLACK_WEBHOOK_URL environment variable not set");
    console.warn(
      "💡 Add SLACK_WEBHOOK_URL to your .env file to enable Slack notifications"
    );
  }
});
