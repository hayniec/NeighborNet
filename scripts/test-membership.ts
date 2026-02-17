import path from "path";
// Load .env.local using dotenv
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const main = async () => {
    // Dynamic import to ensure env is loaded first
    const { db } = await import("../db");
    const { users, members, communities } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    console.log("Checking DB...");
    const email = "eric.haynie@gmail.com";

    // Find User
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        console.log(`User ${email} NOT FOUND.`);
        return;
    }
    console.log(`User found: ${user.id} (${user.email})`);

    // Find Memberships
    const membershipRows = await db.select().from(members).where(eq(members.userId, user.id));
    console.log(`Memberships count: ${membershipRows.length}`);

    if (membershipRows.length > 0) {
        for (const m of membershipRows) {
            console.log(`- Member of Community ID: ${m.communityId} role: ${m.role}`);

            // Check Community
            const [comm] = await db.select().from(communities).where(eq(communities.id, m.communityId));
            if (comm) {
                console.log(`  -> Community Name: ${comm.name} (Active: ${comm.isActive})`);
            } else {
                console.log(`  -> Community NOT FOUND (Orphaned membership!)`);
            }
        }
    } else {
        console.log("User has NO memberships.");
    }
}

main().catch(console.error);
