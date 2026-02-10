CREATE TABLE "event_rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"neighbor_id" uuid NOT NULL,
	"guest_count" integer DEFAULT 1,
	"status" text DEFAULT 'Going',
	"rsvp_date" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"community_id" uuid NOT NULL,
	"code" text NOT NULL,
	"email" text NOT NULL,
	"invited_name" text,
	"status" text DEFAULT 'pending',
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	CONSTRAINT "invitations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "emergency_access_code" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "emergency_instructions" text;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "community_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "community_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD COLUMN "community_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "neighbors" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "neighbors" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "neighbors" ADD COLUMN "personal_emergency_code" text;--> statement-breakpoint
ALTER TABLE "neighbors" ADD COLUMN "personal_emergency_instructions" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "community_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_neighbor_id_neighbors_id_fk" FOREIGN KEY ("neighbor_id") REFERENCES "public"."neighbors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighbors" ADD CONSTRAINT "neighbors_email_unique" UNIQUE("email");