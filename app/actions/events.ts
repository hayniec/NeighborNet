'use server'

import { db } from "@/db";
import { events, eventRsvps, members } from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";

export type EventActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityEvents(communityId: string, memberId?: string): Promise<EventActionState> {
    try {
        const communityEvents = await db
            .select()
            .from(events)
            .where(eq(events.communityId, communityId))
            .orderBy(desc(events.date));

        if (communityEvents.length === 0) {
            return { success: true, data: [] };
        }

        const eventIds = communityEvents.map(e => e.id);

        // Fetch RSVPs
        const rsvps = await db
            .select()
            .from(eventRsvps)
            .where(inArray(eventRsvps.eventId, eventIds));

        // Map data
        const data = communityEvents.map(event => {
            const eventRsvpsList = rsvps.filter(r => r.eventId === event.id && r.status === 'Going');
            const attendees = eventRsvpsList.reduce((sum, r) => sum + (r.guestCount || 0), 0);

            let userRsvp = 0;
            if (memberId) {
                const myRsvp = eventRsvpsList.find(r => r.neighborId === memberId);
                if (myRsvp) userRsvp = myRsvp.guestCount || 0;
            }

            return {
                id: event.id,
                title: event.title,
                date: event.date,
                time: event.time,
                location: event.location,
                description: event.description,
                organizer: "Neighbor", // TODO: join to return actual organizer name
                attendees: attendees,
                category: event.category,
                userRsvp: userRsvp
            };
        });

        return { success: true, data };
    } catch (error: any) {
        console.error("Failed to fetch events:", error);
        return { success: false, error: error.message };
    }
}

export async function createEvent(data: {
    communityId: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    organizerId: string;
}): Promise<EventActionState> {
    try {
        // Permission check
        const [member] = await db.select().from(members).where(eq(members.id, data.organizerId));
        const role = member?.role?.toLowerCase();

        if (role !== 'admin' && role !== 'event manager') {
            return { success: false, error: 'Unauthorized: Only Admins or Event Managers can create events.' };
        }

        const [newEvent] = await db.insert(events).values({
            communityId: data.communityId,
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            location: data.location,
            category: data.category as "Social" | "HOA" | "Maintenance" | "Security",
            organizerId: data.organizerId,
            attendeesCount: 0
        }).returning();

        // Auto-RSVP organizer?
        await db.insert(eventRsvps).values({
            eventId: newEvent.id,
            neighborId: data.organizerId,
            guestCount: 1,
            status: 'Going'
        });

        return {
            success: true,
            data: {
                ...newEvent,
                attendees: 1,
                userRsvp: 1
            }
        };
    } catch (error: any) {
        console.error("Failed to create event:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteEvent(eventId: string, memberId: string): Promise<EventActionState> {
    try {
        const [member] = await db.select().from(members).where(eq(members.id, memberId));
        const role = member?.role?.toLowerCase();

        if (role !== 'admin' && role !== 'event manager') {
            return { success: false, error: 'Unauthorized: Only Admins or Event Managers can delete events.' };
        }

        await db.delete(events).where(eq(events.id, eventId));
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete event:", error);
        return { success: false, error: error.message };
    }
}

export async function updateRsvp(eventId: string, memberId: string, guestCount: number): Promise<EventActionState> {
    try {
        if (guestCount <= 0) {
            await db.delete(eventRsvps).where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.neighborId, memberId)));
        } else {
            const [existing] = await db.select().from(eventRsvps).where(and(eq(eventRsvps.eventId, eventId), eq(eventRsvps.neighborId, memberId)));
            if (existing) {
                await db.update(eventRsvps).set({ guestCount: guestCount, status: 'Going' }).where(eq(eventRsvps.id, existing.id));
            } else {
                await db.insert(eventRsvps).values({
                    eventId,
                    neighborId: memberId,
                    guestCount,
                    status: 'Going'
                });
            }
        }
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update RSVP:", error);
        return { success: false, error: error.message };
    }
}
