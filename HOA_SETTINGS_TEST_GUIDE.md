# HOA Settings Save - Manual Testing Guide

## 🎯 Purpose
Verify that the HOA Settings save functionality works correctly in the Admin Console.

## 🔧 Setup
1. **Dev Server**: Already running on `http://localhost:3000`
2. **Browser**: Open your preferred browser

## 📋 Testing Steps

### Step 1: Navigate to Admin Console
1. Go to `http://localhost:3000`
2. Log in with an admin account
3. Navigate to **Admin Console** (should be in sidebar or main navigation)

### Step 2: Open Developer Console
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I`
- **Firefox**: Press `F12` or `Ctrl+Shift+K`
- Look at the **Console** tab

### Step 3: Verify Community ID Loaded
In the console, you should see logs like:
```
[Admin] Using user.communityId: <some-id>
[Admin] getCommunities response: {...}
[Admin] Current community: {...}
[Admin] Loading HOA settings: {...}
```

✅ **Expected**: You see a valid communityId (UUID format)
❌ **Problem**: If you see "No communities found" or communityId is empty, there's an issue

### Step 4: Test HOA Settings Save
1. On the "Configuration" tab, scroll to the **HOA Settings** card
2. Fill in the following test data:
   - **Dues Amount**: `150`
   - **Payment Frequency**: `Monthly`
   - **Due Date**: `1st`
   - **Board Contact Email**: `board@test.com`
3. Click **"Save HOA Settings"** button

### Step 5: Check Console Logs
After clicking save, you should see in the console:
```
[Admin] Attempting to save HOA settings. CommunityId: <communityId>
[Admin] Saving HOA settings: {duesAmount: "150", duesFrequency: "Monthly", ...}
[Admin] Save HOA settings response: {success: true, ...}
```

### Step 6: Verify Success
✅ **Expected**:
- Alert popup: "HOA settings saved successfully!"
- No errors in console
- Response shows `success: true`

❌ **Failure Scenarios**:
1. **Alert: "Error: No community ID found..."**
   - Console should show: `[Admin] Cannot save: communityId is empty`
   - Action: Refresh page and check if user is properly logged in

2. **Alert: "Failed to save: <error message>"**
   - Check console for `[Admin] Save HOA settings response: {success: false, error: "..."}`
   - Action: Check the specific error message for database/permissions issues

### Step 7: Verify Persistence
1. Refresh the page
2. Go back to Admin Console → Configuration
3. Check that the HOA Settings fields are pre-populated with the values you saved

✅ **Expected**: All fields show your saved values
❌ **Problem**: If fields are empty, the save may have failed silently

## 🐛 Troubleshooting

### Issue: "No community ID found" error
**Cause**: User's communityId is not set or getCommunities() returns empty
**Fix**: 
- Check if user is properly logged in
- Verify user has a valid community membership
- Check database for user's community association

### Issue: Save appears to work but values don't persist
**Cause**: Database update might be failing silently
**Fix**:
- Check the console response object
- Verify the `updateCommunityHoaSettings` server action is working
- Check database permissions

### Issue: No console logs appear
**Cause**: You might be on the wrong page or console is filtered
**Fix**:
- Make sure you're on the Admin Console page
- Clear console filters (top of console: ensure "All levels" is selected)
- Try reloading the page

## ✅ Success Criteria
- [ ] CommunityId loads correctly on page load
- [ ] Console shows all expected logs when saving
- [ ] Success alert appears after save
- [ ] Values persist after page refresh
- [ ] No errors in console during the entire flow

## 📝 Notes
All console logs are prefixed with `[Admin]` to make them easy to find. Use the console filter to search for "Admin" if needed.
