# Slack Webhook Integration Setup

This Tesla Charging Queue app includes Slack webhook integration that sends notifications when users join/leave chargers and queues.

## Features

The Slack bot sends rich notifications for:

- **Charger Join**: When someone starts charging

  - Vehicle details (year, model, trim)
  - Battery level (current → target)
  - Estimated charging time
  - Estimated completion time
  - Battery capacity and charging specs

- **Charger Leave**: When someone stops charging

  - Whether charging was completed or stopped early
  - Final battery level

- **Queue Join**: When someone joins the charging queue

  - Queue position with emoji (🥇🥈🥉📍)
  - Vehicle details
  - Planned charging (current → target)
  - Estimated time needed

- **Queue Leave**: When someone leaves the queue

  - Whether they left voluntarily or moved to a charger
  - Previous queue position

- **Queue Updates**: When the queue becomes empty

## Setup Instructions

### 1. Create a Slack App

1. Go to [api.slack.com](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name your app (e.g., "Tesla Charging Notifications")
4. Select your workspace

### 2. Enable Incoming Webhooks

1. In your app settings, go to "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" to **On**
3. Click "Add New Webhook to Workspace"
4. Select the channel where you want notifications
5. Click "Allow"
6. Copy the webhook URL (starts with `https://hooks.slack.com/services/`)

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
# Slack Configuration (Optional)
VITE_SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 4. Start the Proxy Server

The app uses a local TypeScript Express server to avoid CORS issues:

```bash
npm run server
```

This starts a TypeScript proxy server on `http://localhost:3001` that forwards webhook requests to Slack.

**Why a proxy server?** Browsers block direct requests to Slack webhooks due to CORS policy. The proxy server runs on Node.js (server-side) where CORS restrictions don't apply.

**Production deployment:**

```bash
npm run server:build  # Compile TypeScript
npm run server:prod   # Run compiled JavaScript
```

### 5. Test the Integration

**Option A: Use the convenience script (recommended)**

```bash
./start-dev.sh
```

**Option B: Start services manually**

1. Start the proxy server: `npm run server`
2. In another terminal, start your app: `npm run dev`
3. Check both consoles for success messages
4. Join/leave chargers or queues to see notifications in Slack

## Message Examples

### Charger Join

```
⚡ John Doe started charging at Charger A

🚙 Vehicle: 2023 Model 3 Long Range
🔋 Battery: 45% → 80%
⏱️ Est. Time: 2h 15m
🏁 Est. Finish: 3:45 PM

📊 Battery: 79kWh | Charge Time: 11h 48m
```

### Queue Join

```
📋 Jane Smith joined the charging queue

🥇 Position: #1 in queue
🚕 Vehicle: 2022 Model Y Performance
🔋 Planned Charge: 30% → 90%
⏱️ Est. Time Needed: 3h 20m
```

## Troubleshooting

- **Webhook not sending messages**: Check webhook URL is correct and active
- **Permission errors**: Ensure the webhook was properly authorized for the channel
- **Invalid webhook**: Regenerate the webhook URL if it's not working
- **Rate limiting**: Slack has rate limits; notifications may be delayed

## Security Notes

- Webhook URLs are sensitive - never commit them to version control
- Use environment variables for all configuration
- The webhook only sends notifications, it doesn't read messages
- Consider using a dedicated channel for charging notifications
