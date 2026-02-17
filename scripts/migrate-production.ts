import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import * as readline from "readline";

const databaseUrl = process.env.DATABASE_URL!;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

// Extract database info for display (hide password)
const urlParts = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
const dbInfo = urlParts
    ? `User: ${urlParts[1]}, Host: ${urlParts[3]}, Database: ${urlParts[4].split('?')[0]}`
    : "Unable to parse database URL";

const client = neon(databaseUrl);
const db = drizzle(client);

async function askConfirmation(question: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question + " (yes/no): ", (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
}

async function main() {
    console.log("=".repeat(60));
    console.log("MULTI-ROLE MIGRATION SCRIPT");
    console.log("=".repeat(60));
    console.log("\nDatabase Connection Info:");
    console.log(dbInfo);
    console.log("\n" + "=".repeat(60));

    // Check current state
    console.log("\nChecking current database state...");
    try {
        const checkResult = await db.execute(sql`
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN roles IS NULL OR array_length(roles, 1) IS NULL THEN 1 END) as null_roles
            FROM neighbors;
        `);

        const stats = checkResult.rows[0];
        console.log(`\nCurrent Status:`);
        console.log(`  Total members: ${stats.total}`);
        console.log(`  Members with NULL/empty roles: ${stats.null_roles}`);

        if (stats.null_roles === '0' || stats.null_roles === 0) {
            console.log("\n✅ All members already have roles populated!");
            console.log("Migration not needed.");
            return;
        }

        console.log(`\n⚠️  ${stats.null_roles} members need migration`);
    } catch (error: any) {
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
            console.log("\n⚠️  'roles' column does not exist yet. Will create it.");
        } else {
            console.error("\nError checking database:", error.message);
            throw error;
        }
    }

    console.log("\n" + "=".repeat(60));
    const confirmed = await askConfirmation("\nDo you want to proceed with the migration?");

    if (!confirmed) {
        console.log("\n❌ Migration cancelled.");
        return;
    }

    console.log("\n🚀 Starting migration...\n");

    try {
        // 1. Add 'roles' column if not exists
        console.log("Step 1: Adding 'roles' column...");
        await db.execute(sql`
            ALTER TABLE neighbors 
            ADD COLUMN IF NOT EXISTS roles text[] DEFAULT ARRAY['Resident'];
        `);
        console.log("✅ Column added/verified");

        // 2. Populate 'roles' from existing 'role' column
        console.log("\nStep 2: Migrating existing role data...");
        const updateResult = await db.execute(sql`
            UPDATE neighbors 
            SET roles = ARRAY[role] 
            WHERE role IS NOT NULL 
            AND (roles IS NULL OR array_length(roles, 1) IS NULL);
        `);
        console.log(`✅ Updated ${updateResult.rowCount || 0} members from 'role' column`);

        // 3. Handle NULL roles (fall back to Resident)
        console.log("\nStep 3: Setting default roles for NULL values...");
        const defaultResult = await db.execute(sql`
            UPDATE neighbors 
            SET roles = ARRAY['Resident'] 
            WHERE role IS NULL 
            AND (roles IS NULL OR array_length(roles, 1) IS NULL);
        `);
        console.log(`✅ Set default roles for ${defaultResult.rowCount || 0} members`);

        // 4. Verify migration
        console.log("\nStep 4: Verifying migration...");
        const verifyResult = await db.execute(sql`
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN roles IS NULL OR array_length(roles, 1) IS NULL THEN 1 END) as null_roles
            FROM neighbors;
        `);

        const finalStats = verifyResult.rows[0];
        console.log(`\nFinal Status:`);
        console.log(`  Total members: ${finalStats.total}`);
        console.log(`  Members with NULL/empty roles: ${finalStats.null_roles}`);

        if (finalStats.null_roles === '0' || finalStats.null_roles === 0) {
            console.log("\n✅ Migration completed successfully!");
        } else {
            console.log(`\n⚠️  Warning: ${finalStats.null_roles} members still have NULL/empty roles`);
        }

        console.log("\n" + "=".repeat(60));
    } catch (error: any) {
        console.error("\n❌ Migration failed:", error.message);
        process.exit(1);
    }
}

main();
