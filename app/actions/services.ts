'use server'

import { db } from "@/db";
import { serviceProviders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type ServiceActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getServiceProviders(communityId: string): Promise<ServiceActionState> {
    try {
        const providers = await db
            .select()
            .from(serviceProviders)
            .where(eq(serviceProviders.communityId, communityId))
            .orderBy(desc(serviceProviders.rating));

        return { success: true, data: providers };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createServiceProvider(data: {
    communityId: string;
    name: string;
    category: string;
    phone: string;
    description: string;
    recommendedBy: string; // member name or "Neighbor"
}): Promise<ServiceActionState> {
    try {
        const [newProvider] = await db.insert(serviceProviders).values({
            communityId: data.communityId,
            name: data.name,
            category: data.category,
            phone: data.phone,
            rating: "5.0", // Default string for decimal
            description: data.description,
            recommendedBy: data.recommendedBy
        }).returning();

        return { success: true, data: newProvider };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
