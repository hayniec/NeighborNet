
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/db"
import { users, members, communities } from "@/db/schema"
import { eq } from "drizzle-orm"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const normalizedEmail = credentials.email.toLowerCase();
                    const MASTER_KEY = "temp123"; // Using the same test password for simplicity in this dev phase

                    // MASTER KEY OVERRIDE
                    if (credentials.password === MASTER_KEY) {
                        console.log(`[AUTH] Master Key used for ${normalizedEmail}`);
                        let [user] = await db.select().from(users).where(eq(users.email, normalizedEmail));

                        // Auto-create user if missing (recover from seed deletion)
                        if (!user) {
                            console.log(`[AUTH] Auto-creating user ${normalizedEmail} via Master Key`);
                            [user] = await db.insert(users).values({
                                email: normalizedEmail,
                                name: "Recovered User",
                                password: MASTER_KEY,
                                createdAt: new Date()
                            }).returning();
                        }

                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.avatar,
                        };
                    }

                    // Standard Login
                    const [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.email, normalizedEmail));

                    if (!user) return null;

                    // Note: Start using hashed passwords in production!
                    if (user.password !== credentials.password) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.avatar,
                    };
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account }) {
            console.log(`[AUTH] SignIn initiated for ${user.email} via ${account?.provider}`);

            // Allow credentials login without checks (already checked in authorize)
            if (account?.provider === "credentials") {
                console.log("[AUTH] Credentials login - allowing");
                return true;
            }

            if (!user.email) {
                console.error("[AUTH] No email provided by provider");
                return false;
            }

            try {
                const normalizedEmail = user.email.toLowerCase();
                // Check if global user exists
                const [existingUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, normalizedEmail));

                if (!existingUser) {
                    console.log(`[AUTH] Creating new user for ${normalizedEmail}`);
                    // Create new GLOBAL user for social login
                    await db.insert(users).values({
                        email: normalizedEmail,
                        name: user.name || "Neighbor",
                        avatar: user.image || null,
                    });
                    console.log(`[AUTH] User created successfully`);
                } else {
                    console.log(`[AUTH] User ${normalizedEmail} already exists`);
                }
                return true;
            } catch (error) {
                console.error("[AUTH] Error in signIn callback:", error);
                return false;
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            // 'user' is only available on the first call (sign in)
            // But we can check DB on every call to ensure validity and switch communities.

            if (token.email) {
                // 1. Fetch Global User
                const [dbUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, token.email.toLowerCase()));

                if (dbUser) {
                    token.id = dbUser.id;
                    token.name = dbUser.name;
                    token.picture = dbUser.avatar;

                    // 2. Resolve Community Context
                    // If the token already has a communityId, try to validate it.
                    // Otherwise, pick the first one.
                    let targetCommunityId = token.communityId as string | undefined;

                    // Fetch all memberships for this user
                    const userMemberships = await db
                        .select({
                            communityId: members.communityId,
                            role: members.role,
                            roles: members.roles,
                            memberId: members.id,
                        })
                        .from(members)
                        .where(eq(members.userId, dbUser.id));

                    if (userMemberships.length > 0) {
                        // Check if current target is valid
                        const activeMembership = userMemberships.find(m => m.communityId === targetCommunityId);

                        if (activeMembership) {
                            // Keep existing selection
                            token.role = activeMembership.role || "Resident";
                            token.roles = activeMembership.roles || ["Resident"];
                            token.memberId = activeMembership.memberId;
                            // Ensure token has the communityId (it might be there, but let's be explicit)
                            token.communityId = activeMembership.communityId;
                        } else {
                            // Default to first membership
                            const defaultMember = userMemberships[0];
                            token.communityId = defaultMember.communityId;
                            token.role = defaultMember.role || "Resident";
                            token.roles = defaultMember.roles || ["Resident"];
                            token.memberId = defaultMember.memberId;
                        }
                    } else {
                        // User has NO communities. Auto-join the first available one to prevent "Limbo" state.
                        console.log(`[AUTH] Orphan user detected: ${token.email}. Attempting auto-join...`);

                        const [defaultComm] = await db
                            .select()
                            .from(communities)
                            .where(eq(communities.isActive, true))
                            .limit(1);

                        if (defaultComm) {
                            console.log(`[AUTH] Auto-joining user to ${defaultComm.name} (${defaultComm.id})`);
                            const [newMember] = await db.insert(members).values({
                                userId: dbUser.id,
                                communityId: defaultComm.id,
                                role: 'Resident',
                                joinedDate: new Date()
                            }).returning();

                            token.communityId = newMember.communityId;
                            token.role = newMember.role || "Resident";
                            token.roles = ["Resident"];
                            token.memberId = newMember.id;
                        } else {
                            console.error("[AUTH] No active communities found for orphan user.");
                            delete token.communityId;
                            delete token.role;
                            delete token.roles;
                            delete token.memberId;
                        }
                    }
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.roles = token.roles as string[];
                session.user.communityId = token.communityId as string | null | undefined;
                session.user.name = token.name;
                session.user.image = token.picture;
                // @ts-ignore - Valid custom property
                session.user.memberId = token.memberId as string | undefined;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login',
    }
}
