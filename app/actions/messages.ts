'use server'

import { db } from "@/db";
import { directMessages, members, users } from "@/db/schema";
import { eq, desc, or, and, inArray } from "drizzle-orm";

export type MessageActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getConversations(currentMemberId: string): Promise<MessageActionState> {
    try {
        // Naive approach due to lack of distinct on in complex query easily
        const msgs = await db
            .select()
            .from(directMessages)
            .where(or(eq(directMessages.senderId, currentMemberId), eq(directMessages.recipientId, currentMemberId)))
            .orderBy(desc(directMessages.createdAt));

        const conversationMap = new Map<string, any>();

        for (const msg of msgs) {
            const otherId = msg.senderId === currentMemberId ? msg.recipientId : msg.senderId;
            if (!conversationMap.has(otherId)) {
                conversationMap.set(otherId, {
                    otherId,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    unreadCount: (msg.recipientId === currentMemberId && !msg.isRead) ? 1 : 0
                });
            } else {
                if (msg.recipientId === currentMemberId && !msg.isRead) {
                    const existing = conversationMap.get(otherId);
                    existing.unreadCount += 1;
                }
            }
        }

        const conversationList = Array.from(conversationMap.values());
        const otherIds = conversationList.map(c => c.otherId);

        if (otherIds.length > 0) {
            const usersData = await db
                .select({
                    memberId: members.id,
                    name: users.name
                })
                .from(members)
                .leftJoin(users, eq(members.userId, users.id))
                .where(inArray(members.id, otherIds));

            const nameMap = new Map(usersData.map(u => [u.memberId, u.name]));

            conversationList.forEach(c => {
                c.otherName = nameMap.get(c.otherId) || "Neighbor";
            });
        }

        return { success: true, data: conversationList };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getThread(currentMemberId: string, otherMemberId: string): Promise<MessageActionState> {
    try {
        const msgs = await db
            .select()
            .from(directMessages)
            .where(
                or(
                    and(eq(directMessages.senderId, currentMemberId), eq(directMessages.recipientId, otherMemberId)),
                    and(eq(directMessages.senderId, otherMemberId), eq(directMessages.recipientId, currentMemberId))
                )
            )
            .orderBy(desc(directMessages.createdAt));

        return { success: true, data: msgs.reverse() }; // Return ascending
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function sendMessage(senderUserId: string, recipientUserId: string, content: string): Promise<MessageActionState> {
    try {
        // Look up sender member by user ID
        const [senderMember] = await db.select().from(members).where(eq(members.userId, senderUserId));
        if (!senderMember) {
            return { success: false, error: 'Sender member not found.' };
        }

        // Look up recipient member by user ID
        const [recipientMember] = await db.select().from(members).where(eq(members.userId, recipientUserId));
        if (!recipientMember) {
            return { success: false, error: 'Recipient member not found.' };
        }

        // Insert message using member IDs
        const [msg] = await db.insert(directMessages).values({
            senderId: senderMember.id,
            recipientId: recipientMember.id,
            content
        }).returning();

        return { success: true, data: msg };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
