"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "admin" | "resident" | "event manager";

interface UserProfile {
    id?: string;
    communityId?: string;
    email?: string;
    name: string;
    role: UserRole;
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
        role: "admin", // Default to admin for first-time ease of use
        avatar: "EH",
        address: "123 Oak St, Unit 4"
    });

    useEffect(() => {
        const savedUser = localStorage.getItem("neighborNet_user");
        if (savedUser) {
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
