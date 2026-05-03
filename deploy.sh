#!/bin/bash
# NUTECH BusTrack - Quick Deploy Script
# Run these commands in order to push and deploy to Railway

echo "🚀 NUTECH BusTrack - Railway Deployment"
echo "======================================="
echo ""

# Step 1: Verify build works
echo "✓ Step 1: Verifying build..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Fix errors and try again."
  exit 1
fi

# Step 2: Check git status
echo ""
echo "✓ Step 2: Checking git status..."
git status

# Step 3: Stage all changes
echo ""
echo "✓ Step 3: Staging changes..."
git add .

# Step 4: Commit
echo ""
echo "✓ Step 4: Creating commit..."
git commit -m "feat: finalize railway deployment

- Add Procfile for Next.js web service
- Add Procfile for Socket.io server
- Configure railway.json for auto-deployment  
- Add build scripts for production
- Create comprehensive deployment guides
- Add dockerignore for optimized builds"

if [ $? -ne 0 ]; then
  echo "⚠️  Nothing to commit (already committed)"
fi

# Step 5: Push to GitHub
echo ""
echo "✓ Step 5: Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Success! Your code is now on GitHub."
  echo ""
  echo "📋 Next Steps:"
  echo "1. Go to https://railway.app/dashboard"
  echo "2. Click 'New Project' → 'Deploy from GitHub'"
  echo "3. Select 'Khan-Feroz211/Nutech-Bus-Route'"
  echo "4. Click 'Deploy'"
  echo "5. Add environment variables in Railway dashboard"
  echo "6. Watch the build in Railway!"
  echo ""
  echo "🔗 Environment Variables Guide: See DEPLOYMENT_RAILWAY.md"
  echo "📝 Full Checklist: See PRE_DEPLOYMENT_CHECKLIST.md"
else
  echo "❌ Push failed. Check your git configuration."
  exit 1
fi
