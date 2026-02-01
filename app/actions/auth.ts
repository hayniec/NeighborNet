'use server'

import { db } from "@/db";
import { neighbors } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function authenticateUser(email: string, password: string) {
    if (!email || !password) {
        return { success: false, error: "Email and password are required" };
    }

    try {
        const [user] = await db
            .select()
            .from(neighbors)
            .where(
                and(
                    eq(neighbors.email, email),
                    eq(neighbors.password, password)
                )
            );

        if (!user) {
            return { success: false, error: "Invalid email or password" };
        }

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role ? user.role.toLowerCase() : "resident",
                avatar: user.avatar || user.name.charAt(0).toUpperCase(),
                communityId: user.communityId
            }
        };

    } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "An unexpected error occurred" };
    }
}
