'use server'

import { db } from "@/db";
import { documents, members, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type DocumentActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityDocuments(communityId: string): Promise<DocumentActionState> {
    try {
        const results = await db
            .select({
                doc: documents,
                uploaderUser: users
            })
            .from(documents)
            .leftJoin(members, eq(documents.uploaderId, members.id))
            .leftJoin(users, eq(members.userId, users.id))
            .where(eq(documents.communityId, communityId))
            .orderBy(desc(documents.uploadDate));

        return {
            success: true,
            data: results.map(({ doc, uploaderUser }) => ({
                id: doc.id,
                title: doc.name,
                type: 'External Link',
                source: 'external',
                size: doc.size || 'N/A',
                date: doc.uploadDate?.toLocaleDateString(),
                url: doc.url, // Correct property from schema
                category: doc.category,
                uploaderName: uploaderUser?.name || "Unknown"
            }))
        };
    } catch (error: any) {
        console.error("Failed to fetch documents:", error);
        return { success: false, error: error.message };
    }
}

export async function createDocument(data: {
    communityId: string;
    name: string;
    category: string;
    filePath: string;
    uploadedBy: string;
}): Promise<DocumentActionState> {
    try {
        const [newDoc] = await db.insert(documents).values({
            communityId: data.communityId,
            name: data.name,
            category: data.category,
            url: data.filePath, // Mapping usage of filePath to db column url
            uploaderId: data.uploadedBy, // Mapping usage of uploadedBy to db column uploaderId
        }).returning();

        return {
            success: true,
            data: {
                ...newDoc,
                url: newDoc.url // Ensure return data is consistent
            }
        };
    } catch (error: any) {
        console.error("Failed to create document:", error);
        return { success: false, error: error.message };
    }
}
