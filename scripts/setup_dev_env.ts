
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { eq } from "drizzle-orm";

async function main() {
    // Dynamic imports
    const { db } = await import("@/db");
    const { users, members, communities } = await import("@/db/schema");

    console.log("🛠️ Setting up Development Environment...\n");

    try {
        // 1. Ensure Dev Community
        const devSlug = "dev-community";
        let [community] = await db.select().from(communities).where(eq(communities.slug, devSlug));

        if (!community) {
            console.log(`Creating Dev Community (${devSlug})...`);
            [community] = await db.insert(communities).values({
                name: "Development Community",
                slug: devSlug,
                planTuple: "pro_500"
            }).returning();
        }
        console.log(`✅ Community ID: ${community.id}`);

        // 2. Ensure Dev User
        const devEmail = "admin@dev.local";
        let [user] = await db.select().from(users).where(eq(users.email, devEmail));

        if (!user) {
            console.log(`Creating Dev User (${devEmail})...`);
            [user] = await db.insert(users).values({
                email: devEmail,
                name: "Dev Admin",
                password: "password123",
                avatar: "DA"
            }).returning();
        }
        console.log(`✅ User ID: ${user.id}`);

        // 3. Ensure Membership (Admin Role)
        let [member] = await db.select().from(members).where(eq(members.userId, user.id));

        if (!member) {
            console.log(`Creating Member record...`);
            [member] = await db.insert(members).values({
                userId: user.id,
                communityId: community.id,
                role: "Admin"
            }).returning();
        } else {
            // Ensure correct community and role if it exists
            if (member.communityId !== community.id || member.role !== 'Admin') {
                console.log(`Updating existing member role/community...`);
                [member] = await db.update(members)
                    .set({ communityId: community.id, role: 'Admin' })
                    .where(eq(members.id, member.id))
                    .returning();
            }
        }

        console.log(`✅ Member ID (for context): ${member.id}`);

        const fs = await import("fs");
        fs.writeFileSync("dev_env_ids.txt", `MEMBER_ID=${member.id}\nCOMMUNITY_ID=${community.id}`);
        console.log("IDs written to dev_env_ids.txt");

        console.log("\nUpdate contexts/UserContext.tsx with these values:");
        console.log(`id: "${member.id}"`);
        console.log(`communityId: "${community.id}"`);

    } catch (e) {
        console.error("❌ Setup Failed:", e);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

main();
