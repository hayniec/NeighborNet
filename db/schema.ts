
import { pgTable, uuid, text, boolean, decimal, timestamp, integer, time, date, json } from 'drizzle-orm/pg-core';

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

// 1. Users (Global Authentication)
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    password: text('password'), // Simple password for now
    name: text('name').notNull(),
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow(),
});

// 2. Members (Community Specific Profile)
// Formerly 'neighbors'
export const members = pgTable('neighbors', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id),
    communityId: uuid('community_id').references(() => communities.id).notNull(),

    role: text('role', { enum: ['Admin', 'Resident', 'Board Member', 'Event Manager'] }).default('Resident'),
    hoaPosition: text('hoa_position'),
    address: text('address'),

    // Emergency Info (Specific to this home/community context)
    personalEmergencyCode: text('personal_emergency_code'),
    personalEmergencyInstructions: text('personal_emergency_instructions'),

    skills: text('skills').array(),
    equipment: json('equipment').default([]),
    joinedDate: timestamp('joined_date', { withTimezone: true }).defaultNow(),
    isOnline: boolean('is_online').default(false),
});

// 3. Invitations
export const invitations = pgTable('invitations', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    code: text('code').notNull().unique(), // e.g., "A1B2C3"
    email: text('email').notNull(),
    invitedName: text('invited_name'),
    role: text('role', { enum: ['Admin', 'Resident', 'Board Member', 'Event Manager'] }).default('Resident'),
    hoaPosition: text('hoa_position'),
    status: text('status', { enum: ['pending', 'used', 'expired'] }).default('pending'),
    createdBy: uuid('created_by').references(() => members.id), // Reference to the admin member
    createdAt: timestamp('created_at').defaultNow(),
    expiresAt: timestamp('expires_at'),
});

// 4. Events
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    date: date('date').notNull(),
    time: time('time').notNull(),
    location: text('location'),
    category: text('category', { enum: ['Social', 'HOA', 'Maintenance', 'Security'] }),
    organizerId: uuid('organizer_id').references(() => members.id),
    attendeesCount: integer('attendees_count').default(0),
});

// 5. Marketplace Items
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
    sellerId: uuid('seller_id').references(() => members.id),
});

// 6. Community Resources
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

// 7. HOA Documents
export const documents = pgTable('documents', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    name: text('name').notNull(),
    category: text('category'),
    uploadDate: timestamp('upload_date', { withTimezone: true }).defaultNow(),
    size: text('size'),
    url: text('url'),
    uploaderId: uuid('uploader_id').references(() => members.id),
});

// 8. Event RSVPs
export const eventRsvps = pgTable('event_rsvps', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    neighborId: uuid('neighbor_id').references(() => members.id).notNull(),
    guestCount: integer('guest_count').default(1),
    status: text('status', { enum: ['Going', 'Maybe', 'Not Going'] }).default('Going'),
    rsvpDate: timestamp('rsvp_date', { withTimezone: true }).defaultNow(),
});

// 9. Forum Posts
export const forumPosts = pgTable('forum_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    authorId: uuid('author_id').references(() => members.id).notNull(),
    content: text('content').notNull(),
    category: text('category').notNull(),
    likes: integer('likes').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 10. Forum Comments
export const forumComments = pgTable('forum_comments', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => forumPosts.id, { onDelete: 'cascade' }).notNull(),
    authorId: uuid('author_id').references(() => members.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 11. Service Providers
export const serviceProviders = pgTable('service_providers', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    phone: text('phone'),
    rating: decimal('rating', { precision: 2, scale: 1 }).default('5.0'),
    description: text('description'),
    recommendedBy: text('recommended_by'), // Could be a name or reference to a member
});

// 12. Local Guide Places
export const localPlaces = pgTable('local_places', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id).notNull(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    address: text('address'),
    description: text('description'),
    rating: decimal('rating', { precision: 2, scale: 1 }),
});

// 13. Direct Messages
export const directMessages = pgTable('direct_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    senderId: uuid('sender_id').references(() => members.id).notNull(),
    recipientId: uuid('recipient_id').references(() => members.id).notNull(),
    content: text('content').notNull(),
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 14. Forum Likes
export const forumLikes = pgTable('forum_likes', {
    id: uuid('id').primaryKey().defaultRandom(),
    postId: uuid('post_id').references(() => forumPosts.id, { onDelete: 'cascade' }).notNull(),
    memberId: uuid('member_id').references(() => members.id).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
