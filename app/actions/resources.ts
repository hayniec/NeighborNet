'use server'

import { db } from "@/db";
import { resources } from "@/db/schema";
import { eq } from "drizzle-orm";

export type ResourceActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityResources(communityId: string): Promise<ResourceActionState> {
    try {
        const result = await db
            .select()
            .from(resources)
            .where(eq(resources.communityId, communityId));

        return { success: true, data: result };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createResource(data: {
    communityId: string;
    name: string;
    type: string;
    capacity: number;
    description: string;
    isReservable: boolean;
}): Promise<ResourceActionState> {
    try {
        const [newResource] = await db.insert(resources).values({
            communityId: data.communityId,
            name: data.name,
            type: data.type as "Facility" | "Tool" | "Vehicle",
            capacity: data.capacity,
            description: data.description,
            isReservable: data.isReservable
        }).returning();

        return { success: true, data: newResource };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteResource(id: string): Promise<ResourceActionState> {
    try {
        await db.delete(resources).where(eq(resources.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
