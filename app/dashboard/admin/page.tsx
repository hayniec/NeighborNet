"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme, THEMES } from "@/contexts/ThemeContext";
import styles from "./admin.module.css";
import { Palette, Shield, Users, FileText, Trash2, CheckCircle, UserPlus, Mail, X, Edit2 } from "lucide-react";
import { createInvitation, getInvitations, deleteInvitation } from "@/app/actions/invitations";
import { getCommunities } from "@/app/actions/communities";
import { getNeighbors, deleteNeighbor, updateNeighbor } from "@/app/actions/neighbors";

type Tab = 'general' | 'users' | 'invites';

type Invitation = {
    id: string;
    code: string;
    email: string;
    status: 'pending' | 'used' | 'expired';
    createdAt?: Date;
};

interface NeighborUser {
    id: string;
    name: string;
    avatar: string;
    role: string;
    address: string;
    email: string;
    joinedDate?: Date;
}

export default function AdminPage() {
    const { theme, setTheme, communityName, setCommunityName, communityLogo, setCommunityLogo } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('general');

    // User Management State
    const [users, setUsers] = useState<NeighborUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userSearchTerm, setUserSearchTerm] = useState("");

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
        (u.address && u.address.toLowerCase().includes(userSearchTerm.toLowerCase()))
    );

    // User Editing State
    const [editingUser, setEditingUser] = useState<NeighborUser | null>(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState(false);

    // Invite System State
    const [invites, setInvites] = useState<Invitation[]>([]);
    const [newInviteEmail, setNewInviteEmail] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingInvites, setIsLoadingInvites] = useState(false);
    const [inviteFilter, setInviteFilter] = useState<'pending' | 'used' | 'expired'>('pending');
    const [inviteSearchTerm, setInviteSearchTerm] = useState("");

    const filteredInvites = invites.filter(i =>
        i.status === inviteFilter &&
        i.email.toLowerCase().includes(inviteSearchTerm.toLowerCase())
    );

    const [communityId, setCommunityId] = useState<string>("");

    // Fetch real Community ID
    useEffect(() => {
        const fetchCommunityId = async () => {
            try {
                const res = await getCommunities();
                if (res.success && res.data && res.data.length > 0) {
                    setCommunityId(res.data[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch community ID", error);
            }
        };
        fetchCommunityId();
    }, []);

    const loadUsers = useCallback(async () => {
        if (!communityId) return;
        setIsLoadingUsers(true);
        try {
            const result = await getNeighbors(communityId);
            if (result.success && result.data) {
                // Cast logic to match defined interface if data from server is loose
                setUsers(result.data as unknown as NeighborUser[]);
            }
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, [communityId]);

    const loadInvites = useCallback(async () => {
        if (!communityId) return;
        setIsLoadingInvites(true);
        try {
            const result = await getInvitations(communityId);
            if (result.success && result.data) {
                setInvites(result.data as unknown as Invitation[]);
            } else {
                console.error("Failed to load invitations:", result.error);
            }
        } catch (error) {
            console.error("Error loading invitations:", error);
        } finally {
            setIsLoadingInvites(false);
        }
    }, [communityId]);

    // Load invitations when switching to the invites tab
    useEffect(() => {
        if (activeTab === 'invites' && communityId) {
            loadInvites();
        }
    }, [activeTab, communityId, loadInvites]);

    // Load users when switching to the users tab
    useEffect(() => {
        if (activeTab === 'users' && communityId) {
            loadUsers();
        }
    }, [activeTab, communityId, loadUsers]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to remove ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const result = await deleteNeighbor(userId);
            if (result.success) {
                alert("User removed successfully.");
                loadUsers(); // Refresh list
            } else {
                alert(`Failed to remove user: ${result.error}`);
            }
        } catch (error) {
            console.error("Error removing user:", error);
            alert("Unexpected error removing user.");
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        setIsUpdatingUser(true);

        try {
            const result = await updateNeighbor(editingUser.id, {
                name: editingUser.name,
                role: editingUser.role as 'Admin' | 'Resident' | 'Board Member',
                address: editingUser.address
            });

            if (result.success) {
                setEditingUser(null); // Close modal
                loadUsers(); // Refresh list
            } else {
                alert(`Failed to update user: ${result.error}`);
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Unexpected error updating user.");
        } finally {
            setIsUpdatingUser(false);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState<{ code: string, email: string, message: string }>({ code: '', email: '', message: '' });

    const generateInvite = async () => {
        if (!newInviteEmail) {
            alert("Please enter an email address");
            return;
        }

        if (!communityId) {
            alert("No community found. Please refresh or create a community first.");
            return;
        }

        setIsGenerating(true);
        try {
            const result = await createInvitation({
                communityId: communityId,
                email: newInviteEmail,
            });

            if (result.success && result.data) {
                const appUrl = window.location.origin;
                const message = `Hi! I've invited you to join our neighborhood portal.\n\n1. Go to: ${appUrl}/join\n2. Enter code: ${result.data.code}\n\nThis code expires in 7 days.`;

                setModalData({
                    code: result.data.code,
                    email: newInviteEmail,
                    message: message
                });
                setShowModal(true);

                setNewInviteEmail("");
                await loadInvites(); // Reload the list
            } else {
                alert(`Failed to generate invitation: ${result.error}`);
            }
        } catch (error) {
            console.error("Error generating invitation:", error);
            alert("Unexpected error generating invitation");
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(modalData.message).then(() => {
            alert("Message copied to clipboard!");
            setShowModal(false);
        });
    };

    const handleDeleteInvite = async (id: string) => {
        if (!confirm("Are you sure you want to delete this invitation?")) {
            return;
        }

        try {
            const result = await deleteInvitation(id);
            if (result.success) {
                await loadInvites();
            } else {
                alert(`Failed to delete invitation: ${result.error}`);
            }
        } catch (error) {
            console.error("Error deleting invitation:", error);
            alert("Unexpected error deleting invitation");
        }
    };

    // Tabs Navigation
    const renderTabs = () => (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
            <button
                onClick={() => setActiveTab('general')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'general' ? 600 : 400,
                    color: activeTab === 'general' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                Configuration
            </button>
            <button
                onClick={() => setActiveTab('users')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'users' ? 600 : 400,
                    color: activeTab === 'users' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                User Management
            </button>
            <button
                onClick={() => setActiveTab('invites')}
                style={{
                    padding: '0.75rem 1rem',
                    borderBottom: activeTab === 'invites' ? '2px solid var(--primary)' : 'none',
                    fontWeight: activeTab === 'invites' ? 600 : 400,
                    color: activeTab === 'invites' ? 'var(--foreground)' : 'var(--muted-foreground)'
                }}
            >
                Invitations
            </button>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admin Console</h1>
                <p className={styles.subtitle}>Manage community settings, global configuration, and moderation.</p>
            </div>

            <div className={styles.grid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{users.length}</span>
                    <span className={styles.statLabel}>Active Households</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{invites.filter(i => i.status === 'pending').length}</span>
                    <span className={styles.statLabel}>Pending Invites</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>Open Maintenance Requests</span>
                </div>
            </div>

            {renderTabs()}

            {activeTab === 'general' && (
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Palette size={20} className="text-primary" />
                            <span className={styles.cardTitle}>Branding & Appearance</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Community Name</label>
                                <input
                                    className={styles.input}
                                    value={communityName}
                                    onChange={(e) => setCommunityName(e.target.value)}
                                    placeholder="e.g. HOA NeighborNet"
                                    aria-label="Community Name"
                                />
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                    This name appears on the sidebar and browser tab.
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Community Logo URL</label>
                                <input
                                    className={styles.input}
                                    value={communityLogo}
                                    onChange={(e) => setCommunityLogo(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    aria-label="Community Logo URL"
                                />
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                    Paste a URL for your community logo. Ideally a PNG with transparent background.
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.label}>Color Theme</label>
                                <div className={styles.themeGrid}>
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.name}
                                            onClick={() => setTheme(t)}
                                            className={styles.themeBtn}
                                            style={{
                                                borderColor: theme.name === t.name ? 'var(--primary)' : 'var(--border)',
                                                backgroundColor: theme.name === t.name ? 'var(--accent)' : 'var(--background)'
                                            }}
                                        >
                                            <div className={styles.themeColor} style={{ backgroundColor: t.primary }}></div>
                                            <span className={styles.themeName}>{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Shield size={20} />
                            <span className={styles.cardTitle}>Access Control</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Member Policy</label>
                                <select className={styles.input} aria-label="New Member Policy">
                                    <option>Approval Required (Recommended)</option>
                                    <option>Open Registration</option>
                                    <option>Invite Only</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Guest Access</label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" defaultChecked />
                                    Allow residents to generate guest passes
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Users size={20} />
                        <span className={styles.cardTitle}>Manage Residents</span>
                    </div>
                    <div className={styles.cardContent}>
                        {/* Search Input */}
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                className={styles.input}
                                placeholder="Search by name, email, or address..."
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                aria-label="Search residents"
                            />
                        </div>

                        {isLoadingUsers ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading residents...</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Name</th>
                                        <th style={{ padding: '0.5rem' }}>Role</th>
                                        <th style={{ padding: '0.5rem' }}>Address</th>
                                        <th style={{ padding: '0.5rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '0.75rem 0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{user.avatar}</div>
                                                    {user.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.75rem',
                                                    background: user.role && user.role.includes('Board') ? 'var(--primary)' : 'var(--muted)',
                                                    color: user.role && user.role.includes('Board') ? 'white' : 'var(--foreground)'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.5rem' }}>{user.address}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    style={{ fontSize: '0.8rem', color: 'var(--primary)', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Edit2 size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    style={{ fontSize: '0.8rem', color: 'red', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <Trash2 size={12} /> Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'invites' && (
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <UserPlus size={20} />
                            <span className={styles.cardTitle}>Generate New Invite</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Recipient Email</label>
                                <input
                                    className={styles.input}
                                    placeholder="neighbor@example.com"
                                    value={newInviteEmail}
                                    onChange={(e) => setNewInviteEmail(e.target.value)}
                                    aria-label="Recipient Email"
                                />
                            </div>
                            <button
                                onClick={generateInvite}
                                disabled={isGenerating}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    background: isGenerating ? 'var(--muted)' : 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: isGenerating ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Code'}
                            </button>
                        </div>
                    </div>



                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Mail size={20} />
                            <span className={styles.cardTitle}>Invitations</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.filterContainer}>
                                <button
                                    onClick={() => setInviteFilter('pending')}
                                    className={`${styles.filterButton} ${inviteFilter === 'pending' ? styles.filterButtonActive : ''}`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setInviteFilter('used')}
                                    className={`${styles.filterButton} ${inviteFilter === 'used' ? styles.filterButtonActive : ''}`}
                                >
                                    Accepted
                                </button>
                                <button
                                    onClick={() => setInviteFilter('expired')}
                                    className={`${styles.filterButton} ${inviteFilter === 'expired' ? styles.filterButtonActive : ''}`}
                                >
                                    Expired
                                </button>
                            </div>

                            {/* Search Input */}
                            <div style={{ marginBottom: '1rem' }}>
                                <input
                                    className={styles.input}
                                    placeholder="Search by email..."
                                    value={inviteSearchTerm}
                                    onChange={(e) => setInviteSearchTerm(e.target.value)}
                                    aria-label="Search invitations"
                                />
                            </div>

                            {isLoadingInvites ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading invitations...</div>
                            ) : filteredInvites.length === 0 ? (
                                <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem' }}>No {inviteFilter} invitations.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {filteredInvites.map((invite, idx) => (
                                        <li key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            borderBottom: '1px solid var(--border)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{invite.email}</div>
                                                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', background: 'var(--muted)', padding: '0.1rem 0.3rem', borderRadius: 4, display: 'inline-block', marginTop: 4 }}>
                                                    {invite.code}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '1rem',
                                                    background: invite.status === 'pending' ? 'var(--accent)' : 'var(--muted)',
                                                    color: invite.status === 'pending' ? 'var(--primary)' : 'var(--muted-foreground)'
                                                }}>
                                                    {invite.status}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteInvite(invite.id)}
                                                    aria-label="Delete invitation"
                                                    style={{ color: 'var(--muted-foreground)', cursor: 'pointer', background: 'none', border: 'none' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* Success Invitation Modal */}
            {
                showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{
                            backgroundColor: 'var(--card)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            width: '90%',
                            maxWidth: '500px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            border: '1px solid var(--border)',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowModal(false)}
                                aria-label="Close modal"
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--muted-foreground)',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '3rem',
                                    height: '3rem',
                                    backgroundColor: 'var(--accent)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem auto',
                                    color: 'var(--primary)'
                                }}>
                                    <CheckCircle size={24} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Invitation Created!</h2>
                                <p style={{ color: 'var(--muted-foreground)' }}>Share this with your neighbor.</p>
                            </div>

                            <div style={{
                                backgroundColor: 'var(--muted)',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                whiteSpace: 'pre-wrap',
                                marginBottom: '1.5rem',
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)'
                            }}>
                                {modalData.message}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'var(--foreground)',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={copyToClipboard}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--primary)',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <FileText size={18} />
                                    Copy Message
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit User Modal */}
            {
                editingUser && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }}>
                        <div style={{
                            backgroundColor: 'var(--card)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            width: '90%',
                            maxWidth: '500px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                            border: '1px solid var(--border)',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setEditingUser(null)}
                                aria-label="Close modal"
                                style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--muted-foreground)',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Edit Resident</h2>
                                <p style={{ color: 'var(--muted-foreground)' }}>Update details for {editingUser.name}</p>
                            </div>

                            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                <label className={styles.label}>Name</label>
                                <input
                                    className={styles.input}
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    aria-label="Resident Name"
                                />
                            </div>

                            <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                                <label className={styles.label}>Address</label>
                                <input
                                    className={styles.input}
                                    value={editingUser.address || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                                    aria-label="Resident Address"
                                />
                            </div>

                            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
                                <label className={styles.label}>Role</label>
                                <select
                                    className={styles.input}
                                    value={editingUser.role}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    aria-label="Resident Role"
                                >
                                    <option value="Resident">Resident</option>
                                    <option value="Board Member">Board Member</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setEditingUser(null)}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        color: 'var(--foreground)',
                                        fontWeight: 600,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateUser}
                                    disabled={isUpdatingUser}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: 'var(--primary)',
                                        border: 'none',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: isUpdatingUser ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isUpdatingUser ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
