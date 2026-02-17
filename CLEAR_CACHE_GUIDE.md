# Steps to Fix Stale Code on Netlify

## Issue
The latest code has been deployed to Netlify, but the site is still showing the old authorization error.

## Solutions (Try in order)

### 1. Hard Refresh Browser (FASTEST)
**Try this first!**
- Windows/Linux: Press `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: Press `Cmd + Shift + R`
- Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

### 2. Clear Browser Cache Completely
1. Open browser settings
2. Clear browsing data
3. Select "Cached images and files"
4. Clear data
5. Reload kithgrid.netlify.app

### 3. Try Incognito/Private Window
Open kithgrid.netlify.app in an incognito/private window to bypass all caching

### 4. Clear Netlify Build Cache
1. Go to Netlify Dashboard → Your Site
2. Go to "Deploys" tab
3. Click "Trigger deploy" → "Clear cache and deploy site"
4. Wait for deployment to complete
5. Hard refresh your browser

### 5. Verify Deployment
Check which commit is deployed:
1. Go to Netlify Dashboard → Deploys
2. Look at the latest deploy
3. Verify it shows commit: `96de144` (fix: update event permissions)
4. Click on the deploy to see the build log

### 6. Check for Service Worker
Next.js might have a service worker caching the old code:
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Service Workers" in left sidebar
4. Click "Unregister" for any service workers
5. Reload the page

### 7. Nuclear Option - Force New Deployment
If nothing else works, make a trivial change and redeploy:

```bash
# Add a comment to trigger new build
git commit --allow-empty -m "chore: force rebuild"
git push
```

## How to Test
After trying each solution:
1. Go to kithgrid.netlify.app
2. Log in
3. Try to create an event
4. If it works, you're done! ✅

## Expected Behavior
With the latest code, users with these roles CAN create events:
- Admin
- Event Manager
- Board Member (if they also have Event Manager role)

Your account (eric.haynie@gmail.com) has Admin role, so it should work.
