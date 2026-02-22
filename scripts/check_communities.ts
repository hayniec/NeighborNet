
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "../db/index";
import { communities, users, members } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking DB...");
    const comms = await db.select().from(communities);
    console.log("Communities found:", comms.length);
    comms.forEach(c => console.log(`- ${c.name} (${c.id}) Active: ${c.isActive}`));

    console.log("\nChecking User Allison...");
    const [user] = await db.select().from(users).where(eq(users.email, "allison.haynie35@gmail.com"));
    if (user) {
        console.log("User found:", user.id);
        const mems = await db.select().from(members).where(eq(members.userId, user.id));
        console.log("Memberships:", mems.length);
        if (mems.length > 0) console.log(mems);
    } else {
        console.log("User 'allison.haynie35@gmail.com' NOT found.");
    }
    process.exit(0);
}

main().catch(console.error);
