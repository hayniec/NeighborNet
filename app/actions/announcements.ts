'use server'

import { db } from "@/db";
import { announcements, members, users } from "@/db/schema";
import { eq, desc, and, or, isNull, lte, gt } from "drizzle-orm";

export type AnnouncementActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityAnnouncements(communityId: string, userId?: string): Promise<AnnouncementActionState> {
    try {
        let isAdmin = false;

        if (userId) {
            const [member] = await db
                .select()
                .from(members)
                .where(and(eq(members.userId, userId), eq(members.communityId, communityId)));

            const role = member?.role?.toLowerCase();
            isAdmin = role === 'admin' || role === 'board member';
        }

        const now = new Date();
        const baseConditions = [eq(announcements.communityId, communityId)];

        if (!isAdmin) {
            // Residents only see active announcements
            const activeCondition = or(isNull(announcements.activateAt), lte(announcements.activateAt, now));
            if (activeCondition) baseConditions.push(activeCondition);

            const notExpiredCondition = or(isNull(announcements.expiresAt), gt(announcements.expiresAt, now));
            if (notExpiredCondition) baseConditions.push(notExpiredCondition);
        }

        const results = await db
            .select({
                id: announcements.id,
                title: announcements.title,
                content: announcements.content,
                createdAt: announcements.createdAt,
                activateAt: announcements.activateAt,
                expiresAt: announcements.expiresAt,
                authorName: users.name
            })
            .from(announcements)
            .leftJoin(members, eq(announcements.authorId, members.id))
            .leftJoin(users, eq(members.userId, users.id))
            .where(and(...baseConditions))
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
    activateAt?: string;
    expiresAt?: string;
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
            activateAt: data.activateAt ? new Date(data.activateAt) : new Date(),
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }).returning();

        return { success: true, data: newAnnouncement };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAnnouncement(id: string, userId: string): Promise<AnnouncementActionState> {
    try {
        const [announcement] = await db
            .select()
            .from(announcements)
            .where(eq(announcements.id, id));

        if (!announcement) return { success: false, error: "Not found" };

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
