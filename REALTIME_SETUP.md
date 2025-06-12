# Tesla Charging Queue - Realtime Setup

This application now uses **Supabase Realtime** to ensure all users see the same charging station status and queue updates in real-time.

## Features

### 🔄 Real-time Updates

- **Charging Sessions**: Instantly see when someone starts or stops charging
- **Queue Changes**: Live updates when people join or leave the queue
- **Station Availability**: Immediate notifications when charging stations become available
- **Profile Updates**: See updated user information in the queue display

### 🔔 Toast Notifications

- Success notifications when charging starts
- Info notifications for queue changes
- Station availability alerts
- Connection status updates

### 📊 Connection Status

- Live connection indicator in the header
- Online user count display
- Connection health monitoring
- Automatic reconnection handling

## Technical Implementation

### Database Tables with Realtime

The following tables have realtime enabled:

- `charging_sessions` - For charging start/stop events
- `queue_entries` - For queue join/leave events
- `users` - For profile updates

### Realtime Subscriptions

The app subscribes to PostgreSQL changes using Supabase's realtime functionality:

```typescript
// Subscribe to charging sessions
supabase
  .channel("charging_sessions_changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "charging_sessions",
    },
    handleChargingChange
  )
  .subscribe();
```

### Components

- **useCharging Hook**: Manages realtime subscriptions and data updates
- **useRealtimeStatus Hook**: Tracks connection status and online users
- **RealtimeDemo Component**: Shows connection status and provides test functionality
- **Header Component**: Displays live connection indicator

## Setup Requirements

### 1. Database Migration

Run the realtime enablement migration:

```sql
-- Enable realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE charging_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
```

### 2. Supabase Configuration

Ensure your Supabase project has realtime enabled (it's enabled by default on new projects).

### 3. Dependencies

The app uses these packages for realtime functionality:

- `@supabase/supabase-js` - Supabase client with realtime support
- `sonner` - Toast notifications for realtime events

## Testing Realtime

### Multi-User Testing

1. Open the app in multiple browser windows/tabs
2. Sign in as different users in each window
3. Perform actions (start charging, join queue) in one window
4. Observe real-time updates in other windows

### Connection Status

- Check the "Live" indicator in the header
- View online user count
- Use the "Test Notification" button in the Realtime Status card

### Expected Behaviors

- ⚡ **Charging Events**: Toast notifications when someone starts/stops charging
- 👥 **Queue Events**: Notifications when people join/leave the queue
- 🔌 **Station Updates**: Immediate visual updates to station availability
- 📱 **Cross-Device**: Changes sync across all devices and browsers

## Troubleshooting

### Connection Issues

- Check browser console for realtime connection logs
- Verify Supabase project has realtime enabled
- Ensure proper network connectivity

### Missing Updates

- Verify database tables have realtime enabled
- Check subscription setup in useCharging hook
- Confirm proper event handling in components

### Performance

- Realtime subscriptions are automatically cleaned up on component unmount
- Connection pooling is handled by Supabase client
- Toast notifications are throttled to prevent spam

## Benefits

✅ **Instant Updates**: No more 30-second polling delays  
✅ **Better UX**: Users see changes immediately  
✅ **Reduced Load**: More efficient than constant API polling  
✅ **Scalable**: Handles multiple concurrent users  
✅ **Reliable**: Automatic reconnection and error handling
