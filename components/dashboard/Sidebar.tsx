"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Settings, Home, LogOut, Siren, BoxSelect, ShoppingBag, MessageCircle, MessageSquare, FileText, Wrench, MapPin, Shield } from "lucide-react";
import styles from "./dashboard.module.css";

import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Forum", href: "/dashboard/forum", icon: MessageSquare },
    { name: "Messages", href: "/dashboard/messages", icon: MessageCircle },
    { name: "Neighbors", href: "/dashboard/neighbors", icon: Users },
    { name: "Events", href: "/dashboard/events", icon: Calendar },
    { name: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
    { name: "Service Pros", href: "/dashboard/services", icon: Wrench },
    { name: "Local Guide", href: "/dashboard/local", icon: MapPin },
    { name: "Community Resources", href: "/dashboard/resources", icon: BoxSelect },
    { name: "HOA Info", href: "/dashboard/documents", icon: FileText },
    { name: "Emergency", href: "/dashboard/emergency", icon: Siren },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Admin Console", href: "/dashboard/admin", icon: Shield },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('neighborNet_user');
        localStorage.removeItem('neighborNet_invites');
        router.push('/login');
    };
    const { communityName, enabledModules } = useTheme();
    const { user } = useUser();

    // Filter navigation based on role and enabled modules
    const filteredNavigation = navigation.filter(item => {
        // Role check
        if (item.name === "Admin Console") {
            return user.role === "admin";
        }

        // Module checks
        if (item.name === "Marketplace" && !enabledModules?.marketplace) return false;
        if (item.name === "Community Resources" && !enabledModules?.resources) return false;
        if (item.name === "Events" && !enabledModules?.events) return false;
        if (item.name === "Documents" && !enabledModules?.documents) return false;

        // New Modules
        if (item.name === "Forum" && !enabledModules?.forum) return false;
        if (item.name === "Messages" && !enabledModules?.messages) return false;
        if (item.name === "Service Pros" && !enabledModules?.services) return false;
        if (item.name === "Local Guide" && !enabledModules?.local) return false;

        return true;
    });

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
                onClick={onClose}
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.logoContainer}>
                    <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        {/* Simple logo placeholder if SVG not handy, or use SVG icon */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <span className={styles.logoText}>{communityName}</span>

                    {/* Close button for mobile inside sidebar */}
                    <button
                        onClick={onClose}
                        className={styles.iconButton}
                        style={{ marginLeft: 'auto', display: 'flex' }}
                        aria-label="Close Menu"
                    >
                        {/* We can conditionally render this or handle via CSS. For simplicity let's just use CSS to hide it on desktop if we want, or just rely on overlay click. */}
                    </button>
                </div>

                <nav className={styles.nav}>
                    {filteredNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                                onClick={onClose} // Close menu when clicking a link on mobile
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.userProfile}>
                    <div className={styles.avatar}>{user.avatar}</div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userRole} style={{ textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                    <button
                        className={styles.iconButton}
                        style={{ marginLeft: 'auto' }}
                        aria-label="Sign out"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>
        </>
    );
}
