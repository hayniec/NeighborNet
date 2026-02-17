'use server'

import { db } from "@/db";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";

// Type definition matching the UI but mapped from DB
export type CommunityActionState =
    | { success: true; data: any }
    | { success: false; error: string };

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
        emergency: row.hasEmergency,
    },
    isActive: row.isActive,
    branding: {
        logoUrl: row.logoUrl || '',
        primaryColor: row.primaryColor || '#4f46e5',
        secondaryColor: row.secondaryColor || '#1e1b4b',
        accentColor: row.accentColor || '#f59e0b',
    },
    emergency: {
        accessCode: row.emergencyAccessCode || '',
        instructions: row.emergencyInstructions || ''
    },
    hoaSettings: {
        duesAmount: row.hoaDuesAmount || null,
        duesFrequency: row.hoaDuesFrequency || 'Monthly',
        duesDate: row.hoaDuesDate || '1st',
        contactEmail: row.hoaContactEmail || ''
    },
    hoaExtendedSettings: row.hoaExtendedSettings || null
});

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { members } from "@/db/schema";

export async function getCommunities() {
    try {
        const session = await getServerSession(authOptions);
        console.log("[getCommunities] Session check:", {
            hasSession: !!session,
            hasUser: !!session?.user,
            hasUserId: !!session?.user?.id,
            userId: session?.user?.id,
            userEmail: session?.user?.email
        });

        if (!session?.user?.id) {
            console.error("[getCommunities] UNAUTHORIZED: No valid session found");
            return { success: false, error: "Unauthorized" };
        }

        console.log("[getCommunities] Fetching communities for user:", session.user.id);

        // Fetch user's communities via membership
        const userCommunities = await db
            .select({
                id: communities.id,
                name: communities.name,
                slug: communities.slug,
                planTuple: communities.planTuple,
                hasMarketplace: communities.hasMarketplace,
                hasResources: communities.hasResources,
                hasEvents: communities.hasEvents,
                hasDocuments: communities.hasDocuments,
                hasForum: communities.hasForum,
                hasMessages: communities.hasMessages,
                hasServicePros: communities.hasServicePros,

                hasLocalGuide: communities.hasLocalGuide,
                hasEmergency: communities.hasEmergency,
                isActive: communities.isActive,
                logoUrl: communities.logoUrl,
                primaryColor: communities.primaryColor,
                secondaryColor: communities.secondaryColor,
                accentColor: communities.accentColor,
                emergencyAccessCode: communities.emergencyAccessCode,
                emergencyInstructions: communities.emergencyInstructions,
                hoaDuesAmount: communities.hoaDuesAmount,
                hoaDuesFrequency: communities.hoaDuesFrequency,
                hoaDuesDate: communities.hoaDuesDate,
                hoaContactEmail: communities.hoaContactEmail,
                hoaExtendedSettings: communities.hoaExtendedSettings,
            })
            .from(communities)
            .innerJoin(members, eq(communities.id, members.communityId))
            .where(eq(members.userId, session.user.id));

        console.log(`[getCommunities] Found ${userCommunities.length} communities.`);
        return { success: true, data: userCommunities.map(mapToUI) };
    } catch (error: any) {
        console.error("Failed to fetch communities:", error);
        return { success: false, error: "Failed to fetch communities" };
    }
}



export async function createCommunity(data: any): Promise<CommunityActionState> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized: No user session found" };
        }

        return await db.transaction(async (tx) => {
            // 1. Create Community
            const [inserted] = await tx.insert(communities).values({
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
                hasEmergency: data.features.emergency,
                isActive: true,
                primaryColor: data.branding?.primaryColor,
                secondaryColor: data.branding?.secondaryColor,
                accentColor: data.branding?.accentColor,
                logoUrl: data.branding?.logoUrl
            }).returning();

            if (!inserted) {
                throw new Error("Failed to insert community record");
            }

            // 2. Add Creator as Admin
            try {
                await tx.insert(members).values({
                    userId: session.user.id,
                    communityId: inserted.id,
                    role: 'Admin',
                    address: 'Admin Address',
                    joinedDate: new Date(),
                    isOnline: true
                });
            } catch (memberError: any) {
                console.error("Failed to add member:", memberError);
                throw new Error(`Failed to add admin member: ${memberError.message}`);
            }

            return { success: true, data: mapToUI(inserted) };
        });

    } catch (error: any) {
        console.error("Failed to create community:", error);

        if (error.code === '23505' || error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
            return { success: false, error: "A tenant with this slug already exists. Please choose a distinct slug." };
        }

        const msg = error.message || "Failed to create community";
        return { success: false, error: msg };
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

        local: { hasLocalGuide: newValue },
        emergency: { hasEmergency: newValue }
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

export async function updateEmergencySettings(id: string, data: { accessCode: string; instructions: string }) {
    try {
        await db.update(communities).set({
            emergencyAccessCode: data.accessCode,
            emergencyInstructions: data.instructions
        }).where(eq(communities.id, id));
        return { success: true };
    } catch (e) {
        console.error("Failed to update emergency settings", e);
        return { success: false, error: "Failed to update emergency settings" };
    }
}

export async function updateCommunityHoaSettings(id: string, data: { duesAmount: string; duesFrequency: string; duesDate: string; contactEmail: string }) {
    try {
        // Parse duesAmount as a string for decimal field, ensure it's valid
        const amount = parseFloat(data.duesAmount).toFixed(2);

        await db.update(communities).set({
            hoaDuesAmount: amount,
            hoaDuesFrequency: data.duesFrequency,
            hoaDuesDate: data.duesDate,
            hoaContactEmail: data.contactEmail
        }).where(eq(communities.id, id));
        return { success: true };
    } catch (e) {
        console.error("Failed to update HOA settings", e);
        return { success: false, error: "Failed to update HOA settings" };
    }
}

/**
 * Fetch community by ID without session check
 * Used when we already have the communityId from client context
 */
export async function getCommunityById(id: string) {
    try {
        const [community] = await db
            .select({
                id: communities.id,
                name: communities.name,
                slug: communities.slug,
                planTuple: communities.planTuple,
                hasMarketplace: communities.hasMarketplace,
                hasResources: communities.hasResources,
                hasEvents: communities.hasEvents,
                hasDocuments: communities.hasDocuments,
                hasForum: communities.hasForum,
                hasMessages: communities.hasMessages,
                hasServicePros: communities.hasServicePros,
                hasLocalGuide: communities.hasLocalGuide,
                hasEmergency: communities.hasEmergency,
                isActive: communities.isActive,
                logoUrl: communities.logoUrl,
                primaryColor: communities.primaryColor,
                secondaryColor: communities.secondaryColor,
                accentColor: communities.accentColor,
                emergencyAccessCode: communities.emergencyAccessCode,
                emergencyInstructions: communities.emergencyInstructions,
                hoaDuesAmount: communities.hoaDuesAmount,
                hoaDuesFrequency: communities.hoaDuesFrequency,
                hoaDuesDate: communities.hoaDuesDate,
                hoaContactEmail: communities.hoaContactEmail,
                hoaExtendedSettings: communities.hoaExtendedSettings,
            })
            .from(communities)
            .where(eq(communities.id, id));

        if (!community) {
            return { success: false, error: "Community not found" };
        }

        return { success: true, data: mapToUI(community) };
    } catch (error: any) {
        console.error("Failed to fetch community by ID:", error);
        return { success: false, error: "Failed to fetch community" };
    }
}


