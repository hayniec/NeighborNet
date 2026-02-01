'use server'

import { db } from "@/db";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";

// Type definition matching the UI but mapped from DB
export type CommunityActionState = {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
};

// Map DB row to UI Community type
const mapToUI = (row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug || '',
    plan: row.planTuple || 'starter_100',
    features: {
        marketplace: row.hasMarketplace,
        resources: row.hasResources,
        events: row.hasEvents,
        documents: row.hasDocuments,
        forum: row.hasForum,
        messages: row.hasMessages,
        services: row.hasServicePros,
        local: row.hasLocalGuide,
    },
    isActive: row.isActive,
    branding: {
        logoUrl: row.logoUrl || '',
        primaryColor: row.primaryColor || '#4f46e5',
        secondaryColor: row.secondaryColor || '#1e1b4b',
        accentColor: row.accentColor || '#f59e0b',
    }
});

export async function getCommunities() {
    try {
        console.log("[getCommunities] Starting query...");
        const rows = await db.select().from(communities);
        console.log(`[getCommunities] Successfully fetched ${rows.length} communities`);
        return { success: true, data: rows.map(mapToUI) };
    } catch (error: any) {
        console.error("Failed to fetch communities:", error);
        console.error("Error stack:", error.stack);
        console.error("Error name:", error.name);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to fetch communities";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

export async function createCommunity(data: any) {
    try {
        const [inserted] = await db.insert(communities).values({
            name: data.name,
            slug: data.slug,
            planTuple: data.plan,
            hasMarketplace: data.features.marketplace,
            hasResources: data.features.resources,
            hasEvents: data.features.events,
            hasDocuments: data.features.documents,
            hasForum: data.features.forum,
            hasMessages: data.features.messages,
            hasServicePros: data.features.services,
            hasLocalGuide: data.features.local,
            isActive: true,
            // Branding defaults or provided
            primaryColor: data.branding?.primaryColor,
            secondaryColor: data.branding?.secondaryColor,
            accentColor: data.branding?.accentColor,
            logoUrl: data.branding?.logoUrl
        }).returning();

        return { success: true, data: mapToUI(inserted) };
    } catch (error: any) {
        console.error("Failed to create community:", error);
        // Capture Postgres specific error fields if available
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const hint = error.hint ? ` (Hint: ${error.hint})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        // If the message is the query dump, getting the 'routine' or 'position' might helps, but let's try code/detail first.
        const msg = error.message || "Failed to create community";
        return { success: false, error: `${msg}${code}${detail}${hint}` };
    }
}

export async function toggleCommunityStatus(id: string, newStatus: boolean) {
    try {
        await db.update(communities)
            .set({ isActive: newStatus })
            .where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to update status" };
    }
}

export async function deleteCommunity(id: string) {
    try {
        await db.delete(communities).where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to delete community" };
    }
}

export async function toggleCommunityFeature(id: string, featureKey: string, newValue: boolean) {
    const columnMap: Record<string, any> = {
        marketplace: { hasMarketplace: newValue },
        resources: { hasResources: newValue },
        events: { hasEvents: newValue },
        documents: { hasDocuments: newValue },
        forum: { hasForum: newValue },
        messages: { hasMessages: newValue },
        services: { hasServicePros: newValue },
        local: { hasLocalGuide: newValue }
    };

    if (!columnMap[featureKey]) return { success: false, error: "Invalid feature key" };

    try {
        await db.update(communities)
            .set(columnMap[featureKey])
            .where(eq(communities.id, id));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Failed to toggle feature" };
    }
}

export async function updateCommunityBranding(id: string, branding: any) {
    try {
        await db.update(communities).set({
            primaryColor: branding.primaryColor,
            secondaryColor: branding.secondaryColor,
            accentColor: branding.accentColor,
            logoUrl: branding.logoUrl
        }).where(eq(communities.id, id));
        return { success: true };
    } catch (e) {
        return { success: false, error: "Failed update branding" };
    }
}


