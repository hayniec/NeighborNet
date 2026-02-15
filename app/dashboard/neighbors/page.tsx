"use client";

import { useState, useEffect } from "react";
import { NeighborCard } from "@/components/dashboard/NeighborCard";
import styles from "./neighbors.module.css";
import { Search, Filter, Mail, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getNeighbors } from "@/app/actions/neighbors";
import { getUserProfile } from "@/app/actions/user";
import { createInvitation } from "@/app/actions/invitations";
import { Neighbor } from "@/types/neighbor";

export default function NeighborsPage() {
    const { user, setUser } = useUser();
    const [neighbors, setNeighbors] = useState<Neighbor[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSendingInvite, setIsSendingInvite] = useState(false);

    // Fetch neighbors on mount
    useEffect(() => {
        const fetchNeighbors = async () => {
            if (!user.communityId) {
                // If user context is loaded but missing communityId, stop loading.
                // We check user.id or role to ensure we aren't just briefly undefined during auth load
                if (user.role) {
                    setIsLoading(false);
                }
                return;
            }

            try {
                const result = await getNeighbors(user.communityId);
                if (result.success && result.data) {
                    const mapped: Neighbor[] = result.data.map((n: any) => ({
                        ...n,
                        skills: n.skills || [],
                        equipment: n.equipment || [],
                        joinedDate: n.joinedDate ? new Date(n.joinedDate).toLocaleDateString() : 'Unknown',
                        isOnline: n.isOnline || false
                    }));
                    setNeighbors(mapped);
                }
            } catch (e) {
                console.error("Failed to load neighbors", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNeighbors();
    }, [user.communityId, user.role]);

    const filteredNeighbors = neighbors.filter((neighbor) => {
        const term = searchTerm.toLowerCase();
        return (
            neighbor.name.toLowerCase().includes(term) ||
            neighbor.skills.some((s) => s.toLowerCase().includes(term)) ||
            (neighbor.equipment || []).some((e) => e.name.toLowerCase().includes(term))
        );
    });

    const handleSendInvite = async () => {
        if (!inviteEmail) return;
        if (!user.communityId) {
            alert("Error: You are not associated with a community ID. Cannot invite.");
            return;
        }

        setIsSendingInvite(true);
        try {
            const result = await createInvitation({
                communityId: user.communityId,
                email: inviteEmail,
                createdBy: user.id
            });

            if (result.success) {
                alert(`Invitation sent to ${inviteEmail}!\n\nCode: ${result.data.code}`);
                setInviteEmail("");
                setIsInviteModalOpen(false);
            } else {
                alert(`Failed to send invite: ${result.error}`);
            }
        } catch (e) {
            console.error("Invite error:", e);
            alert("An unexpected error occurred.");
        } finally {
            setIsSendingInvite(false);
        }
    };

    if (!isLoading && !user.communityId) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                <h2>Session Information Missing</h2>
                <p>We couldn't detect your community information.</p>

                <div style={{ marginTop: '1rem', padding: '1rem', background: '#333', color: '#fff', borderRadius: '4px', textAlign: 'left', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    <strong>Debug Info:</strong><br />
                    User ID: {user?.id || 'Missing'}<br />
                    Email: {user?.email || 'Missing'}<br />
                    Community ID: {user?.communityId || 'Missing'}<br />
                    Role: {user?.role || 'Missing'}<br />
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={async () => {
                            if (user?.id) {
                                const res = await getUserProfile(user.id);
                                if (res.success && res.data && res.data.communityId) {
                                    alert(`Found Community: ${res.data.communityId}. Updating...`);
                                    setUser({ ...user, communityId: res.data.communityId, role: res.data.role as any });
                                    window.location.reload();
                                } else {
                                    alert("Server verify failed: No community found for this user.");
                                }
                            } else {
                                alert("No User ID to verify with.");
                            }
                        }}
                        style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Try Auto-Fix
                    </button>

                    <a href="/login" onClick={(e) => {
                        e.preventDefault();
                        localStorage.removeItem('kithGrid_user');
                        // Force logout
                        window.location.href = '/api/auth/signout';
                    }} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--foreground)', textDecoration: 'none', cursor: 'pointer', display: 'inline-block' }}>
                        Sign Out
                    </a>
                </div>
            </div>
        );

    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Neighbors Directory</h1>
                        <p style={{ color: 'var(--muted-foreground)', maxWidth: '600px' }}>
                            Connect with neighbors, find help with skills you need, or borrow equipment for your next project.
                        </p>
                    </div>
                    {(user.role as string) === 'Admin' && (
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '999px',
                                backgroundColor: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.9rem'
                            }}
                        >
                            <Mail size={16} />
                            Invite Neighbor
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    maxWidth: '500px',
                    marginTop: '1rem'
                }}>
                    <div style={{
                        position: 'relative',
                        flex: 1
                    }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, skill, or equipment..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.75rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)',
                                color: 'var(--foreground)',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button style={{
                        padding: '0 1.25rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--card)',
                        color: 'var(--foreground)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading neighbors...</div>
            ) : (
                <div className={styles.grid}>
                    {filteredNeighbors.map((neighbor) => (
                        <NeighborCard key={neighbor.id} neighbor={neighbor} />
                    ))}
                    {filteredNeighbors.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            {searchTerm ? `No neighbors found matching "${searchTerm}".` : "No other neighbors found yet."}
                        </div>
                    )}
                </div>
            )}

            {isInviteModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                    backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--background)',
                        padding: '2rem',
                        borderRadius: 'var(--radius)',
                        width: '100%',
                        maxWidth: '400px',
                        border: '1px solid var(--border)',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invite Neighbor</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Send an invitation to a resident of this community.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                                <input
                                    type="email"
                                    placeholder="neighbor@example.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--foreground)',
                                        width: '100%'
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleSendInvite}
                                disabled={isSendingInvite}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: isSendingInvite ? 'not-allowed' : 'pointer',
                                    opacity: isSendingInvite ? 0.7 : 1
                                }}
                            >
                                {isSendingInvite ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
