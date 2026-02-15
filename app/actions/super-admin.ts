'use server'

import { db } from "@/db";
import { communities, users } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { eq } from "drizzle-orm";

// Hardcoded Super Admins for now - typically this would be in the DB or env
// Hardcoded Super Admins for now - typically this would be in the DB or env
const SUPER_ADMINS = [
    "sally.johnson@example.com",
    "erich.haynie@gmail.com",
    process.env.SUPER_ADMIN_EMAIL
].filter((email): email is string => !!email).map(email => email.toLowerCase());

// Helper to check Super Admin capabilities
async function isSuperAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;
    return SUPER_ADMINS.includes(session.user.email.toLowerCase());
}

// Map DB row to UI Community type (Shared logic, duplicated slightly to avoid importing from client-heavy files if any)
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
    },
    emergency: {
        accessCode: row.emergencyAccessCode || '',
        instructions: row.emergencyInstructions || ''
    }
});

export async function getTenants() {
    try {
        console.log("[SuperAdmin] getTenants called");

        if (!process.env.NEXTAUTH_SECRET) {
            return { success: false, error: "Server Configuration Error: NEXTAUTH_SECRET is missing." };
        }
        if (!process.env.DATABASE_URL) {
            return { success: false, error: "Server Configuration Error: DATABASE_URL is missing." };
        }

        const authorized = await isSuperAdmin();
        if (!authorized) {
            console.error("[SuperAdmin] Authorization failed for user");
            return { success: false, error: "Unauthorized: Super Admin access required." };
        }

        console.log("[SuperAdmin] Fetching all tenants...");
        const rows = await db.select().from(communities);
        console.log(`[SuperAdmin] Found ${rows.length} tenants.`);
        return { success: true, data: rows.map(mapToUI) };
    } catch (error: any) {
        console.error("Failed to fetch tenants (Critical Error):", error);
        // Log specifics if available
        if (error?.message) console.error("Error Message:", error.message);
        if (error?.stack) console.error("Error Stack:", error.stack);

        return { success: false, error: "Failed to fetch tenants: " + (error.message || "Unknown error") };
    }
}
