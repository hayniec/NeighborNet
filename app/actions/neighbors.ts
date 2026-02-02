'use server'

import { db } from "@/db";
import { neighbors } from "@/db/schema";
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

        // Check if user already exists in this community
        const existing = await db
            .select()
            .from(neighbors)
            .where(
                and(
                    eq(neighbors.communityId, data.communityId),
                    eq(neighbors.email, data.email)
                )
            );

        if (existing.length > 0) {
            return {
                success: false,
                error: "A user with this email already exists in this community."
            };
        }

        const [newNeighbor] = await db.insert(neighbors).values({
            communityId: data.communityId,
            email: data.email,
            password: data.password || 'temp123', // Default for now if missing
            name: data.name,
            address: data.address,
            role: data.role || 'Resident',
            joinedDate: new Date(),
            isOnline: true // Log them in effectively
        }).returning();

        console.log("[registerNeighbor] Successfully registered:", newNeighbor.id);

        return {
            success: true,
            data: {
                id: newNeighbor.id,
                name: newNeighbor.name,
                email: newNeighbor.email,
                role: newNeighbor.role,
                communityId: newNeighbor.communityId,
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
export async function getNeighbors(communityId: string): Promise<NeighborActionState> {
    try {
        const results = await db
            .select()
            .from(neighbors)
            .where(eq(neighbors.communityId, communityId));

        return {
            success: true,
            data: results.map(n => ({
                id: n.id,
                name: n.name,
                email: n.email,
                role: n.role,
                address: n.address,
                avatar: n.avatar || '👤',
                joinedDate: n.joinedDate,
                skills: n.skills || [],
                equipment: [] // TODO: Add equipment table or field
            }))
        };
    } catch (error: any) {
        console.error("Failed to fetch neighbors:", error);
        return { success: false, error: error.message || "Failed to fetch neighbors" };
    }
}

/**
 * Delete a neighbor
 */
export async function deleteNeighbor(neighborId: string): Promise<NeighborActionState> {
    try {
        await db.delete(neighbors).where(eq(neighbors.id, neighborId));
        return { success: true, message: "Neighbor removed successfully" };
    } catch (error: any) {
        console.error("Failed to delete neighbor:", error);
        return { success: false, error: error.message || "Failed to delete neighbor" };
    }
}

/**
 * Update a neighbor's details
 */
export async function updateNeighbor(neighborId: string, data: {
    name?: string;
    role?: 'Admin' | 'Resident' | 'Board Member';
    address?: string;
}): Promise<NeighborActionState> {
    try {
        await db.update(neighbors)
            .set(data)
            .where(eq(neighbors.id, neighborId));

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
            .select()
            .from(neighbors)
            .where(eq(neighbors.id, id));

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
                skills: n.skills || [],
                isOnline: n.isOnline,
                // Defaults for missing table columns
                phone: "",
                interests: [],
                equipment: []
            }
        };
    } catch (error: any) {
        console.error("Failed to fetch neighbor:", error);
        return { success: false, error: error.message };
    }
}
