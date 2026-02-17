# Multi-Role Migration Status

## Completed Tasks
- [x] **Database Schema**: Added `roles` text array column to `neighbors` table. (Kept `role` for backward compatibility).
- [x] **Data Migration**: Migrated existing `role` values to `roles` array via script.
- [x] **Types**: Updated `next-auth.d.ts` to include `roles?: string[]` on `Session` and `User`.
- [x] **Auth Logic**: Updated `app/lib/auth.ts` to fetch `roles` from DB and populate `token` and `session`.
- [x] **User Context**: Updated `UserContext.tsx` to handle `roles` array from session.
- [x] **Permissions**: Updated `isAdmin` helper in `app/actions/invitations.ts` to check `roles` array.
- [x] **Sidebar**: Updated `Sidebar.tsx` to check `user.roles` for "Admin Console" visibility.
- [x] **Neighbors Actions**: Updated `getNeighbors` and `updateNeighbor` to read/write `roles`.
- [x] **Admin UI**: Updated `app/dashboard/admin/page.tsx` to display multiple roles and allow editing/assigning multiple roles via checkboxes.
- [x] **Documents UI**: Updated `app/dashboard/documents/page.tsx` to restrict uploads to Admins or Board Members check using `roles`.

## Pending / Verification
- [ ] **Frontend Verification**: Verify that the Admin UI correctly saves multiple roles and that they persist.
- [ ] **Role Logic Audit**: ensuring all `user.role` checks across the app are either updated to use `user.roles.includes()` or fall back gracefully.
- [ ] **Invite Logic**: Ideally, invitations should support multiple roles, but currently `createInvitation` takes a single `role`. This might need enhancement if we want to invite someone as *both* Admin and Resident explicitly, though usually invitations set a primary role.

## Notes
- The `role` column is currently being "synced" with `roles[0]` for backward compatibility. This should be maintained until all legacy checks are removed.
