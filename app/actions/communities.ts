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
        const rows = await db.select().from(communities);
        return { success: true, data: rows.map(mapToUI) };
    } catch (error: any) {
        console.error("Failed to fetch communities:", error);
        return { success: false, error: "Failed to fetch communities" };
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
        return { success: false, error: "Failed to create community" };
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

// Seed function
// Mock data structure inline for seeding


export async function seedCommunitiesIfNeeded() {
    const existing = await db.select().from(communities);
    if (existing.length > 0) return { success: true, message: "Already seeded" };

    const mocks = [
        {
            name: 'Oak Hills HOA',
            slug: 'oak-hills',
            planTuple: 'growth_250',
            hasMarketplace: true, hasResources: true, hasEvents: true, hasDocuments: true,
            hasForum: true, hasMessages: true, hasServicePros: true, hasLocalGuide: true,
            isActive: true,
            primaryColor: '#059669', secondaryColor: '#064e3b', accentColor: '#fbbf24',
            logoUrl: 'https://cdn-icons-png.flaticon.com/512/3590/3590453.png'
        },
        {
            name: 'Sunset Valley',
            slug: 'sunset-valley',
            planTuple: 'starter_100',
            hasMarketplace: false, hasResources: false, hasEvents: true, hasDocuments: true,
            hasForum: false, hasMessages: true, hasServicePros: false, hasLocalGuide: true,
            isActive: true,
            primaryColor: '#ea580c', secondaryColor: '#7c2d12', accentColor: '#38bdf8',
            logoUrl: ''
        }
    ];

    try {
        for (const m of mocks) {
            await db.insert(communities).values(m as any);
        }
        return { success: true, message: "Seeded mock data" };
    } catch (e) {
        console.error("Seed failed", e);
        return { success: false, error: "Seed failed" };
    }
}
