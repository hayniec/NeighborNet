
import { db } from "@/db";
import { users, members } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function authenticateUser(email: string, password: string) {
    if (!email || !password) {
        return { success: false, error: "Email and password are required" };
    }

    try {
        // 1. Check Global User
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (!user || user.password !== password) {
            return { success: false, error: "Invalid email or password" };
        }

        // 2. Get Default Community Context (First membership found)
        const [membership] = await db
            .select()
            .from(members)
            .where(eq(members.userId, user.id))
            .limit(1);

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: membership?.role ? membership.role.toLowerCase() : "resident",
                avatar: user.avatar || user.name.charAt(0).toUpperCase(),
                communityId: membership?.communityId
            }
        };

    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
