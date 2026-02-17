# User ID vs Member ID Fixes - Summary

## Problem
The application has two types of IDs:
- **User ID** (`users.id`) - From the authentication system (NextAuth session)
- **Member ID** (`members.id` / `neighbors.id`) - Community-specific profile

The frontend was passing **user IDs** from the session, but the backend was trying to use them as **member IDs** for database foreign keys, causing constraint violations.

## Root Cause
When a user logs in, the session contains `user.id` which is the `users` table ID. However, many database tables have foreign keys that reference `members.id` (the `neighbors` table), not `users.id`.

## Files Fixed

### 1. `app/actions/events.ts`
**Issues:**
- `createEvent`: Queried by `members.id` instead of `members.userId`
- `createEvent`: Used `data.organizerId` (user ID) for `organizerId` and `neighborId` foreign keys
- `deleteEvent`: Queried by `members.id` instead of `members.userId`

**Fixes:**
- Changed member lookup from `eq(members.id, data.organizerId)` to `eq(members.userId, data.organizerId)`
- Added null checks for member existence
- Used `member.id` instead of `data.organizerId` when inserting events and RSVPs
- Applied same fixes to `deleteEvent`

**Commits:**
- `98b6177` - CRITICAL: lookup members by userId instead of member id
- `f984454` - use member.id instead of user.id when creating events

### 2. `app/actions/messages.ts`
**Issues:**
- `sendMessage`: Received user IDs but tried to insert them directly as foreign keys to `members.id`

**Fixes:**
- Renamed parameters to `senderUserId` and `recipientUserId` for clarity
- Look up both sender and recipient members by `userId`
- Return errors if either member not found
- Use `senderMember.id` and `recipientMember.id` for the insert

**Commits:**
- `aed185c` - lookup member IDs in sendMessage action

### 3. `components/dashboard/EventCard.tsx`
**Issues:**
- Minor formatting issue with attendee count display

**Fixes:**
- Improved spacing and formatting of attendee count
- Better JSX structure for conditional rendering

**Commits:**
- `8991f3c` - improve event attendee count display formatting

## Pattern for Future Development

When working with user data in server actions:

1. **Frontend passes:** `user.id` (from session/UserContext)
2. **Backend receives:** User ID as parameter
3. **Backend looks up:** Member by `members.userId`
4. **Backend uses:** `member.id` for foreign key references

### Example Pattern:
```typescript
export async function someAction(userId: string, ...) {
    // Look up member by user ID
    const [member] = await db.select()
        .from(members)
        .where(eq(members.userId, userId));
    
    if (!member) {
        return { success: false, error: 'Member not found' };
    }
    
    // Use member.id for foreign keys
    await db.insert(someTable).values({
        memberId: member.id,  // ✅ Correct
        // userId: userId,    // ❌ Wrong if FK references members
        ...
    });
}
```

## Tables with Member ID Foreign Keys

These tables reference `members.id` and require member IDs, not user IDs:
- `events.organizerId`
- `event_rsvps.neighborId`
- `direct_messages.senderId`
- `direct_messages.recipientId`
- `forum_posts.authorId`
- `forum_comments.authorId`
- `forum_likes.memberId`
- `marketplace_items.sellerId`
- `announcements.authorId`
- And others...

## Status
✅ Events - Fixed
✅ Messages - Fixed
⚠️  Other features may have the same issue and need similar fixes when discovered

## Next Steps
1. Test event creation on production
2. Test messaging on production
3. Monitor for similar errors in other features
4. Consider adding helper function to centralize user→member lookup
