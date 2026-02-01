'use server'

import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type EventActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityEvents(communityId: string): Promise<EventActionState> {
    try {
        const results = await db
            .select()
            .from(events)
            .where(eq(events.communityId, communityId))
            .orderBy(desc(events.date));

        return {
            success: true,
            data: results.map(e => ({
                id: e.id,
                title: e.title,
                date: e.date, // string YYYY-MM-DD
                time: e.time,
                location: e.location,
                description: e.description,
                organizer: "Neighbor", // TODO: join with neighbors table to get name
                attendees: e.attendeesCount,
                category: e.category,
                userRsvp: 0
            }))
        };
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
        const [newEvent] = await db.insert(events).values({
            communityId: data.communityId,
            title: data.title,
            description: data.description,
            date: data.date,
            time: data.time,
            location: data.location,
            category: data.category,
            organizerId: data.organizerId,
            attendeesCount: 1
        }).returning();

        return {
            success: true,
            data: {
                ...newEvent,
                attendees: newEvent.attendeesCount,
                userRsvp: 1 // Creator is attending
            }
        };
    } catch (error: any) {
        console.error("Failed to create event:", error);
        return { success: false, error: error.message };
    }
}
