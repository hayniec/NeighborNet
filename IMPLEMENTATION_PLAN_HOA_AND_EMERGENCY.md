# Implementation Plan: HOA Info Enhancement & Emergency Button Settings

## Overview
Two main features to implement:
1. Enhanced HOA Info page with comprehensive information
2. User settings for emergency button (visibility + position)

## Part 1: Enhanced HOA Info Page

### Current State
The HOA page already has:
- Dues & Fees display
- Board Members/Officers list
- Contact information
- Documents section

### Enhancements Needed
Add the following sections:

#### 1. Community Overview Section
- Community name
- Total homes/units
- Year established (if available)
- Community description/welcome message

#### 2. Meeting Information
- Regular meeting schedule (e.g., "2nd Tuesday of each month")
- Meeting location
- Next meeting date
- Meeting minutes (link to documents)

#### 3. Amenities & Facilities
- List of community amenities (pool, clubhouse, gym, etc.)
- Hours of operation
- Reservation requirements
- Contact for amenity issues

#### 4. Rules & Regulations Highlights
- Key rules summary
- Link to full CC&Rs document
- Architectural review process
- Violation reporting

#### 5. Vendor/Service Provider Information
- Landscaping company
- Pool maintenance
- Security service
- Management company contact

### Database Schema Updates Needed
Add to `communities` table `hoaSettings`:
```typescript
{
  // Existing
  duesAmount, duesFrequency, duesDate, contactEmail,
  
  // New
  meetingSchedule: string,
  meetingLocation: string,
  nextMeetingDate: string,
  amenities: string[], // ["Pool", "Clubhouse", "Gym"]
  amenityHours: string,
  establishedYear: number,
  totalHomes: number,
  description: string,
  vendors: {
    landscaping?: { name: string, phone: string },
    pool?: { name: string, phone: string },
    security?: { name: string, phone: string },
    management?: { name: string, phone: string, email: string }
  }
}
```

## Part 2: Emergency Button Settings

### User Preferences to Add
Store in `UserContext` or localStorage:
```typescript
{
  emergencyButton: {
    visible: boolean,  // Show/hide button
    position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  }
}
```

### Implementation Steps

#### 1. Update UserContext
Add emergency button preferences to UserProfile type

#### 2. Create Settings UI
In `app/dashboard/settings/page.tsx`, add new section:
- "Emergency Button Settings"
- Toggle for visibility
- Radio buttons or dropdown for position (4 corners)
- Preview of button position

#### 3. Update DashboardLayoutClient
- Read user preferences from context
- Apply position class dynamically based on preference
- Respect visibility setting

#### 4. Add CSS Classes
In `dashboard.module.css`, add position variants:
```css
.sosButton.bottomLeft { bottom: 1.5rem; left: 1.5rem; }
.sosButton.bottomRight { bottom: 1.5rem; right: 1.5rem; }
.sosButton.topLeft { top: 1.5rem; left: 1.5rem; }
.sosButton.topRight { top: 1.5rem; right: 1.5rem; }
```

## Implementation Order

1. ✅ Create this plan document
2. Add emergency button settings to UserContext type
3. Update settings page UI for emergency button preferences
4. Update DashboardLayoutClient to use preferences
5. Add CSS for position variants
6. Enhance HOA Info page UI
7. Test both features
8. Commit and push

## Files to Modify

### Emergency Button Settings:
- `contexts/UserContext.tsx` - Add preferences type
- `app/dashboard/settings/page.tsx` - Add UI for preferences
- `app/dashboard/DashboardLayoutClient.tsx` - Read and apply preferences
- `components/dashboard/dashboard.module.css` - Add position classes

### HOA Info Enhancement:
- `app/dashboard/hoa/page.tsx` - Add new sections
- `app/dashboard/hoa/hoa.module.css` - Add styles for new sections
- `db/schema.ts` - Update hoaSettings type (optional, can use existing JSON field)

## Notes
- Emergency button preferences should persist in localStorage
- HOA info should be editable by admins (future enhancement)
- Consider mobile responsiveness for emergency button positions
- Ensure emergency button doesn't overlap with other UI elements
