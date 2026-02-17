# Multi-Role System - Production Database Migration Required

## Issue
Event creation is failing on the production site (kithgrid.netlify.app) with the error:
```
Failed to create event: Unauthorized: Only Admins or Event Managers can create events.
```

## Root Cause
The code changes for the multi-role system have been deployed to Netlify, but the **production database migration has not been run yet**. This means:

- ✅ Code is updated (checks both `role` and `roles` array)
- ❌ Production database still has NULL/empty `roles` arrays
- ✅ Local database has been migrated successfully

## Solution
Run the migration script on the **production database** (Netlify's Neon database).

### Option 1: Run Migration Script Directly
```bash
# Make sure DATABASE_URL points to production database
npx tsx scripts/migrate-to-multi-roles.ts
```

### Option 2: Manual SQL Migration
Run this SQL directly on the production database:

```sql
-- 1. Add 'roles' column if not exists
ALTER TABLE neighbors 
ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['Resident'];

-- 2. Populate 'roles' from existing 'role' column
UPDATE neighbors 
SET roles = ARRAY[role] 
WHERE role IS NOT NULL;

-- 3. Handle NULL roles (fall back to Resident)
UPDATE neighbors 
SET roles = ARRAY['Resident'] 
WHERE role IS NULL;
```

### Option 3: Use Netlify Environment Variables
If you want to run the migration from your local machine against production:

1. Get the production `DATABASE_URL` from Netlify environment variables
2. Temporarily set it in your `.env.local`:
   ```
   DATABASE_URL=<production_database_url>
   ```
3. Run: `npx tsx scripts/migrate-to-multi-roles.ts`
4. **IMPORTANT**: Restore your local `DATABASE_URL` after migration

## Verification
After running the migration, you can verify it worked by:

1. Trying to create an event on the production site
2. Or running the check script against production:
   ```bash
   npx tsx scripts/check-roles.ts
   ```

## Files Modified in This Session
- `app/actions/events.ts` - Updated permission checks for multi-role
- `app/actions/invitations.ts` - Updated admin check for multi-role
- `app/dashboard/documents/page.tsx` - Fixed role type comparison
- `app/join/page.tsx` - Added roles array to new user profiles
- `scripts/check-roles.ts` - New script to verify roles column

## Commits Pushed
1. `feat: implement multi-role system for user management` (66536ff)
2. `fix: resolve TypeScript build errors for multi-role system` (a3d8e83)
3. `fix: update event permissions to support multi-role system` (96de144)
