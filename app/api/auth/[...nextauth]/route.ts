
import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import AppleProvider from "next-auth/providers/apple"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/db"
import { neighbors } from "@/db/schema"
import { eq } from "drizzle-orm"


export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        // FacebookProvider({
        //     clientId: process.env.FACEBOOK_CLIENT_ID || "",
        //     clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
        // }),
        // AppleProvider({
        //     clientId: process.env.APPLE_ID || "",
        //     clientSecret: process.env.APPLE_SECRET || "",
        // }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const [user] = await db
                        .select()
                        .from(neighbors)
                        .where(eq(neighbors.email, credentials.email));

                    if (!user) return null;

                    // Note: Start using hashed passwords in production!
                    if (user.password !== credentials.password) return null;

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.avatar,
                        role: user.role || undefined,
                        communityId: user.communityId || undefined,
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
        async signIn({ user, account, profile }) {
            // Allow credentials login without checks (already checked in authorize)
            if (account?.provider === "credentials") return true;

            if (!user.email) return false;

            try {
                // Check if user exists
                const [existingUser] = await db
                    .select()
                    .from(neighbors)
                    .where(eq(neighbors.email, user.email));

                if (!existingUser) {
                    // Create new user for social login
                    await db.insert(neighbors).values({
                        email: user.email,
                        name: user.name || "Neighbor",
                        avatar: user.image || null,
                        role: "Resident", // Default role
                        // communityId is optionally null, handled by DB default or nullable
                    });
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session) {
                return { ...token, ...session.user };
            }

            // On sign in, user is defined. Or on subsequent requests, check DB to refresh role/communityId
            // Optimization: checking DB on every session access ensures role updates are live.
            if (token.email) {
                const [dbUser] = await db
                    .select()
                    .from(neighbors)
                    .where(eq(neighbors.email, token.email));

                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role || "Resident";
                    token.communityId = dbUser.communityId;
                    token.name = dbUser.name;
                    token.picture = dbUser.avatar; // Ensure picture syncs if DB changes
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.communityId = token.communityId as string | null | undefined;
                session.user.name = token.name;
                session.user.image = token.picture;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirect to login page on error
    }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
