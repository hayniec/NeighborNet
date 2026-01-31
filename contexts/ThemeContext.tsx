"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeColor = {
    name: string;
    primary: string;
    ring: string;
};

export const THEMES: ThemeColor[] = [
    { name: "Indigo (Default)", primary: "#4f46e5", ring: "#6366f1" },
    { name: "Forest", primary: "#059669", ring: "#10b981" },
    { name: "Ocean", primary: "#0284c7", ring: "#0ea5e9" },
    { name: "Sunset", primary: "#ea580c", ring: "#f97316" },
    { name: "Berry", primary: "#db2777", ring: "#ec4899" },
    { name: "Slate", primary: "#475569", ring: "#94a3b8" },
];

interface ThemeContextType {
    theme: ThemeColor;
    setTheme: (theme: ThemeColor) => void;
    communityName: string;
    setCommunityName: (name: string) => void;
    communityLogo: string;
    setCommunityLogo: (url: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeColor>(THEMES[0]);
    const [communityName, setCommunityNameState] = useState("HOA NeighborNet");
    const [communityLogo, setCommunityLogoState] = useState("");

    useEffect(() => {
        const savedThemeName = localStorage.getItem("neighborNet_themeName");
        const savedCommunityName = localStorage.getItem("neighborNet_communityName");
        const savedCommunityLogo = localStorage.getItem("neighborNet_communityLogo");

        // Environment defaults
        const envTheme = process.env.NEXT_PUBLIC_DEFAULT_THEME;
        const envCommunity = process.env.NEXT_PUBLIC_COMMUNITY_NAME;

        if (savedThemeName) {
            const foundTheme = THEMES.find(t => t.name === savedThemeName);
            if (foundTheme) setThemeState(foundTheme);
        } else if (envTheme) {
            const foundTheme = THEMES.find(t => t.name === envTheme);
            if (foundTheme) setThemeState(foundTheme);
        }

        if (savedCommunityName) {
            setCommunityNameState(savedCommunityName);
        } else if (envCommunity) {
            setCommunityNameState(envCommunity);
        }

        if (savedCommunityLogo) {
            setCommunityLogoState(savedCommunityLogo);
        }
    }, []);

    const setTheme = (newTheme: ThemeColor) => {
        setThemeState(newTheme);
        localStorage.setItem("neighborNet_themeName", newTheme.name);
        // Apply CSS variables
        document.documentElement.style.setProperty("--primary", newTheme.primary);
        document.documentElement.style.setProperty("--ring", newTheme.ring);
    };

    const setCommunityName = (name: string) => {
        setCommunityNameState(name);
        localStorage.setItem("neighborNet_communityName", name);
    };

    const setCommunityLogo = (url: string) => {
        setCommunityLogoState(url);
        localStorage.setItem("neighborNet_communityLogo", url);
    };

    // Apply theme on initial load as well to prevent flash
    useEffect(() => {
        document.documentElement.style.setProperty("--primary", theme.primary);
        document.documentElement.style.setProperty("--ring", theme.ring);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, communityName, setCommunityName, communityLogo, setCommunityLogo }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
