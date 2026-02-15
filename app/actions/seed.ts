'use server'

import { db } from "@/db";
import { users, members, communities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function resetAndSeed() {
    try {
        console.log("[SEED] Starting Database Reset...");

        // 1. DELETE Members (Constraint: Members depend on Users, so delete members first)
        await db.delete(members);
        console.log("[SEED] Members deleted.");

        // 2. DELETE Users
        await db.delete(users);
        console.log("[SEED] Users deleted.");

        // 3. Ensure Communities Exist
        // We need 'Sunset Heights', 'River Valley', 'NeighborNet' (or whatever names you prefer)
        // I will search for them or create them.

        const targetCommunities = [
            { name: "Sunset Heights", slug: "sunset-heights" },
            // Add placeholders if we don't know the others clearly, or reuse existing
            { name: "River Valley", slug: "river-valley" },
            { name: "Demo Community", slug: "demo" }
        ];

        const commsMap: Record<string, string> = {}; // name -> id

        for (const t of targetCommunities) {
            let [existing] = await db.select().from(communities).where(eq(communities.name, t.name));
            if (!existing) {
                // If searching by name fails, try searching by slug? Or just create.
                // Creating might duplicate if name changed. I'll just create a new one to be safe/sure.
                const [created] = await db.insert(communities).values({
                    name: t.name,
                    slug: t.slug,
                    hasEmergency: true
                }).returning();
                existing = created;
                console.log(`[SEED] Created Community: ${t.name}`);
            } else {
                console.log(`[SEED] Found Community: ${t.name}`);
            }
            commsMap[t.name] = existing.id;
        }

        // 4. Create Test Users
        const testUsers = [
            {
                name: "Test User Sunset",
                email: "test.sunset@example.com",
                password: "temp123",
                community: "Sunset Heights"
            },
            {
                name: "Test User River",
                email: "test.river@example.com",
                password: "temp123",
                community: "River Valley"
            },
            {
                name: "Test User Demo",
                email: "test.demo@example.com",
                password: "temp123",
                community: "Demo Community"
            }
        ];

        const results = [];

        for (const u of testUsers) {
            const commId = commsMap[u.community];
            if (!commId) {
                console.error(`[SEED] Skipping ${u.name} - Community ID missing.`);
                continue;
            }

            // Create User
            const [newUser] = await db.insert(users).values({
                name: u.name,
                email: u.email,
                password: u.password, // Storing plain text as requested for test
                createdAt: new Date()
            }).returning();

            // Create Member Link
            const [newMember] = await db.insert(members).values({
                userId: newUser.id,
                communityId: commId,
                role: 'Resident', // Default to Resident
                joinedDate: new Date()
            }).returning();

            results.push({ user: u.email, community: u.community, status: "Created" });
        }

        // Also re-create YOUR user specifically if you want? 
        // User asked to "Remove ALL users", so I will respect that.
        // But you might want 'erich.haynie@gmail.com' back eventually.
        // I'll stick to the requested 3 test users.

        return { success: true, results };

    } catch (e: any) {
        console.error("[SEED] Failed:", e);
        return { success: false, error: e.message };
    }
}
