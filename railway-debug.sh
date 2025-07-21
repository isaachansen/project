#!/bin/bash

echo "🔍 Railway Build Debug Information"
echo "=================================="

echo ""
echo "📦 Node.js Version:"
node --version

echo ""
echo "📦 NPM Version:"
npm --version

echo ""
echo "📋 Package.json dependencies:"
cat package.json | grep -A 20 '"dependencies"'

echo ""
echo "📋 Package.json devDependencies:"
cat package.json | grep -A 20 '"devDependencies"'

echo ""
echo "📁 Current Directory Contents:"
ls -la

echo ""
echo "📁 TypeScript Config (server):"
cat tsconfig.server.json

echo ""
echo "🔨 Testing individual build steps:"

echo ""
echo "Step 1: npm ci --production=false"
npm ci --production=false

echo ""
echo "Step 2: npm run build"
npm run build

echo ""
echo "Step 3: npm run server:build"
npm run server:build

echo ""
echo "📁 Build Output (dist/):"
ls -la dist/

echo ""
echo "🎉 All build steps completed successfully!" 