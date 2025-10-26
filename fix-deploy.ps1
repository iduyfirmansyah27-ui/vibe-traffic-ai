# Fix Vercel Deployment Script
# Run this script before deploying to Vercel

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Install/update required dependencies
Write-Host "Installing/updating dependencies..." -ForegroundColor Cyan
& npm install -D @vitejs/plugin-react @types/node

# Create/update vercel.json
$vercelConfig = @{
    "version" = 2
    "builds" = @(
        @{
            "src" = "package.json"
            "use" = "@vercel/static-build"
            "config" = @{
                "distDir" = "dist"
            }
        }
    )
    "routes" = @(
        @{
            "src" = "/.*"
            "dest" = "/index.html"
        }
    )
}

$vercelConfig | ConvertTo-Json -Depth 10 | Set-Content -Path "vercel.json" -Force
Write-Host "Created/updated vercel.json" -ForegroundColor Green

# Build the project
Write-Host "Building the project..." -ForegroundColor Cyan
& npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build completed successfully! You can now deploy to Vercel." -ForegroundColor Green
} else {
    Write-Host "Build failed. Please check the error messages above." -ForegroundColor Red
}
