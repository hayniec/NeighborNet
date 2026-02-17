"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export type UserRole = "admin" | "resident" | "event manager" | "board member";

interface UserProfile {
    id?: string;
    communityId?: string;
    email?: string;
    name: string;
    role: UserRole;
    roles: UserRole[]; // New multi-role support
    avatar: string;
    address?: string;
    personalEmergencyCode?: string;
    personalEmergencyInstructions?: string;
}

interface UserContextType {
    user: UserProfile;
    setUser: (user: UserProfile) => void;
    toggleRole: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUserState] = useState<UserProfile>({
        name: "Eric H.",
        role: "admin",
        roles: ["admin"],
        avatar: "EH",
        address: "123 Oak St, Unit 4",
        communityId: "00000000-0000-0000-0000-000000000000"
    });

    const { data: session, status } = useSession();

    useEffect(() => {
        console.log("UserContext Effect - Status:", status);
        console.log("UserContext Effect - Session:", session);
        if (status === "authenticated" && session?.user) {
            // Normalize roles to lowercase
            const sessionRoles = (session.user.roles || []).map(r => r.toLowerCase() as UserRole);
            const primaryRole = (session.user.role?.toLowerCase() as UserRole) || "resident";

            // Ensure roles array includes primary role if missing
            const finalRoles = sessionRoles.length > 0 ? sessionRoles : [primaryRole];

            setUserState({
                id: session.user.id,
                name: session.user.name || "Neighbor",
                email: session.user.email || "",
                role: primaryRole,
                roles: finalRoles,
                avatar: session.user.image || "",
                communityId: session.user.communityId || undefined,
            });
        } else if (status === "unauthenticated" || status === "loading") {
            // MOCK USER FOR DEVELOPMENT/BYPASS
            setUserState({
                id: "cd48f9df-4096-4f8d-b76c-9a6dca90ceab",
                name: "Super Admin (Bypass)",
                email: "admin@neighbornet.com",
                role: "admin",
                roles: ["admin", "resident"],
                avatar: "SA",
                communityId: "2bf6bc8a-899c-4e29-8ee7-f2038c804260",
            });
        }
    }, [session, status]);

    // Keep localStorage for now as fallback or for manual overrides if any? 
    // Actually, let's allow localStorage to initialize ONLY if session is not yet loaded or unauth?
    // But session is better. Let's keep existing logic but session takes precedence.
    useEffect(() => {
        const savedUser = localStorage.getItem("neighborNet_user");
        if (savedUser && status !== "authenticated") {
            setUserState(JSON.parse(savedUser));
        }
    }, []);

    const setUser = (newUser: UserProfile) => {
        setUserState(newUser);
        localStorage.setItem("neighborNet_user", JSON.stringify(newUser));
    };

    const toggleRole = () => {
        const newRole = user.role === "admin" ? "resident" : "admin";
        setUser({ ...user, role: newRole });
    };

    return (
        <UserContext.Provider value={{ user, setUser, toggleRole }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
