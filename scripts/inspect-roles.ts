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
    console.log("Checking member roles in production database...\n");

    try {
        // Get all members with their roles
        const result = await db.execute(sql`
            SELECT 
                n.id,
                u.name,
                u.email,
                n.role as legacy_role,
                n.roles as roles_array,
                array_length(n.roles, 1) as roles_count
            FROM neighbors n
            LEFT JOIN users u ON n.user_id = u.id
            ORDER BY u.name
            LIMIT 20;
        `);

        console.log("Members in database:");
        console.log("=".repeat(100));

        result.rows.forEach((row: any) => {
            console.log(`Name: ${row.name || 'N/A'}`);
            console.log(`Email: ${row.email || 'N/A'}`);
            console.log(`Legacy Role: ${row.legacy_role || 'NULL'}`);
            console.log(`Roles Array: ${row.roles_array ? JSON.stringify(row.roles_array) : 'NULL'}`);
            console.log(`Roles Count: ${row.roles_count || 0}`);
            console.log("-".repeat(100));
        });

        // Check for admin/event manager users
        const adminCheck = await db.execute(sql`
            SELECT 
                u.name,
                u.email,
                n.role,
                n.roles
            FROM neighbors n
            LEFT JOIN users u ON n.user_id = u.id
            WHERE n.role IN ('Admin', 'Event Manager')
               OR 'Admin' = ANY(n.roles)
               OR 'Event Manager' = ANY(n.roles);
        `);

        console.log("\n\nUsers with Admin or Event Manager permissions:");
        console.log("=".repeat(100));
        if (adminCheck.rows.length === 0) {
            console.log("⚠️  NO ADMIN OR EVENT MANAGER USERS FOUND!");
        } else {
            adminCheck.rows.forEach((row: any) => {
                console.log(`Name: ${row.name}, Email: ${row.email}`);
                console.log(`  Legacy Role: ${row.role}`);
                console.log(`  Roles Array: ${JSON.stringify(row.roles)}`);
                console.log("-".repeat(100));
            });
        }

    } catch (error: any) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

main();
