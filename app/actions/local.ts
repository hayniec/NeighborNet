'use server'

import { db } from "@/db";
import { localPlaces } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type LocalActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getLocalPlaces(communityId: string): Promise<LocalActionState> {
    try {
        const places = await db
            .select()
            .from(localPlaces)
            .where(eq(localPlaces.communityId, communityId))
            .orderBy(desc(localPlaces.rating));

        return { success: true, data: places };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createLocalPlace(data: {
    communityId: string;
    name: string;
    category: string;
    address: string;
    description: string;
}): Promise<LocalActionState> {
    try {
        const [newPlace] = await db.insert(localPlaces).values({
            communityId: data.communityId,
            name: data.name,
            category: data.category,
            address: data.address,
            description: data.description,
            rating: "5.0"
        }).returning();

        return { success: true, data: newPlace };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
