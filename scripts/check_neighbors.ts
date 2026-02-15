
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    const { db } = await import("@/db");
    const { members, users, communities } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    console.log("🔍 Checking Neighbors Data...");

    // 1. List all communities
    const allCommunities = await db.select().from(communities);
    console.log(`Found ${allCommunities.length} communities.`);

    for (const comm of allCommunities) {
        console.log(`\n--- Community: ${comm.name} (${comm.id}) ---`);

        // 2. Fetch members with user details
        const results = await db
            .select({
                memberId: members.id,
                userId: members.userId,
                role: members.role,
                name: users.name,
                email: users.email
            })
            .from(members)
            .innerJoin(users, eq(members.userId, users.id))
            .where(eq(members.communityId, comm.id));

        if (results.length === 0) {
            console.log("⚠️ No members found (with valid user join).");

            // Check formatted members without join to see if orphans exist
            const orphans = await db.select().from(members).where(eq(members.communityId, comm.id));
            console.log(`   (Raw members count: ${orphans.length})`);
        } else {
            console.log(JSON.stringify(results, null, 2));
        }
    }

    process.exit(0);
}

main().catch(console.error);
