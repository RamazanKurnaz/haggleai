# HaggleAI Setup Script
# This script automates the manual setup steps required to get the app running.

Write-Host "🚀 Starting HaggleAI Setup..." -ForegroundColor Green

# 1. Check for Node.js
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Node.js (npm) is not installed or not in your PATH. Please install Node.js first."
    exit 1
}

# 2. Install Root Dependencies
Write-Host "`n📦 Installing Root Dependencies..." -ForegroundColor Cyan
npm install

# 3. Setup Environment Variables
if (!(Test-Path .env)) {
    Write-Host "`n📝 Creating .env file from template..." -ForegroundColor Cyan
    Copy-Item env.template .env
    Write-Warning "⚠️  IMPORTANT: Please open .env and update SHOPIFY_API_KEY, SHOPIFY_API_SECRET, and DATABASE_URL before running the app!"
} else {
    Write-Host "`n✅ .env file already exists." -ForegroundColor Green
}

# 4. Database Setup
Write-Host "`n🗄️  Setting up Database (Prisma)..." -ForegroundColor Cyan
# We use 'npx' to run local binaries
# Note: This might fail if DATABASE_URL is not valid in .env yet.
try {
    npx prisma generate
    # We skip migrate deploy here to avoid errors if env is not set yet.
    Write-Host "⚠️  Skipping auto-migration. Once .env is set, run: npx prisma migrate dev --name init" -ForegroundColor Yellow
} catch {
    Write-Error "Prisma setup failed."
}

# 5. Setup Shopify Function
Write-Host "`n⚙️  Setting up Shopify Function..." -ForegroundColor Cyan
Push-Location extensions/haggle-function
npm install
npm install crypto-js
Pop-Location

# 6. Build Chat Widget
Write-Host "`n🎨 Building Chat Widget (React -> JS)..." -ForegroundColor Cyan
# We use esbuild to bundle the React code
npx esbuild extensions/haggle-chat/assets/haggle-chat-source.tsx --bundle --outfile=extensions/haggle-chat/assets/haggle-chat.js --loader:.js=jsx --minify

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "👉 NEXT STEPS:"
Write-Host "1. Open .env and fill in your keys."
Write-Host "2. Run 'npx prisma migrate dev --name init' to create database tables."
Write-Host "3. Run 'npm run dev' to start the app."

