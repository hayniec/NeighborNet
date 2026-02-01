"use client";

import { useState, useEffect } from "react";
import { NeighborCard } from "@/components/dashboard/NeighborCard";
import styles from "./neighbors.module.css";
import { Search, Filter, Mail, X } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getNeighbors } from "@/app/actions/neighbors";
import { createInvitation } from "@/app/actions/invitations";
// Import the Neighbor type locally or from a types file if available. 
// Assuming NeighborCard expects the type from "@/types/neighbor" which matches MOCK.
import { Neighbor } from "@/types/neighbor";

export default function NeighborsPage() {
    const { user } = useUser();
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
                // Fallback if no community (e.g. first admin login without setup)
                // In a real app we'd redirect or show setup. For now, try fetching with a placeholder or handle empty.
                setIsLoading(false);
                return;
            }

            try {
                // Determine if we need to pass communityId. 
                // The action expects it. 
                const result = await getNeighbors(user.communityId);
                if (result.success && result.data) {
                    // Map result to Neighbor type if needed (dates might be strings/Date objects)
                    // The action returns objects that match reasonably well, need to ensure type safety.
                    const mapped: Neighbor[] = result.data.map((n: any) => ({
                        ...n,
                        // Ensure arrays exist
                        skills: n.skills || [],
                        equipment: n.equipment || [],
                        // Ensure string for date if component expects string
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
    }, [user.communityId]);

    const filteredNeighbors = neighbors.filter((neighbor) => {
        const term = searchTerm.toLowerCase();
        return (
            neighbor.name.toLowerCase().includes(term) ||
            neighbor.skills.some((s) => s.toLowerCase().includes(term)) ||
            neighbor.equipment.some((e) => e.name.toLowerCase().includes(term))
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
                            {searchTerm ? `No neighbors found matching "${searchTerm}".` : "No neighbors found. Invite some people!"}
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
                            <button onClick={() => setIsInviteModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Send an invitation code to a new resident. They can use this code to join NeighborNet.
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
