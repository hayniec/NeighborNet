'use server'

import { db } from "@/db";
import { members, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type NeighborActionState = {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
};


/**
 * Register a new neighbor
 */
export async function registerNeighbor(data: {
    communityId: string;
    email: string;
    password?: string;
    name: string;
    address?: string;
    role?: 'Admin' | 'Resident' | 'Board Member';
}): Promise<NeighborActionState> {
    try {
        console.log("[registerNeighbor] Registering neighbor:", data.email);

        // 1. Check/Create Global User
        let [user] = await db.select().from(users).where(eq(users.email, data.email));

        if (!user) {
            [user] = await db.insert(users).values({
                email: data.email,
                name: data.name,
                password: data.password || 'temp123',
                // avatar: ...
            }).returning();
        }

        // 2. Check Member Existence
        const [existingMember] = await db
            .select()
            .from(members)
            .where(
                and(
                    eq(members.userId, user.id),
                    eq(members.communityId, data.communityId)
                )
            );

        if (existingMember) {
            return {
                success: false,
                error: "User is already a member of this community."
            };
        }

        // 3. Create Member
        const [newMember] = await db.insert(members).values({
            userId: user.id,
            communityId: data.communityId,
            role: data.role || 'Resident',
            address: data.address,
            joinedDate: new Date(),
            isOnline: true
        }).returning();

        return {
            success: true,
            data: {
                id: newMember.id,
                name: user.name,
                email: user.email,
                role: newMember.role,
                communityId: newMember.communityId,
            },
            message: "Account created successfully"
        };
    } catch (error: any) {
        console.error("Failed to register neighbor:", error);
        return { success: false, error: error.message || "Failed to create account" };
    }
}

/**
 * Get all neighbors for a community (for Admin Panel)
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

/**
 * Get all neighbors for a community (for Admin Panel)
 */
export async function getNeighbors(communityId: string): Promise<NeighborActionState> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify requestor has admin/board access to this community
        const [membership] = await db
            .select()
            .from(members)
            .where(
                and(
                    eq(members.userId, session.user.id),
                    eq(members.communityId, communityId)
                )
            );

        if (!membership || !['Admin', 'Board Member'].includes(membership.role || '')) {
            return { success: false, error: "Insufficient permissions" };
        }

        const results = await db
            .select({
                id: members.id,
                role: members.role,
                address: members.address,
                hoaPosition: members.hoaPosition,
                joinedDate: members.joinedDate,
                skills: members.skills,
                isOnline: members.isOnline,
                name: users.name,
                email: users.email,
                avatar: users.avatar,
            })
            .from(members)
            .innerJoin(users, eq(members.userId, users.id))
            .where(eq(members.communityId, communityId));

        return {
            success: true,
            data: results.map(n => ({
                id: n.id,
                name: n.name,
                email: n.email,
                role: n.role,
                address: n.address,
                hoaPosition: n.hoaPosition,
                avatar: n.avatar || '👤',
                joinedDate: n.joinedDate,
                skills: n.skills || [],
                equipment: []
            }))
        };
    } catch (error: any) {
        console.error("Failed to fetch neighbors:", error);
        return { success: false, error: error.message || "Failed to fetch neighbors" };
    }
}

/**
 * Delete a neighbor (Remove membership)
 */
export async function deleteNeighbor(memberId: string): Promise<NeighborActionState> {
    try {
        await db.delete(members).where(eq(members.id, memberId));
        return { success: true, message: "Neighbor removed successfully" };
    } catch (error: any) {
        console.error("Failed to delete neighbor:", error);
        return { success: false, error: error.message || "Failed to delete neighbor" };
    }
}

/**
 * Update a neighbor's details
 */
export async function updateNeighbor(memberId: string, data: {
    name?: string;
    role?: 'Admin' | 'Resident' | 'Board Member';
    address?: string;
    hoaPosition?: string | null;
}): Promise<NeighborActionState> {
    try {
        // Update member specific fields
        await db.update(members)
            .set({
                role: data.role,
                address: data.address,
                hoaPosition: data.hoaPosition
            })
            .where(eq(members.id, memberId));

        // If name changes, we need to update 'users' table, but that affects global profile.
        // For now, let's assume specific profile updates might be needed or handled separately.
        // If we MUST update name here (as admin might want to fix a typo), we need the userId.

        if (data.name) {
            const [member] = await db.select().from(members).where(eq(members.id, memberId));
            if (member && member.userId) {
                await db.update(users).set({ name: data.name }).where(eq(users.id, member.userId));
            }
        }

        return { success: true, message: "Neighbor updated successfully" };
    } catch (error: any) {
        console.error("Failed to update neighbor:", error);
        return { success: false, error: error.message || "Failed to update neighbor" };
    }
}

/**
 * Get a single neighbor by ID
 */
export async function getNeighbor(id: string): Promise<NeighborActionState> {
    try {
        const result = await db
            .select({
                id: members.id,
                role: members.role,
                address: members.address,
                hoaPosition: members.hoaPosition,
                joinedDate: members.joinedDate,
                skills: members.skills,
                isOnline: members.isOnline,
                name: users.name,
                email: users.email,
                avatar: users.avatar,
            })
            .from(members)
            .innerJoin(users, eq(members.userId, users.id))
            .where(eq(members.id, id));

        if (result.length === 0) {
            return { success: false, error: "Neighbor not found" };
        }

        const n = result[0];
        return {
            success: true,
            data: {
                id: n.id,
                name: n.name,
                email: n.email,
                role: n.role,
                address: n.address,
                avatar: n.avatar,
                joinedDate: n.joinedDate,
                skills: (n.skills && n.skills.length > 0) ? n.skills : ['Gardening', 'Community Organizing', 'Home Repair'],
                isOnline: n.isOnline,
                // Defaults for missing table columns
                phone: "(555) 123-4567",
                interests: ['Hiking', 'Board Games', 'Local History'],
                equipment: ['Ladder', 'Power Drill', 'Lawn Mower']
            }
        };
    } catch (error: any) {
        console.error("Failed to fetch neighbor:", error);
        return { success: false, error: error.message };
    }
}

