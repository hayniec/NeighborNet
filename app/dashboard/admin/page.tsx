"use client";

import { useState, useEffect } from "react";
import { useTheme, THEMES } from "@/contexts/ThemeContext";
import styles from "./admin.module.css";
import { Palette, Shield, Users, FileText, AlertTriangle, Key, Trash2, CheckCircle, UserPlus, Mail } from "lucide-react";
import { MOCK_NEIGHBORS } from "@/lib/data";

type Tab = 'general' | 'users' | 'invites';

export default function AdminPage() {
    const { theme, setTheme, communityName, setCommunityName, communityLogo, setCommunityLogo } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('general');

    // User Management State
    const [mockUsers, setMockUsers] = useState(MOCK_NEIGHBORS);

    // Invite System State
    const [invites, setInvites] = useState<{ code: string, email: string, status: 'pending' | 'used' }[]>([]);
    const [newInviteEmail, setNewInviteEmail] = useState("");

    // Load invites from local storage on mount
    useEffect(() => {
        const storedInvites = localStorage.getItem('neighborNet_invites');
        if (storedInvites) {
            setInvites(JSON.parse(storedInvites));
        }
    }, []);

    const generateInvite = () => {
        if (!newInviteEmail) return;

        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newInvite = { code, email: newInviteEmail, status: 'pending' as const };
        const updatedInvites = [...invites, newInvite];

        setInvites(updatedInvites);
        localStorage.setItem('neighborNet_invites', JSON.stringify(updatedInvites));
        setNewInviteEmail("");
        alert(`Invite generated! Code: ${code}`);
    };

    const deleteInvite = (code: string) => {
        const updated = invites.filter(i => i.code !== code);
        setInvites(updated);
        localStorage.setItem('neighborNet_invites', JSON.stringify(updated));
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

            {/* Quick Stats Row */}
            <div className={styles.grid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{mockUsers.length}</span>
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
                    {/* Branding Section */}
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

                    {/* Access Control Section */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Shield size={20} />
                            <span className={styles.cardTitle}>Access Control</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>New Member Policy</label>
                                <select className={styles.input}>
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
                                {mockUsers.map(user => (
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
                                                background: user.role.includes('Board') ? 'var(--primary)' : 'var(--muted)',
                                                color: user.role.includes('Board') ? 'white' : 'var(--foreground)'
                                            }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.5rem' }}>{user.address}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <button style={{ fontSize: '0.8rem', color: 'var(--primary)', marginRight: '1rem' }}>Edit</button>
                                            <button style={{ fontSize: '0.8rem', color: 'red' }}>Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                />
                            </div>
                            <button
                                onClick={generateInvite}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius)',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Generate Code
                            </button>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Mail size={20} />
                            <span className={styles.cardTitle}>Pending Invitations</span>
                        </div>
                        <div className={styles.cardContent}>
                            {invites.length === 0 ? (
                                <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem' }}>No active invitations.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {invites.map((invite, idx) => (
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
                                                    onClick={() => deleteInvite(invite.code)}
                                                    style={{ color: 'var(--muted-foreground)', cursor: 'pointer' }}
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
            )}
        </div>
    );
}
