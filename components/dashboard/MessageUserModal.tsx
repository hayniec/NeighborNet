"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { getNeighbors } from "@/app/actions/neighbors";
import { X, Search, User } from "lucide-react";
import styles from "./Modal.module.css"; // Reuse existing modal styles

interface MessageUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (userId: string, userName: string) => void;
}

export function MessageUserModal({ isOpen, onClose, onSelectUser }: MessageUserModalProps) {
    const { user } = useUser();
    const [neighbors, setNeighbors] = useState<any[]>([]);
    const [filteredNeighbors, setFilteredNeighbors] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user?.communityId) {
            loadNeighbors();
        }
    }, [isOpen, user?.communityId]);

    useEffect(() => {
        if (!neighbors) return;
        const term = searchTerm.toLowerCase();
        setFilteredNeighbors(
            neighbors.filter((n: any) =>
                n.name.toLowerCase().includes(term) ||
                (n.skills || []).some((s: string) => s.toLowerCase().includes(term))
            )
        );
    }, [searchTerm, neighbors]);

    const loadNeighbors = async () => {
        if (!user?.communityId) return;
        setLoading(true);
        try {
            const res = await getNeighbors(user.communityId);
            if (res.success && res.data) {
                // Filter out current user from list
                const list = res.data.filter((n: any) => n.id !== user.id);
                setNeighbors(list);
                setFilteredNeighbors(list);
            }
        } catch (error) {
            console.error("Failed to load neighbors", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} style={{ maxWidth: '400px', height: '500px', display: 'flex', flexDirection: 'column' }}>
                <div className={styles.header}>
                    <h2>New Message</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.body} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or skill..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--border)',
                                backgroundColor: 'var(--background)',
                                color: 'var(--foreground)',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading neighbors...</div>
                        ) : filteredNeighbors.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No neighbors found.</div>
                        ) : (
                            filteredNeighbors.map((neighbor) => (
                                <button
                                    key={neighbor.id}
                                    onClick={() => onSelectUser(neighbor.id, neighbor.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--card)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'background-color 0.2s'
                                    }}
                                    className="hover:bg-accent"
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--foreground)'
                                    }}>
                                        {neighbor.avatar ? (
                                            <img src={neighbor.avatar} alt={neighbor.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{neighbor.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                            {neighbor.role || 'Resident'}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
