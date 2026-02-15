'use server'

import { db } from "@/db";
import { users, members, communities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getUserProfile(userId: string) {
    // DEBUG: Test mode to isolate crash
    // Logic commented out to verify connectivity
    return { success: false, error: "DEBUG: CONNECTION SUCCESSFUL - DB LOGIC BYPASSED" };

    /*
    try {
        console.log("[getUserProfile] Fetching for userId:", userId);

        // Fetch User
        const [dbUser] = await db.select().from(users).where(eq(users.id, userId));
        if (!dbUser) return { success: false, error: "User not found" };

        // Fetch Membership (First one found)
        let [membership] = await db
            .select()
            .from(members)
            .where(eq(members.userId, userId));

        if (!membership) {
            console.log("[getUserProfile] User has no memberships.");

            // SPECIAL FIX: Auto-join 'Erich Haynie' to the first community if found
            // This handles the case where the user account exists but link is lost
            const email = dbUser.email.toLowerCase();
            // Check for both spellings (Eric/Erich) and admin
            if (email.includes('eric.haynie') || email.includes('erich.haynie') || email.includes('admin')) {
                console.log(`[AutoFix] Creating admin membership for ${email}...`);
                
                let [comm] = await db.select().from(communities).limit(1);
                
                // Fallback: Create default community if DB is empty
                if (!comm) {
                    console.log("[AutoFix] No communities found! Creating 'Demo Community'...");
                    const [newComm] = await db.insert(communities).values({
                        name: "Demo Community",
                        slug: `demo-${Date.now()}`,
                        hasEmergency: true
                    }).returning();
                    comm = newComm;
                }

                if (comm) {
                    console.log(`[AutoFix] Joining community: ${comm.name} (${comm.id})`);
                    const [newMember] = await db.insert(members).values({
                        userId: userId,
                        communityId: comm.id,
                        role: 'Admin', // Capitalized 'Admin' per schema enum
                        joinedDate: new Date()
                    }).returning();
                    
                    membership = newMember;
                    console.log("[AutoFix] Membership created!", membership);
                }
            }


            if (!membership) {
                 console.error("[getUserProfile] Auto-Fix FAILED. No membership found after create attempt.");
                 return { 
                    success: false, 
                    error: `Auto-Fix failed: Could not create membership. Email: ${email}. Community limit: ${await db.select({ count: communities.id }).from(communities).limit(1).then(r => r.length)}`
                };
            }
        }

        console.log("[getUserProfile] Found membership:", membership);
        console.log(`[AutoFix] Deployment Check: ${new Date().toISOString()}`);

        // Return ONLY simple strings to guarantee no serialization errors
        return {
            success: true,
            data: {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                communityId: membership.communityId,
                role: membership.role ? membership.role.toLowerCase() : 'resident'
            }
        };

    } catch (e: any) {
        console.error("Failed to get user profile", e);
        return { success: false, error: `Server Error: ${e.message || String(e)}` };
    }
    */
}
