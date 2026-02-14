"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type ThemeColor = {
    name: string;
    primary: string;
    ring: string;
};

export type ColorMode = 'light' | 'dark' | 'system';

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

    colorMode: ColorMode;
    setColorMode: (mode: ColorMode) => void;

    communityName: string;
    setCommunityName: (name: string) => void;
    communityLogo: string;
    setCommunityLogo: (url: string) => void;
    enabledModules: {
        marketplace: boolean;
        resources: boolean;
        events: boolean;
        documents: boolean;
        forum: boolean;
        messages: boolean;
        services: boolean; // service pros
        local: boolean; // local guide
    };
    toggleModule: (module: 'marketplace' | 'resources' | 'events' | 'documents' | 'forum' | 'messages' | 'services' | 'local', value: boolean) => void;
    showEmergencyOnDesktop: boolean;
    setShowEmergencyOnDesktop: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeColor>(THEMES[0]);
    const [colorMode, setColorModeState] = useState<ColorMode>('system');
    const [communityName, setCommunityNameState] = useState("KithGrid Community");
    const [communityLogo, setCommunityLogoState] = useState("");

    // Helper to determine text color (black or white) based on background hex
    const getContrastYIQ = (hexcolor: string) => {
        hexcolor = hexcolor.replace("#", "");
        var r = parseInt(hexcolor.substr(0, 2), 16);
        var g = parseInt(hexcolor.substr(2, 2), 16);
        var b = parseInt(hexcolor.substr(4, 2), 16);
        var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    // Load initial state
    useEffect(() => {
        const savedThemeName = localStorage.getItem("kithGrid_themeName");
        const savedColorMode = localStorage.getItem("kithGrid_colorMode") as ColorMode;
        const savedCommunityName = localStorage.getItem("kithGrid_communityName");
        const savedCommunityLogo = localStorage.getItem("kithGrid_communityLogo");

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

        if (savedColorMode) {
            setColorModeState(savedColorMode);
        }

        if (savedCommunityName) {
            setCommunityNameState(savedCommunityName);
        } else if (envCommunity) {
            setCommunityNameState(envCommunity);
        }

        if (savedCommunityLogo) {
            setCommunityLogoState(savedCommunityLogo);
        }

        // Load modules
        const savedModules = localStorage.getItem("kithGrid_modules");
        if (savedModules) {
            setEnabledModules(JSON.parse(savedModules));
        }

        // Check for Custom Branding (Simulation)
        const customPrimary = localStorage.getItem('kithGrid_customPrimary');
        const customSecondary = localStorage.getItem('kithGrid_customSecondary');
        const customAccent = localStorage.getItem('kithGrid_customAccent');

        if (customPrimary) {
            document.documentElement.style.setProperty("--primary", customPrimary);
            document.documentElement.style.setProperty("--ring", customPrimary);
            document.documentElement.style.setProperty("--primary-foreground", getContrastYIQ(customPrimary));
        }
        if (customSecondary) {
            document.documentElement.style.setProperty("--secondary", customSecondary);
            document.documentElement.style.setProperty("--secondary-foreground", getContrastYIQ(customSecondary));
        }
        if (customAccent) {
            document.documentElement.style.setProperty("--accent", customAccent);
            document.documentElement.style.setProperty("--accent-foreground", getContrastYIQ(customAccent));
        }
    }, []);

    // Handle Color Mode changes
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (colorMode === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            root.classList.add(systemTheme);

            // Listen for system changes
            const listener = (e: MediaQueryListEvent) => {
                root.classList.remove("light", "dark");
                root.classList.add(e.matches ? "dark" : "light");
            };
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            mediaQuery.addEventListener("change", listener);
            return () => mediaQuery.removeEventListener("change", listener);
        } else {
            root.classList.add(colorMode);
        }
    }, [colorMode]);

    const [enabledModules, setEnabledModules] = useState({
        marketplace: true,
        resources: true,
        events: true,
        documents: true,
        forum: true,
        messages: true,
        services: true,
        local: true
    });

    const [showEmergencyOnDesktop, setShowEmergencyOnDesktopState] = useState(false);

    useEffect(() => {
        const savedShowEmergency = localStorage.getItem("kithGrid_showEmergencyOnDesktop");
        if (savedShowEmergency) {
            setShowEmergencyOnDesktopState(savedShowEmergency === "true");
        }
    }, []);

    const setShowEmergencyOnDesktop = (value: boolean) => {
        setShowEmergencyOnDesktopState(value);
        localStorage.setItem("kithGrid_showEmergencyOnDesktop", String(value));
    };

    const toggleModule = (module: 'marketplace' | 'resources' | 'events' | 'documents' | 'forum' | 'messages' | 'services' | 'local', value: boolean) => {
        const newModules = { ...enabledModules, [module]: value };
        setEnabledModules(newModules);
        localStorage.setItem("kithGrid_modules", JSON.stringify(newModules));
    };

    const setTheme = (newTheme: ThemeColor) => {
        setThemeState(newTheme);
        localStorage.setItem("kithGrid_themeName", newTheme.name);
        // Apply CSS variables
        document.documentElement.style.setProperty("--primary", newTheme.primary);
        document.documentElement.style.setProperty("--ring", newTheme.ring);
    };

    const setColorMode = (mode: ColorMode) => {
        setColorModeState(mode);
        localStorage.setItem("kithGrid_colorMode", mode);
    };

    const setCommunityName = (name: string) => {
        setCommunityNameState(name);
        localStorage.setItem("kithGrid_communityName", name);
    };

    const setCommunityLogo = (url: string) => {
        setCommunityLogoState(url);
        localStorage.setItem("kithGrid_communityLogo", url);
    };

    // Apply theme on initial load as well to prevent flash
    useEffect(() => {
        // Only apply the "theme" state if there are NO custom overrides in local storage.
        // Otherwise, the custom override logic (in the other useEffect) handles it.
        // This prevents the default 'Indigo' theme from clobbering our custom colors on reload.
        const customPrimary = localStorage.getItem('kithGrid_customPrimary');
        if (!customPrimary) {
            document.documentElement.style.setProperty("--primary", theme.primary);
            document.documentElement.style.setProperty("--ring", theme.ring);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{
            theme, setTheme,
            colorMode, setColorMode,
            communityName, setCommunityName,
            communityLogo, setCommunityLogo,
            enabledModules, toggleModule,
            showEmergencyOnDesktop, setShowEmergencyOnDesktop
        }}>
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
