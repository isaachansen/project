#!/bin/bash

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚂 Tesla Charging Queue - Railway Setup${NC}"
echo "======================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Installing Railway CLI...${NC}"
    npm install -g @railway/cli
else
    echo -e "${GREEN}✅ Railway CLI already installed${NC}"
fi

echo -e "${BLUE}Setting up Railway project...${NC}"

# Login to Railway (if not already logged in)
if ! railway whoami &> /dev/null; then
    echo -e "${YELLOW}Please log in to Railway...${NC}"
    railway login
fi

# Initialize Railway project (if not already initialized)
if [ ! -f "railway.toml" ]; then
    echo -e "${YELLOW}Initializing Railway project...${NC}"
    railway init
else
    echo -e "${GREEN}✅ Railway project already initialized${NC}"
fi

echo -e "${GREEN}🎉 Railway setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set your environment variables: railway variables set VARIABLE_NAME=value"
echo "2. Deploy your app: railway up"
echo "3. View your deployment: railway open"
echo ""
echo -e "${BLUE}Useful Railway commands:${NC}"
echo "  railway up           # Deploy to Railway"
echo "  railway logs         # View logs"
echo "  railway open         # Open deployed app"
echo "  railway variables    # Manage environment variables"
echo "  railway status       # Check deployment status" 