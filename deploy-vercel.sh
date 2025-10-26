#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Vercel deployment process..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Install project dependencies
echo "🔧 Installing project dependencies..."
npm install --production=false

# Build the project
echo "🔨 Building the project..."
npm run build

# Create vercel.json if it doesn't exist
if [ ! -f "vercel.json" ]; then
    echo "📝 Creating vercel.json..."
    cat > vercel.json <<EOL
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
EOL
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod --confirm

echo "✅ Deployment completed successfully!"
