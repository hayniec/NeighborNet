
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
    // Dynamic imports to handle path aliases
    const { db } = await import("@/db");
    const { communities, users, members } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const EMAIL = "allison.haynie35@gmail.com";
    console.log(`Fixing user: ${EMAIL}`);

    const [user] = await db.select().from(users).where(eq(users.email, EMAIL));
    if (!user) {
        console.error("User not found!");
        process.exit(1);
    }
    console.log("Found user:", user.id);

    // Find Maple Grove
    const comms = await db.select().from(communities);
    const maple = comms.find(c => c.name === "Maple Grove");

    if (!maple) {
        console.error("Maple Grove not found!");
        process.exit(1);
    }
    console.log("Found Maple Grove:", maple.id);

    // Check existing
    const [existing] = await db.select().from(members).where(eq(members.userId, user.id));
    if (existing) {
        console.log("User already has membership in:", existing.communityId);
        if (existing.communityId !== maple.id) {
            console.log("Updating to Maple Grove...");
            await db.update(members).set({ communityId: maple.id }).where(eq(members.id, existing.id));
        } else {
            console.log("User is already in Maple Grove.");
        }
    } else {
        console.log("Creating membership...");
        await db.insert(members).values({
            userId: user.id,
            communityId: maple.id,
            role: "Resident",
            joinedDate: new Date()
        });
    }

    console.log("Done!");
    process.exit(0);
}

main().catch(console.error);
