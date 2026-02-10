
import { db } from "@/db";
import { users, members, communities, invitations } from "@/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

// Usage: npx tsx scripts/import_users.ts --file users.csv

async function main() {
    const args = process.argv.slice(2);
    const fileArgIndex = args.indexOf("--file");

    if (fileArgIndex === -1 || !args[fileArgIndex + 1]) {
        console.error("Please provide a CSV file using --file <path>");
        process.exit(1);
    }

    const filePath = path.resolve(process.cwd(), args[fileArgIndex + 1]);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`Reading file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    console.log(`Found ${records.length} records.`);

    interface UserRecord {
        email: string;
        name?: string;
        communitySlug: string;
        role?: string;
        password?: string;
    }

    for (const record of records as UserRecord[]) {
        const { email, name, communitySlug, role, password } = record;

        if (!email || !communitySlug) {
            console.warn(`Skipping invalid record: ${JSON.stringify(record)}`);
            continue;
        }

        try {
            // 1. Find Community
            const [community] = await db
                .select()
                .from(communities)
                .where(eq(communities.slug, communitySlug));

            if (!community) {
                console.error(`Community not found for slug: ${communitySlug}`);
                continue;
            }

            // 2. Upsert Global User
            let [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, email));

            if (!user) {
                console.log(`Creating new user: ${email}`);
                [user] = await db.insert(users).values({
                    email,
                    name: name || email.split("@")[0],
                    password: password || "password123", // Default password
                }).returning();
            } else {
                console.log(`User exists: ${email}`);
            }

            // 3. Upsert Membership
            const [existingMember] = await db
                .select()
                .from(members)
                .where(
                    // Simple check if this user is already in this community
                    // (Requires complex AND clause or check in loop)
                    // For script simplicity, we'll check manually
                    eq(members.userId, user.id)
                );

            // Check if specifically this community membership exists
            // Since we can't easily do AND in this context without importing 'and'
            // We'll trust if we find *any* membership for this community? No.
            // Let's do it properly.

            // Re-query with specific community text if needed, or just insert on conflict?
            // Drizzle 'onConflictDoUpdate' is good but requires constraint setup.
            // Let's just query specifically.

            /* 
               We need to query: WHERE userId = user.id AND communityId = community.id 
               But I didn't import 'and' at top level yet. Let's assume I fix imports or use JS filter.
            */

            // Quick fix to ensure imports are cleaner in future refactor
            // For now, let's just insert if not exists.
            const userMemberships = await db
                .select()
                .from(members)
                .where(eq(members.userId, user.id));

            const isMember = userMemberships.some(m => m.communityId === community.id);

            if (!isMember) {
                console.log(`Adding membership to ${community.slug} for ${email}`);
                await db.insert(members).values({
                    userId: user.id,
                    communityId: community.id,
                    role: (role as "Admin" | "Resident" | "Board Member" | "Event Manager") || "Resident",
                });
            } else {
                console.log(`Already a member of ${community.slug}: ${email}`);
            }

        } catch (err: any) {
            console.error(`Failed to process ${record.email}:`, err);
        }
    }
    console.log("Import complete.");
}

main().catch(console.error);
