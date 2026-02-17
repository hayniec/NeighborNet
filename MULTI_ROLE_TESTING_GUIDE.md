# Multi-Role System Testing Guide

## Quick Test Checklist

### 1. Admin Console - Role Assignment ✅
**Location**: `/dashboard/admin`

**Test Steps:**
1. Navigate to Admin Console
2. Click "Edit" on a user
3. Verify you see checkboxes for multiple roles:
   - [ ] Resident
   - [ ] Admin
   - [ ] Board Member
   - [ ] Event Manager
4. Select multiple roles (e.g., Admin + Board Member)
5. Click "Save Changes"
6. Refresh the page
7. Edit the same user again
8. **Expected**: Both roles should still be selected

**What to Look For:**
- ✅ Multiple checkboxes visible
- ✅ Can select more than one role
- ✅ At least one role is always required
- ✅ "Board Member" auto-toggles "Is HOA Officer?"
- ✅ Roles persist after save and refresh

---

### 2. Sidebar - Role Display ✅
**Location**: Left sidebar (all pages)

**Test Steps:**
1. After assigning multiple roles to a user
2. Look at the bottom of the sidebar
3. Check the role display under your name

**Expected Results:**
- **Single Role**: Shows "Admin" or "Resident"
- **Multiple Roles**: Shows "Admin, Board Member" (comma-separated)
- **Formatted**: Proper capitalization and spacing

---

### 3. Admin Console Visibility ✅
**Location**: Sidebar navigation

**Test Steps:**
1. As an **Admin** user:
   - [ ] "Admin Console" link should be visible in sidebar
2. As a **Resident** user:
   - [ ] "Admin Console" link should NOT be visible
3. As a **Board Member** (not Admin):
   - [ ] "Admin Console" link should NOT be visible
4. As **Admin + Board Member**:
   - [ ] "Admin Console" link should be visible

**What to Look For:**
- ✅ Only users with Admin role see the Admin Console link
- ✅ Multi-role users with Admin can access it

---

### 4. Event Management Permissions ✅
**Location**: `/dashboard/events`

**Test Steps:**
1. Test with different role combinations:

**Admin User:**
- [ ] Can see "Create Event" button
- [ ] Can delete events (trash icon visible)

**Board Member User:**
- [ ] Can see "Create Event" button
- [ ] Can delete events

**Event Manager User:**
- [ ] Can see "Create Event" button
- [ ] Can delete events

**Resident User:**
- [ ] Cannot see "Create Event" button
- [ ] Cannot delete events

**Admin + Board Member:**
- [ ] Can see "Create Event" button
- [ ] Can delete events

**What to Look For:**
- ✅ Correct button visibility based on roles
- ✅ Multi-role users get combined permissions

---

### 5. Invite Neighbor Button ✅
**Location**: `/dashboard/neighbors`

**Test Steps:**
1. As an **Admin** user:
   - [ ] "Invite Neighbor" button visible in top-right
2. As a **Resident** user:
   - [ ] "Invite Neighbor" button NOT visible
3. As **Admin + Board Member**:
   - [ ] "Invite Neighbor" button visible

**What to Look For:**
- ✅ Only admins can invite neighbors
- ✅ Multi-role admins can invite

---

### 6. Document Upload Permissions ✅
**Location**: `/dashboard/documents`

**Test Steps:**
1. As an **Admin** user:
   - [ ] Can see "Upload Document" button
2. As a **Board Member** user:
   - [ ] Can see "Upload Document" button
3. As a **Resident** user:
   - [ ] Cannot see "Upload Document" button
4. As **Admin + Board Member**:
   - [ ] Can see "Upload Document" button

**What to Look For:**
- ✅ Admins and Board Members can upload
- ✅ Residents cannot upload

---

### 7. Settings - Role Toggle ✅
**Location**: `/dashboard/settings` (scroll to bottom)

**Test Steps:**
1. Scroll to "Development Tools" section
2. Look at the role toggle button text
3. If you're an Admin, it should say "Switch to Resident Mode"
4. If you're a Resident, it should say "Switch to Admin Mode"
5. Click the button
6. Verify the text changes

**What to Look For:**
- ✅ Button text reflects current role correctly
- ✅ Works with multi-role users (checks primary role)

---

## Advanced Testing Scenarios

### Scenario 1: Multi-Role User Journey
**Setup**: Create a user with Admin + Board Member + Event Manager roles

**Test Flow:**
1. [ ] Can access Admin Console (Admin permission)
2. [ ] Can create events (Event Manager permission)
3. [ ] Can upload documents (Board Member permission)
4. [ ] Can invite neighbors (Admin permission)
5. [ ] Sidebar shows "Admin, Board Member, Event Manager"

**Expected**: User has ALL permissions from ALL roles

---

### Scenario 2: Role Removal
**Setup**: User has Admin + Board Member roles

**Test Flow:**
1. [ ] Edit user in Admin Console
2. [ ] Uncheck "Admin" role (leave only "Board Member")
3. [ ] Save changes
4. [ ] Refresh page
5. [ ] Check sidebar - should show only "Board Member"
6. [ ] "Admin Console" link should disappear
7. [ ] Can still upload documents (Board Member permission)
8. [ ] Cannot invite neighbors (Admin permission removed)

**Expected**: Permissions update immediately after role change

---

### Scenario 3: Board Member Auto-Toggle
**Setup**: Any user

**Test Flow:**
1. [ ] Edit user in Admin Console
2. [ ] Check "Board Member" role
3. [ ] Observe "Is HOA Officer?" checkbox
4. [ ] It should auto-check
5. [ ] "HOA Position" field should appear
6. [ ] Uncheck "Board Member"
7. [ ] "Is HOA Officer?" should remain checked (manual control)

**Expected**: Board Member role suggests HOA officer status

---

## Database Verification (Optional)

If you want to verify the database directly:

```bash
# Run the test script
npx tsx scripts/test-multi-roles.ts
```

**Expected Output:**
- ✅ All users have `roles` array populated
- ✅ `role` field synced with `roles[0]`
- ✅ No users with empty roles array
- ✅ Role distribution statistics

---

## Common Issues & Solutions

### Issue: Roles not persisting
**Solution**: Check browser console for errors. Verify `updateNeighbor` action is being called.

### Issue: Admin Console not visible
**Solution**: Verify user has "Admin" role (case-sensitive). Check `isAdmin()` helper is imported.

### Issue: Multiple roles not showing in sidebar
**Solution**: Verify `formatRolesForDisplay()` is being used. Check user object has `roles` array.

### Issue: Permissions not working
**Solution**: Check that helper functions are imported. Verify role names match exactly (case-sensitive).

---

## Success Criteria

All tests pass if:
- ✅ Multiple roles can be assigned and persist
- ✅ Sidebar displays all roles correctly
- ✅ Permissions work for single and multi-role users
- ✅ UI elements show/hide based on role combinations
- ✅ Role changes take effect immediately
- ✅ No console errors
- ✅ Backward compatibility maintained (single role users still work)

---

## Next Steps After Testing

1. **If all tests pass**: Multi-role system is production-ready! 🎉
2. **If issues found**: Document them and we'll fix them together
3. **Optional enhancements**:
   - Update invitation system to support multi-role invites
   - Add role-based dashboard customization
   - Create role management audit log
