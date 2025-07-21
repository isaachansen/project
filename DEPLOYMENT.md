# Tesla Charging Queue - Deployment Guide

This guide covers all deployment options for the Tesla Charging Queue application.

## Quick Start

### Local Development

```bash
# Start both client and server in development mode
npm run dev          # Client (Vite dev server)
npm run server:dev   # Server (with auto-reload)
```

### Production Deployment

```bash
# Using the deployment script
./deploy.sh start    # Build and start both services
./deploy.sh stop     # Stop all services
./deploy.sh restart  # Restart with fresh build
./deploy.sh status   # Check service status
```

## Deployment Options

### 1. Simple Script Deployment (`deploy.sh`)

The provided deployment script handles building and starting both the client and server:

```bash
# Available commands
./deploy.sh build    # Build both client and server
./deploy.sh start    # Start both services (builds if needed)
./deploy.sh stop     # Stop running services
./deploy.sh restart  # Full restart with rebuild
./deploy.sh status   # Check service status
./deploy.sh help     # Show help
```

**Ports:**

- Client: http://localhost:5173
- Server: http://localhost:3001
- Health Check: http://localhost:3001/health

### 2. Docker Deployment

#### Single Container

```bash
# Build and run
docker build -t tesla-charging-queue .
docker run -p 3001:3001 -p 5173:5173 --env-file .env tesla-charging-queue
```

#### Docker Compose

```bash
# Start services
docker-compose up -d

# With nginx proxy (production)
docker-compose --profile production up -d

# Stop services
docker-compose down
```

### 3. GitHub Actions CI/CD

The workflow (`.github/workflows/deploy.yml`) includes:

- **Test Job**: Linting and testing
- **Build Job**: Building both client and server
- **Deploy Jobs**: Separate staging and production deployments

**Triggers:**

- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Testing only

**Required Secrets** (if using cloud deployments):

- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (for Vercel)
- `RAILWAY_TOKEN` (for Railway)

## Environment Variables

Create a `.env` file with:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Slack Integration (optional)
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Database (if using Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Add other environment variables as needed
```

## Production Considerations

### 1. Web Server Configuration

For production, consider using a proper web server like nginx to serve static files and proxy API requests:

```nginx
# Example nginx configuration (see nginx.conf)
server {
    listen 80;

    # Serve static files
    location / {
        proxy_pass http://localhost:5173;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:3001;
    }
}
```

### 2. Process Management

Use a process manager like PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name tesla-server
pm2 serve dist --name tesla-client --port 5173

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Security

- Use HTTPS in production
- Set up proper CORS policies
- Implement rate limiting
- Use environment variables for secrets
- Regular security updates

### 4. Monitoring

- Set up health checks (`/health` endpoint)
- Monitor server logs
- Use application monitoring tools
- Set up alerts for downtime

## Cloud Platform Deployments

### Vercel (Client)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`

### Railway (Server)

1. Connect your GitHub repository
2. Set start command: `node dist/server.js`
3. Configure environment variables

### Render (Full Stack)

1. Create a web service
2. Set build command: `npm run build && npm run server:build`
3. Set start command: `./deploy.sh start`

### DigitalOcean App Platform

1. Create a new app from GitHub
2. Configure both web component (client) and backend service (server)
3. Set environment variables

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3001 and 5173 are available
2. **Build failures**: Check Node.js version (requires 18+)
3. **Environment variables**: Ensure `.env` file exists and is properly configured
4. **Permission errors**: Make sure `deploy.sh` is executable (`chmod +x deploy.sh`)

### Logs

```bash
# Check deployment script logs
./deploy.sh status

# Check Docker logs
docker-compose logs tesla-charging-queue

# Check individual service logs
tail -f server.log
tail -f client.log
```

### Health Checks

```bash
# Server health
curl http://localhost:3001/health

# Client availability
curl http://localhost:5173
```

## Scaling

For high-traffic deployments:

1. **Load Balancing**: Use multiple server instances behind a load balancer
2. **CDN**: Serve static assets through a CDN
3. **Database**: Ensure database can handle concurrent connections
4. **Caching**: Implement Redis for session/data caching
5. **Monitoring**: Use APM tools for performance monitoring

## Development Workflow

1. **Feature Development**: Create feature branch from `develop`
2. **Testing**: Push to feature branch triggers CI tests
3. **Staging**: Merge to `develop` deploys to staging
4. **Production**: Merge to `main` deploys to production

## Support

For deployment issues:

1. Check the deployment logs
2. Verify environment variables
3. Test health endpoints
4. Review the troubleshooting section above
