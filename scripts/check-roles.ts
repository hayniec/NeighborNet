import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

const databaseUrl = process.env.DATABASE_URL!;
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const client = neon(databaseUrl);
const db = drizzle(client);

async function main() {
    console.log("Checking roles column in members table...\n");

    try {
        const result = await db.execute(sql`
            SELECT id, user_id, role, roles 
            FROM neighbors 
            LIMIT 10;
        `);

        console.log("Sample members:");
        console.log(JSON.stringify(result.rows, null, 2));

        const nullRolesCount = await db.execute(sql`
            SELECT COUNT(*) as count
            FROM neighbors
            WHERE roles IS NULL OR array_length(roles, 1) IS NULL;
        `);

        console.log(`\nMembers with NULL or empty roles: ${nullRolesCount.rows[0].count}`);
    } catch (error) {
        console.error("Check failed:", error);
        process.exit(1);
    }
}

main();
