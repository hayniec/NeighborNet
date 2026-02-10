'use server'

import { db } from "@/db";
import { marketplaceItems, members, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type MarketplaceActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityMarketplaceItems(communityId: string): Promise<MarketplaceActionState> {
    try {
        const results = await db
            .select({
                item: marketplaceItems,
                sellerMember: members,
                sellerUser: users
            })
            .from(marketplaceItems)
            .leftJoin(members, eq(marketplaceItems.sellerId, members.id))
            .leftJoin(users, eq(members.userId, users.id))
            .where(eq(marketplaceItems.communityId, communityId))
            .orderBy(desc(marketplaceItems.postedDate));

        return {
            success: true,
            data: results.map(({ item, sellerMember, sellerUser }) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                isFree: item.isFree,
                isNegotiable: item.isNegotiable,
                images: item.images || [],
                status: item.status,
                postedDate: item.postedDate?.toISOString(),
                expiresAt: item.expiresAt?.toISOString(),
                sellerId: item.sellerId,
                sellerName: sellerUser?.name || "Unknown Neighbor",
                sellerEmail: sellerUser?.email // Optional
            }))
        };
    } catch (error: any) {
        console.error("Failed to fetch marketplace items:", error);
        return { success: false, error: error.message };
    }
}

export async function createMarketplaceItem(data: {
    communityId: string;
    title: string;
    description: string;
    price: string;
    isFree: boolean;
    isNegotiable: boolean;
    images: string[];
    sellerId: string;
}): Promise<MarketplaceActionState> {
    try {
        const [newItem] = await db.insert(marketplaceItems).values({
            communityId: data.communityId,
            title: data.title,
            description: data.description,
            price: data.price,
            isFree: data.isFree,
            isNegotiable: data.isNegotiable,
            images: data.images,
            sellerId: data.sellerId,
        }).returning();

        return {
            success: true,
            data: newItem
        };
    } catch (error: any) {
        console.error("Failed to create marketplace item:", error);
        return { success: false, error: error.message };
    }
}
