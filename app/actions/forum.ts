'use server'

import { db } from "@/db";
import { forumPosts, forumComments, forumLikes, members, users } from "@/db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export type ForumActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

// Types expected by frontend
export type ForumComment = {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    timestamp: string;
};

export type ForumPost = {
    id: string;
    author: string;
    initials: string;
    content: string;
    timestamp: string;
    likes: number;
    likedByMe: boolean;
    comments: ForumComment[];
    category: string;
    authorId: string;
};

export async function getCommunityPosts(communityId: string, currentMemberId?: string): Promise<ForumActionState> {
    try {
        const posts = await db
            .select({
                post: forumPosts,
                authorMember: members,
                authorUser: users,
            })
            .from(forumPosts)
            .leftJoin(members, eq(forumPosts.authorId, members.id))
            .leftJoin(users, eq(members.userId, users.id))
            .where(eq(forumPosts.communityId, communityId))
            .orderBy(desc(forumPosts.createdAt));

        let myLikes: string[] = [];
        if (currentMemberId) {
            const likes = await db
                .select()
                .from(forumLikes)
                .where(eq(forumLikes.memberId, currentMemberId));
            myLikes = likes.map(l => l.postId);
        }

        const postIds = posts.map(p => p.post.id);
        let allComments: any[] = [];

        if (postIds.length > 0) {
            allComments = await db
                .select({
                    comment: forumComments,
                    authorMember: members,
                    authorUser: users
                })
                .from(forumComments)
                .leftJoin(members, eq(forumComments.authorId, members.id))
                .leftJoin(users, eq(members.userId, users.id))
                .where(inArray(forumComments.postId, postIds))
                .orderBy(desc(forumComments.createdAt));
        }

        const data: ForumPost[] = posts.map(({ post, authorMember, authorUser }) => {
            const pComments = allComments
                .filter(c => c.comment.postId === post.id)
                .map(({ comment, authorUser }) => ({
                    id: comment.id,
                    authorId: comment.authorId,
                    authorName: authorUser?.name || "Neighbor",
                    content: comment.content,
                    timestamp: comment.createdAt?.toISOString() || "",
                }));

            return {
                id: post.id,
                author: authorUser?.name || "Neighbor",
                initials: (authorUser?.name || "N").split(' ').map((n: string) => n[0]).join('').substring(0, 2),
                content: post.content,
                timestamp: post.createdAt?.toISOString() || "",
                likes: post.likes || 0,
                likedByMe: myLikes.includes(post.id),
                comments: pComments,
                category: post.category,
                authorId: post.authorId
            };
        });

        return { success: true, data };

    } catch (error: any) {
        console.error("Failed to fetch forum posts:", error);
        return { success: false, error: error.message };
    }
}

export async function createPost(data: {
    communityId: string;
    authorId: string;
    content: string;
    category: string;
}): Promise<ForumActionState> {
    try {
        const [newPost] = await db.insert(forumPosts).values({
            communityId: data.communityId,
            authorId: data.authorId,
            content: data.content,
            category: data.category
        }).returning();

        return { success: true, data: newPost };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createComment(data: {
    postId: string;
    authorId: string;
    content: string;
}): Promise<ForumActionState> {
    try {
        const [newComment] = await db.insert(forumComments).values({
            postId: data.postId,
            authorId: data.authorId,
            content: data.content
        }).returning();

        return { success: true, data: newComment };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleLike(postId: string, memberId: string): Promise<ForumActionState> {
    try {
        const existingLike = await db
            .select()
            .from(forumLikes)
            .where(and(eq(forumLikes.postId, postId), eq(forumLikes.memberId, memberId)))
            .limit(1);

        if (existingLike.length > 0) {
            // Unlike
            await db.delete(forumLikes).where(eq(forumLikes.id, existingLike[0].id));
            await db.update(forumPosts)
                .set({ likes: sql`${forumPosts.likes} - 1` })
                .where(eq(forumPosts.id, postId));
            return { success: true, data: { action: 'unliked' } };
        } else {
            // Like
            await db.insert(forumLikes).values({ postId, memberId });
            await db.update(forumPosts)
                .set({ likes: sql`${forumPosts.likes} + 1` })
                .where(eq(forumPosts.id, postId));
            return { success: true, data: { action: 'liked' } };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
