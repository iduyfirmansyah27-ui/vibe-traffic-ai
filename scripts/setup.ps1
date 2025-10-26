# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Install TypeScript and Vite plugins
Write-Host "Installing TypeScript and Vite plugins..."
npm install --save-dev typescript @types/node @types/react @types/react-dom @vitejs/plugin-react vite-plugin-svgr

# Install production dependencies
Write-Host "Installing production dependencies..."
npm install react react-dom lucide-react

# Build the project
Write-Host "Building the project..."
npm run build

Write-Host "Setup completed successfully!"
