
import { pgTable, uuid, text, boolean, decimal, timestamp, integer, time, date } from 'drizzle-orm/pg-core';

// 0. Communities (SaaS Tenants)
export const communities = pgTable('communities', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').unique(), // for neighbornet.com/oak-hills
    planTuple: text('plan_tuple', { enum: ['starter_100', 'growth_250', 'pro_500'] }).default('starter_100'),
    maxHomes: integer('max_homes').default(100),
    isActive: boolean('is_active').default(true),

    // Branding
    logoUrl: text('logo_url'),
    primaryColor: text('primary_color').default('#4f46e5'),
    secondaryColor: text('secondary_color').default('#1e1b4b'),
    accentColor: text('accent_color').default('#f59e0b'),

    // Feature Flags (Modules)
    hasMarketplace: boolean('has_marketplace').default(true),
    hasResources: boolean('has_resources').default(true),
    hasEvents: boolean('has_events').default(true),
    hasDocuments: boolean('has_documents').default(true),
    hasForum: boolean('has_forum').default(true),
    hasMessages: boolean('has_messages').default(true),
    hasServicePros: boolean('has_service_pros').default(true),
    hasLocalGuide: boolean('has_local_guide').default(true),

    // Billing Fields (Stripe placeholders)
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),

    // Emergency Access
    emergencyAccessCode: text('emergency_access_code'),
    emergencyInstructions: text('emergency_instructions'),

    createdAt: timestamp('created_at').defaultNow(),
});

// Invitations table (for new resident sign-ups)
export const invitations = pgTable('invitations', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    code: text('code').notNull().unique(), // e.g., "A1B2C3"
    email: text('email').notNull(),
    status: text('status', { enum: ['pending', 'used', 'expired'] }).default('pending'),
    createdBy: uuid('created_by'), // References neighbors.id (admin who created it)
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'), // Optional expiration
});

// 1. Neighbors (Users)
export const neighbors = pgTable('neighbors', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id), // Link to the tenant
    email: text('email').notNull().unique(), // Add email for auth, unique to ensure 1 community per user
    password: text('password'), // Add simple password for MVP
    name: text('name').notNull(),
    role: text('role', { enum: ['Admin', 'Resident', 'Board Member', 'Event Manager'] }).default('Resident'),
    address: text('address'),
    personalEmergencyCode: text('personal_emergency_code'),
    personalEmergencyInstructions: text('personal_emergency_instructions'),
    avatar: text('avatar'),
    // Note: Array support in Drizzle requires specific setup or json handling if strict arrays aren't needed. 
    // For simplicity using simple arrays if supported by driver, or jsonb.
    // Neon supports arrays, but Drizzle pg-core doesn't always have a direct .array() helper depending on version.
    // We'll use text[] if possible, otherwise we might standardise on a separate table or comma-separated string for simplicity in basic MVP.
    // Update: Drizzle supports arrays in recent versions.
    skills: text('skills').array(),
    joinedDate: timestamp('joined_date', { withTimezone: true }).defaultNow(),
    isOnline: boolean('is_online').default(false),
});

// 2. Events
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    date: date('date').notNull(),
    time: time('time').notNull(),
    location: text('location'),
    category: text('category', { enum: ['Social', 'HOA', 'Maintenance', 'Security'] }),
    organizerId: uuid('organizer_id').references(() => neighbors.id),
    attendeesCount: integer('attendees_count').default(0),
});

// 3. Marketplace Items
export const marketplaceItems = pgTable('marketplace_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).default('0'),
    isFree: boolean('is_free').default(false),
    isNegotiable: boolean('is_negotiable').default(false),
    images: text('images').array(),
    status: text('status', { enum: ['Active', 'Sold', 'Expired'] }).default('Active'),
    postedDate: timestamp('posted_date', { withTimezone: true }).defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    sellerId: uuid('seller_id').references(() => neighbors.id),
});

// 4. Community Resources
export const resources = pgTable('resources', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    name: text('name').notNull(),
    type: text('type', { enum: ['Facility', 'Tool', 'Vehicle'] }),
    capacity: integer('capacity'),
    description: text('description'),
    isReservable: boolean('is_reservable').default(true),
    imageUrl: text('image_url'),
});

// 5. HOA Documents
export const documents = pgTable('documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    name: text('name').notNull(),
    category: text('category'),
    uploadDate: timestamp('upload_date', { withTimezone: true }).defaultNow(),
    size: text('size'),
    url: text('url'),
    uploaderId: uuid('uploader_id').references(() => neighbors.id),
});

// 6. Event RSVPs
export const eventRsvps = pgTable('event_rsvps', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    neighborId: uuid('neighbor_id').references(() => neighbors.id).notNull(),
    guestCount: integer('guest_count').default(1),
    status: text('status', { enum: ['Going', 'Maybe', 'Not Going'] }).default('Going'),
    rsvpDate: timestamp('rsvp_date', { withTimezone: true }).defaultNow(),
});
