'use server'

import { db } from "@/db";
import { announcements, members, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export type AnnouncementActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityAnnouncements(communityId: string): Promise<AnnouncementActionState> {
    try {
        const results = await db
            .select({
                id: announcements.id,
                title: announcements.title,
                content: announcements.content,
                createdAt: announcements.createdAt,
                authorName: users.name
            })
            .from(announcements)
            .leftJoin(members, eq(announcements.authorId, members.id))
            .leftJoin(users, eq(members.userId, users.id))
            .where(eq(announcements.communityId, communityId))
            .orderBy(desc(announcements.createdAt));

        return { success: true, data: results };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createAnnouncement(data: {
    communityId: string;
    title: string;
    content: string;
    userId: string;
}): Promise<AnnouncementActionState> {
    try {
        const [member] = await db
            .select()
            .from(members)
            .where(and(
                eq(members.userId, data.userId),
                eq(members.communityId, data.communityId)
            ));

        if (!member) {
            return { success: false, error: "Member not found" };
        }

        const role = member.role?.toLowerCase();
        if (role !== 'admin' && role !== 'board member') {
            return { success: false, error: "Unauthorized: Admins or Board Members only" };
        }

        const [newAnnouncement] = await db.insert(announcements).values({
            communityId: data.communityId,
            title: data.title,
            content: data.content,
            authorId: member.id,
        }).returning();

        return { success: true, data: newAnnouncement };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAnnouncement(id: string, userId: string): Promise<AnnouncementActionState> {
    try {
        // Fetc announcement to verify community
        const [announcement] = await db
            .select()
            .from(announcements)
            .where(eq(announcements.id, id));

        if (!announcement) return { success: false, error: "Not found" };

        // Verify user role
        const [member] = await db
            .select()
            .from(members)
            .where(and(
                eq(members.userId, userId),
                eq(members.communityId, announcement.communityId)
            ));

        if (!member || (member.role?.toLowerCase() !== 'admin' && member.role?.toLowerCase() !== 'board member')) {
            return { success: false, error: "Unauthorized" };
        }

        await db.delete(announcements).where(eq(announcements.id, id));
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
