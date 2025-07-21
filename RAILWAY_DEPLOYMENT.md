# Tesla Charging Queue - Railway Deployment Guide

This guide will help you deploy your Tesla Charging Queue application to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your environment variables

## Quick Deploy

### Option 1: One-Click Deploy (Recommended)

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your Tesla Charging Queue repository
5. Railway will automatically detect it's a Node.js project

### Option 2: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Configuration Files

The following files are configured for Railway deployment:

### 1. `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build && npm run server:build"
  },
  "deploy": {
    "startCommand": "node dist/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. `Procfile`

```
web: node dist/server.js
```

### 3. Updated `package.json` scripts

- `start`: Railway's default start command
- `railway:build`: Custom build command
- `railway:start`: Custom start command

## Environment Variables

Set these in Railway's dashboard under your project settings:

### Required Variables

```env
NODE_ENV=production
PORT=${{PORT}}  # Railway provides this automatically
```

### Tesla Charging Queue Specific

```env
# Slack Integration (if using)
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Supabase (if using)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Add any other environment variables your app needs
```

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure these files are in your repository:

- ✅ `railway.json`
- ✅ `Procfile`
- ✅ Updated `package.json`
- ✅ `server.ts` (your Express server)
- ✅ Built client files will be in `dist/` after build

### 2. Create Railway Project

1. Visit [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your Tesla Charging Queue repository

### 3. Configure Build Settings

Railway should automatically detect:

- **Framework**: Node.js
- **Build Command**: `npm ci && npm run build && npm run server:build`
- **Start Command**: `node dist/server.js`

If not detected automatically:

1. Go to project settings
2. Under "Build", set:
   - Build Command: `npm run railway:build`
   - Start Command: `npm run railway:start`

### 4. Set Environment Variables

1. Go to your project dashboard
2. Click on "Variables" tab
3. Add your environment variables one by one

### 5. Deploy

1. Railway will automatically deploy on git push to main branch
2. Monitor the build logs in Railway dashboard
3. Once deployed, Railway will provide a public URL

## Custom Domain (Optional)

1. In Railway dashboard, go to "Settings"
2. Under "Domains", click "Custom Domain"
3. Add your domain and configure DNS
4. Railway provides automatic HTTPS

## Important Notes for Railway

### 1. Static File Serving

Since Railway will only serve your Express server, you need to serve your React build files from the server. The current setup in `server.ts` handles API routes, but you'll need to add static file serving:

Add this to your `server.ts`:

```typescript
import path from "path";

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "../dist")));

// Catch all handler: send back React's index.html file for any non-API routes
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api/")) {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  }
});
```

### 2. Port Configuration

Railway automatically provides a `PORT` environment variable. Your server should use:

```typescript
const PORT = process.env.PORT || 3001;
```

### 3. Build Process

Railway will:

1. Run `npm ci` to install dependencies
2. Run `npm run build` to build the React app
3. Run `npm run server:build` to build the TypeScript server
4. Start the server with `node dist/server.js`

### 4. Health Checks

Railway automatically monitors your `/health` endpoint if available.

## Monitoring and Logs

### View Logs

```bash
# Using Railway CLI
railway logs

# Or view in Railway dashboard under "Deployments"
```

### Monitoring

Railway provides:

- CPU and Memory usage metrics
- Request metrics
- Build and deployment history
- Automatic health checks

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check Railway build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Start Command Issues**

   - Make sure `dist/server.js` exists after build
   - Check the start command in Railway settings

3. **Environment Variables**

   - Verify all required environment variables are set
   - Check variable names (case-sensitive)

4. **Static Files Not Loading**
   - Ensure Express serves static files from `dist/` directory
   - Check file paths in your build output

### Debug Commands

```bash
# Check Railway CLI status
railway status

# View environment variables
railway variables

# Connect to Railway shell (if needed)
railway shell
```

## Continuous Deployment

Railway automatically deploys when you push to your main branch. To customize:

1. **Branch Settings**: Configure which branch triggers deployments
2. **Build Settings**: Modify build commands if needed
3. **Deploy Hooks**: Add pre/post deploy scripts

## Scaling

Railway offers:

- **Horizontal Scaling**: Multiple instances
- **Vertical Scaling**: More CPU/RAM per instance
- **Auto-scaling**: Based on traffic

Configure in Railway dashboard under "Settings" > "Scaling"

## Costs

Railway pricing:

- **Hobby Plan**: $5/month with generous limits
- **Pro Plan**: Usage-based pricing
- **Free Tier**: Available for small projects

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Community support
- **Railway Status**: [status.railway.app](https://status.railway.app)

---

## Quick Reference

### Railway CLI Commands

```bash
railway login          # Login to Railway
railway init           # Initialize project
railway up             # Deploy current directory
railway logs           # View logs
railway shell          # Connect to app shell
railway variables      # List environment variables
railway status         # Check deployment status
```

### Useful Links

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Documentation](https://docs.railway.app)
- [Railway Templates](https://railway.app/templates)
