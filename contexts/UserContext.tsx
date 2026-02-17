"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getPrimaryRole, getUserRoles } from "@/utils/roleHelpers";

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
    emergencyButtonSettings?: {
        visible: boolean;
        position: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    };
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
        communityId: "00000000-0000-0000-0000-000000000000",
        emergencyButtonSettings: {
            visible: true,
            position: 'bottom-left'
        }
    });

    const { data: session, status } = useSession();

    useEffect(() => {
        console.log("UserContext Effect - Status:", status);
        console.log("UserContext Effect - Session:", session);

        // Try to recover settings from localStorage if available, to merge with session
        let savedSettings = undefined;
        try {
            const saved = localStorage.getItem("neighborNet_user");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.emergencyButtonSettings) {
                    savedSettings = parsed.emergencyButtonSettings;
                }
            }
        } catch (e) {
            console.error("Failed to parse saved user settings", e);
        }

        if (status === "authenticated" && session?.user) {
            // Get roles using helper function
            const finalRoles = getUserRoles(session.user).map(r => r.toLowerCase() as UserRole);
            const primaryRole = getPrimaryRole(session.user).toLowerCase() as UserRole;

            setUserState(prev => ({
                id: session.user.id,
                name: session.user.name || "Neighbor",
                email: session.user.email || "",
                role: primaryRole,
                roles: finalRoles,
                avatar: session.user.image || "",
                communityId: session.user.communityId || undefined,
                // Preserve existing settings -> prefer local storage -> then current state -> then default
                emergencyButtonSettings: savedSettings || prev.emergencyButtonSettings || {
                    visible: true,
                    position: 'bottom-left'
                }
            }));
        } else if (status === "unauthenticated" || status === "loading") {
            // MOCK USER FOR DEVELOPMENT/BYPASS
            setUserState(prev => ({
                id: "cd48f9df-4096-4f8d-b76c-9a6dca90ceab",
                name: "Super Admin (Bypass)",
                email: "admin@neighbornet.com",
                role: "admin",
                roles: ["admin", "resident"],
                avatar: "SA",
                communityId: "2bf6bc8a-899c-4e29-8ee7-f2038c804260",
                // Preserve existing settings
                emergencyButtonSettings: savedSettings || prev.emergencyButtonSettings || {
                    visible: true,
                    position: 'bottom-left'
                }
            }));
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
        // Toggle between admin and resident for primary role
        const newPrimaryRole = user.role === "admin" ? "resident" : "admin";

        // Update roles array to include the new primary role
        let newRoles = [...user.roles];
        if (!newRoles.includes(newPrimaryRole)) {
            newRoles = [newPrimaryRole, ...newRoles.filter(r => r !== newPrimaryRole)];
        } else {
            // Move the role to the front (make it primary)
            newRoles = [newPrimaryRole, ...newRoles.filter(r => r !== newPrimaryRole)];
        }

        setUser({ ...user, role: newPrimaryRole, roles: newRoles });
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
