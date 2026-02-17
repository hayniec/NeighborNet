// Debug script to test event creation permissions
// This simulates what happens when you try to create an event

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { db } from "@/db";
import { members } from "@/db/schema";
import { eq } from "drizzle-orm";

async function testPermissions(email: string) {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`Testing permissions for: ${email}`);
    console.log("=".repeat(80));

    try {
        // Find the member by email
        const [member] = await db
            .select()
            .from(members)
            .where(eq(members.userId,
                (await db.query.users.findFirst({ where: (users, { eq }) => eq(users.email, email) }))?.id || ''
            ));

        if (!member) {
            console.log("❌ Member not found!");
            return;
        }

        console.log("\nMember Data:");
        console.log(`  ID: ${member.id}`);
        console.log(`  Legacy Role: ${member.role}`);
        console.log(`  Roles Array: ${JSON.stringify(member.roles)}`);

        // Simulate the permission check from events.ts
        const role = member?.role?.toLowerCase();
        const roles = member?.roles?.map(r => r.toLowerCase()) || [];

        console.log("\nProcessed for Permission Check:");
        console.log(`  role (lowercase): ${role}`);
        console.log(`  roles (lowercase): ${JSON.stringify(roles)}`);

        const canCreate = role === 'admin' || role === 'event manager' ||
            roles.includes('admin') || roles.includes('event manager');

        console.log("\nPermission Check Results:");
        console.log(`  role === 'admin': ${role === 'admin'}`);
        console.log(`  role === 'event manager': ${role === 'event manager'}`);
        console.log(`  roles.includes('admin'): ${roles.includes('admin')}`);
        console.log(`  roles.includes('event manager'): ${roles.includes('event manager')}`);
        console.log(`\n  ✅ CAN CREATE EVENTS: ${canCreate}`);

        if (!canCreate) {
            console.log("\n❌ PERMISSION DENIED - This user cannot create events");
        }

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

// Test all admin users
async function main() {
    await testPermissions("eric.haynie@gmail.com");
    await testPermissions("footballfan1997@protonmail.com");
    await testPermissions("legacybox.com.liqueur152@passmail.net");
}

main();
