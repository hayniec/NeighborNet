
import path from "path";
// Load .env.local using dotenv
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const main = async () => {
    // Dynamic import to ensure env is loaded first
    const { db } = await import("../db");
    const { users, members, communities } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    console.log("Fixing Membership...");
    const email = "eric.haynie@gmail.com";

    // 1. Find User
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
        console.error(`User ${email} NOT FOUND.`);
        return;
    }
    console.log(`User found: ${user.id} (${user.email})`);

    // 2. Find ANY Community
    const communityRows = await db.select().from(communities);
    if (communityRows.length === 0) {
        console.error("No communities found! Create one first.");
        return;
    }
    const community = communityRows[0];
    console.log(`Using Community: ${community.name} (${community.id})`);

    // 3. Insert Member
    try {
        await db.insert(members).values({
            userId: user.id,
            communityId: community.id,
            role: 'Admin',
            address: 'Admin Address',
            joinedDate: new Date(),
            isOnline: true
        });
        console.log("SUCCESS: Added you as Admin member!");
    } catch (error: any) {
        console.error("Failed to add member:", error.message);
        if (error.code === '23505') {
            console.log("You are ALREADY a member (duplicate key).");
        }
    }
}

main().catch(console.error);
