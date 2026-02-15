
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const email = "erich.haynie@gmail.com";
        const newPassword = "temp123";

        // Check if user exists first
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));

        if (!existingUser) {
            return NextResponse.json({
                success: false,
                error: `User ${email} does not exist in the database.`
            }, { status: 404 });
        }

        // Update password
        await db.update(users)
            .set({ password: newPassword })
            .where(eq(users.email, email));

        return NextResponse.json({
            success: true,
            message: `Password for ${email} has been reset successfully.`,
            newPassword: newPassword
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
