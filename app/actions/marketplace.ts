'use server'

import { db } from "@/db";
import { marketplaceItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type MarketplaceActionState = {
    success: boolean;
    data?: any;
    error?: string;
};

export async function getCommunityMarketplaceItems(communityId: string): Promise<MarketplaceActionState> {
    try {
        const results = await db
            .select()
            .from(marketplaceItems)
            .where(eq(marketplaceItems.communityId, communityId))
            .orderBy(desc(marketplaceItems.postedDate));

        return {
            success: true,
            data: results.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                price: item.price,
                // TODO: Add isFree, isNegotiable to schema or infer
                isFree: Number(item.price) === 0,
                isNegotiable: false,
                images: [],
                status: 'Active',
                postedDate: item.postedDate?.toISOString(),
                expiresAt: item.expiresAt?.toISOString(),
                sellerId: item.sellerId,
                sellerName: "Neighbor" // TODO: Join
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
    sellerId: string;
}): Promise<MarketplaceActionState> {
    try {
        const [newItem] = await db.insert(marketplaceItems).values({
            communityId: data.communityId,
            title: data.title,
            description: data.description,
            price: data.price,
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
