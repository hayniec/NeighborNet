'use server'

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/db";
import { invitations, members, communities } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { sendInvitationEmail } from "@/app/lib/email";

export type InvitationActionState = {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
};

// Generate a random 6-character code
function generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ...

/**
 * Helper to verify admin status
 */
async function isAdmin(userId: string, communityId: string): Promise<boolean> {
    if (!userId || !communityId) return false;
    // Allow mock super admin
    if (userId === "mock-super-admin-id") return true;

    try {
        const [member] = await db
            .select()
            .from(members)
            .where(and(
                eq(members.userId, userId),
                eq(members.communityId, communityId)
            ));
        return !!(member && (member.role === 'Admin' || (member.roles && member.roles.includes('Admin'))));
    } catch {
        return false;
    }
}

/**
 * Create a new invitation (Admin only)
 */
export async function createInvitation(data: {
    communityId: string;
    email: string;
    role?: 'Admin' | 'Resident' | 'Board Member';
    createdBy?: string; // Legacy parameter, ignored in favor of session
}): Promise<InvitationActionState> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Feature Requirement: Only Admins can create invitations
        // Feature Requirement: Only Admins can create invitations
        const [adminMember] = await db
            .select()
            .from(members)
            .where(and(
                eq(members.userId, session.user.id),
                eq(members.communityId, data.communityId)
            ));

        if (!adminMember || (adminMember.role !== 'Admin' && (!adminMember.roles || !adminMember.roles.includes('Admin')))) {
            return { success: false, error: "Only admins can send invitations." };
        }

        const code = generateCode();


        const [invitation] = await db.insert(invitations).values({
            communityId: data.communityId,
            email: data.email,
            code,
            role: data.role || 'Resident',
            createdBy: adminMember.id, // Use the resolved Admin Member ID
            status: 'pending',
        }).returning();

        // Fetch Community Name for the email
        const [community] = await db.select({ name: communities.name }).from(communities).where(eq(communities.id, data.communityId));

        // Attempt to send email (don't block return on failure, just log)
        if (community) {
            await sendInvitationEmail(data.email, code, community.name);
        }

        return {
            success: true,
            data: {
                id: invitation.id,
                code: invitation.code,
                email: invitation.email,
                status: invitation.status,
            },
            message: `Invitation created and email sent! Code: ${code}`
        };
    } catch (error: any) {
        console.error("Failed to create invitation:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to create invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Bulk create invitations (for CSV Import)
 */
export async function bulkCreateInvitations(data: {
    communityId: string;
    invitations: { email: string; name?: string }[];
    createdBy: string;
}): Promise<InvitationActionState> {
    try {
        const session = await getServerSession(authOptions);
        // Fallback to data.createdBy if session is missing (e.g. mock user), but prefer session
        const userId = session?.user?.id || data.createdBy;

        // Resolve Admin Member
        const [adminMember] = await db
            .select()
            .from(members)
            .where(and(
                eq(members.userId, userId),
                eq(members.communityId, data.communityId)
            ));

        // Permission Check
        if (!adminMember || adminMember.role !== 'Admin') {
            // Allow mock super admin bypass if needed, but for now strict check unless mock ID
            if (userId !== "mock-super-admin-id") {
                return { success: false, error: "Only admins can perform bulk import." };
            }
        }

        const safeCreatedBy = userId === "mock-super-admin-id" ? null : (adminMember?.id || null);

        const values = data.invitations.map(inv => ({
            communityId: data.communityId,
            email: inv.email,
            invitedName: inv.name || null,
            code: generateCode(), // Generate unique code for each
            createdBy: safeCreatedBy,
            status: 'pending' as const
        }));

        if (values.length === 0) return { success: false, error: "No emails provided" };

        const inserted = await db.insert(invitations).values(values).returning();

        return {
            success: true,
            data: inserted,
            message: `Successfully created ${inserted.length} invitations.`
        };

    } catch (error: any) {
        console.error("Failed to bulk create invitations:", error);
        return { success: false, error: error.message || "Failed to bulk create" };
    }
}

/**
 * Get all invitations for a community
 */

export async function getInvitations(communityId: string): Promise<InvitationActionState> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify requestor has admin/board access
        const [membership] = await db
            .select()
            .from(members)
            .where(
                and(
                    eq(members.userId, session.user.id),
                    eq(members.communityId, communityId)
                )
            );

        if (!membership || !['Admin', 'Board Member'].includes(membership.role || '')) {
            return { success: false, error: "Insufficient permissions" };
        }

        const results = await db
            .select()
            .from(invitations)
            .where(eq(invitations.communityId, communityId));

        return {
            success: true,
            data: results.map(inv => ({
                id: inv.id,
                code: inv.code,
                email: inv.email,
                status: inv.status,
                createdAt: inv.createdAt,
            }))
        };
    } catch (error: any) {
        console.error("Failed to fetch invitations:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to fetch invitations";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Validate an invitation code
 */
export async function validateInvitation(code: string): Promise<InvitationActionState> {
    try {
        const [invitation] = await db
            .select()
            .from(invitations)
            .where(
                and(
                    eq(invitations.code, code.toUpperCase()),
                    eq(invitations.status, 'pending')
                )
            );

        if (!invitation) {
            return {
                success: false,
                error: "Invalid or expired invitation code"
            };
        }

        // Check if expired (if expiresAt is set)
        if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
            return {
                success: false,
                error: "This invitation code has expired"
            };
        }

        return {
            success: true,
            data: {
                id: invitation.id,
                code: invitation.code,
                email: invitation.email,
                communityId: invitation.communityId,
                role: invitation.role,
            }
        };
    } catch (error: any) {
        console.error("Failed to validate invitation:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to validate invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Mark an invitation as used
 */
export async function markInvitationUsed(code: string): Promise<InvitationActionState> {
    try {
        const [updated] = await db
            .update(invitations)
            .set({ status: 'used' })
            .where(eq(invitations.code, code.toUpperCase()))
            .returning();

        if (!updated) {
            return {
                success: false,
                error: "Invitation not found"
            };
        }

        return {
            success: true,
            message: "Invitation marked as used"
        };
    } catch (error: any) {
        console.error("Failed to mark invitation as used:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to update invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}

/**
 * Delete an invitation (Admin only implicitly, but should probably verify ownership or admin)
 */
export async function deleteInvitation(id: string): Promise<InvitationActionState> {
    try {
        await db.delete(invitations).where(eq(invitations.id, id));

        return {
            success: true,
            message: "Invitation deleted"
        };
    } catch (error: any) {
        console.error("Failed to delete invitation:", error);
        const detail = error.detail ? ` (Detail: ${error.detail})` : '';
        const code = error.code ? ` (Code: ${error.code})` : '';
        const msg = error.message || "Failed to delete invitation";
        return { success: false, error: `${msg}${code}${detail}` };
    }
}
