
import { pgTable, uuid, text, boolean, decimal, timestamp, integer, time, date } from 'drizzle-orm/pg-core';

// 0. Communities (SaaS Tenants)
export const communities = pgTable('communities', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').unique(), // for neighbornet.com/oak-hills
    planTuple: text('plan_tuple', { enum: ['starter_100', 'growth_250', 'pro_500'] }).default('starter_100'),
    maxHomes: integer('max_homes').default(100),
    isActive: boolean('is_active').default(true),

    // Billing Fields (Stripe placeholders)
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),

    createdAt: timestamp('created_at').defaultNow(),
});

// 1. Neighbors (Users)
export const neighbors = pgTable('neighbors', {
    id: uuid('id').primaryKey().defaultRandom(),
    communityId: uuid('community_id').references(() => communities.id), // Link to the tenant
    name: text('name').notNull(),
    role: text('role', { enum: ['Admin', 'Resident', 'Board Member'] }).default('Resident'),
    address: text('address'),
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
    name: text('name').notNull(),
    category: text('category'),
    uploadDate: timestamp('upload_date', { withTimezone: true }).defaultNow(),
    size: text('size'),
    url: text('url'),
    uploaderId: uuid('uploader_id').references(() => neighbors.id),
});
