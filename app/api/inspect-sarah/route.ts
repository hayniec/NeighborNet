
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, members, communities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const [sarah] = await db.select().from(users).where(eq(users.email, "sarah.jenkins@example.com"));

        if (!sarah) return NextResponse.json({ error: "Sarah not found in users table" });

        const memberships = await db
            .select({
                communityName: communities.name,
                communityId: members.communityId,
                role: members.role,
                memberId: members.id
            })
            .from(members)
            .innerJoin(communities, eq(members.communityId, communities.id))
            .where(eq(members.userId, sarah.id));

        return NextResponse.json({ sarah, memberships });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
