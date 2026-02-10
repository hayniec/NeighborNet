import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { authenticateUser } from "@/app/actions/auth";
import { db } from "@/db";
import { users, members, communities } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const email = "test_qa_user@example.com";
    const password = "password123";
    const communityName = "QA Community";
    const communitySlug = "qa-community";

    console.log("--- Starting QA Login Test ---");

    try {
        // 1. Setup: Ensure User and Community exist
        console.log("1. Setting up test data...");

        // Create Community if not exists
        let [community] = await db.select().from(communities).where(eq(communities.slug, communitySlug));
        if (!community) {
            console.log("   Creating QA Community...");
            [community] = await db.insert(communities).values({
                name: communityName,
                slug: communitySlug,
            }).returning();
        }

        // Create User if not exists
        let [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
            console.log("   Creating QA User...");
            [user] = await db.insert(users).values({
                email,
                name: "QA Tester",
                password: password
            }).returning();
        }

        // Ensure Membership
        const [member] = await db.select().from(members).where(eq(members.userId, user.id));
        if (!member) {
            console.log("   Adding User to Community...");
            await db.insert(members).values({
                userId: user.id,
                communityId: community.id,
                role: "Resident"
            });
        }

        // 2. Test Login
        console.log("2. Testing authenticateUser action...");
        const result = await authenticateUser(email, password);

        if (result.success) {
            console.log("   ✅ Login Successful!");
            console.log("   User:", result.user?.name);
            console.log("   Role:", result.user?.role);
            console.log("   Community ID:", result.user?.communityId);

            if (result.user?.communityId === community.id) {
                console.log("   ✅ Correct Community Context Resolved");
            } else {
                console.error("   ❌ Incorrect Community Context!");
                console.error(`      Expected: ${community.id}`);
                console.error(`      Received: ${result.user?.communityId}`);
            }
        } else {
            console.error("   ❌ Login Failed:", result.error);
        }

        // 3. Test Invalid Password
        console.log("3. Testing invalid password...");
        const failResult = await authenticateUser(email, "wrongpassword");
        if (!failResult.success) {
            console.log("   ✅ Correctly rejected invalid password.");
        } else {
            console.error("   ❌ Failed to reject invalid password!");
        }

    } catch (error) {
        console.error("Unexpected error during QA:", error);
    } finally {
        console.log("--- QA Test Complete ---");
        process.exit(0);
    }
}

main();
