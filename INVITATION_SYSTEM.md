# Invitation System Documentation

## Overview

The KithGrid invitation system allows HOA administrators to invite new residents to join their community. The system is database-backed and includes code generation, validation, and usage tracking.

## How It Works

### For Administrators

1. **Navigate to Admin Console**: Go to `/dashboard/admin` and click the "Invitations" tab
2. **Generate an Invitation**:
   - Enter the recipient's email address
   - Click "Generate Code"
   - The system will create a unique 6-character code (e.g., "A1B2C3")
   - You'll receive an alert with the code to share with the recipient
3. **Manage Invitations**: View all pending and used invitations in the list
4. **Delete Invitations**: Remove unwanted invitations before they're used

### For New Residents

1. **Visit the Join Page**: Go to `/join`
2. **Enter Invitation Code**: Enter the code provided by the administrator
3. **Complete Profile**: Fill out your information (name, address, password)
4. **Account Created**: The invitation is marked as "used" and you can access the community

## Database Schema

```typescript
invitations table:
- id: UUID (primary key)
- communityId: UUID (references communities.id)
- code: TEXT (unique, e.g., "A1B2C3")
- email: TEXT (recipient email)
- status: ENUM ('pending', 'used', 'expired')
- createdBy: UUID (optional, references neighbors.id)
- createdAt: TIMESTAMP
- expiresAt: TIMESTAMP (optional expiration date)
```

## Server Actions

### `createInvitation(data)`
Creates a new invitation with a random 6-character code.

**Parameters:**
- `communityId`: UUID of the community
- `email`: Recipient's email address
- `createdBy` (optional): Admin who created the invitation

**Returns:**
```typescript
{
  success: boolean,
  data?: { id, code, email, status },
  error?: string
}
```

### `validateInvitation(code)`
Validates an invitation code.

**Parameters:**
- `code`: The invitation code to validate

**Returns:**
```typescript
{
  success: boolean,
  data?: { id, code, email, communityId },
  error?: string
}
```

### `markInvitationUsed(code)`
Marks an invitation as used after successful registration.

**Parameters:**
- `code`: The invitation code

**Returns:**
```typescript
{
  success: boolean,
  message?: string,
  error?: string
}
```

### `getInvitations(communityId)`
Retrieves all invitations for a community.

**Parameters:**
- `communityId`: UUID of the community

**Returns:**
```typescript
{
  success: boolean,
  data?: Array<{ id, code, email, status, createdAt }>,
  error?: string
}
```

### `deleteInvitation(id)`
Deletes an invitation.

**Parameters:**
- `id`: UUID of the invitation

**Returns:**
```typescript
{
  success: boolean,
  message?: string,
  error?: string
}
```

## Future Enhancements

1. **Email Integration**: Automatically send invitation codes via email
2. **Expiration**: Set automatic expiration dates for invitations
3. **Bulk Invitations**: Generate multiple invitations at once
4. **Invitation Templates**: Customize the invitation message
5. **Usage Analytics**: Track invitation acceptance rates
6. **Resend Codes**: Allow administrators to resend codes to the same email

## Security Considerations

- Codes are unique and randomly generated
- Invitations can only be used once
- Validation happens server-side (not client-side)
- Administrators can delete unused invitations
- Status tracking prevents code reuse

## Testing the System

1. **As Admin**:
   - Go to `/dashboard/admin`
   - Click "Invitations" tab
   - Enter an email and click "Generate Code"
   - Note the generated code

2. **As New User**:
   - Go to `/join`
   - Enter the code from step 1
   - Complete the registration form
   - Verify the invitation is marked as "used" in the admin panel

## Notes

- The current implementation uses a temporary `COMMUNITY_ID` constant
- In production, this should be replaced with the actual community ID from the user's session/context
- User account creation is currently simulated - actual user creation logic needs to be implemented

## Email Setup & Configuration

To enable automated email invitations, you must configure the **Resend** service.

### 1. Get API Key
1.  Sign up for free at [resend.com](https://resend.com).
2.  Create a new API Key.
3.  Copy the key (it starts with `re_`).

### 2. Configure Environment
1.  Open your `.env.local` file.
2.  Add the following line:
    ```env
    RESEND_API_KEY=re_123456789...ZkWAbyk_McMqFinZRHKX8D3q6MSFYFq4
    ```
3.  **Restart your development server** (`Ctrl+C` then `npm run dev`) to load the new key.

### 3. Verification
-   Go to the Admin Console -> Invitations.
-   Send an invite to your own email address.
-   Check your inbox (and spam folder) for the invitation code.
-   **Note**: On the free tier, you can only send emails to the address you signed up with (unless you verify a custom domain).
