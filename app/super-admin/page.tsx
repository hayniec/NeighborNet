"use client";

import { useState, useEffect } from "react";
import { Shield, Plus, Check, PowerOff, Building, Download, Trash2, Database } from "lucide-react";
import styles from "./admin.module.css";
import { getCommunities, createCommunity, toggleCommunityStatus, deleteCommunity, toggleCommunityFeature, seedCommunitiesIfNeeded } from "@/app/actions/communities";
import type { Community } from "@/types/community";

export default function SuperAdminPage() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCommunity, setNewCommunity] = useState<Partial<Community>>({
        name: '',
        slug: '',
        plan: 'starter_100',
        features: {
            marketplace: true, resources: true, events: true, documents: true,
            forum: true, messages: true, services: true, local: true
        }
    });

    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {
        setLoading(true);
        try {
            const res = await getCommunities();
            if (res.success && res.data) {
                setCommunities(res.data);
            } else if (!res.success) {
                console.error(res.error);
                // Optionally show toast or error state
            }
        } catch (e) {
            console.error("Failed to load communities", e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeature = async (id: string, feature: keyof Community['features']) => {
        // Optimistic update
        setCommunities(prev => prev.map(c => {
            if (c.id === id) {
                return { ...c, features: { ...c.features, [feature]: !c.features[feature] } };
            }
            return c;
        }));

        const c = communities.find(c => c.id === id);
        if (c) {
            await toggleCommunityFeature(id, feature, !c.features[feature]);
        }
    };

    const handleToggleActive = async (id: string) => {
        // Optimistic update
        const c = communities.find(c => c.id === id);
        if (!c) return;

        const newStatus = !c.isActive;
        setCommunities(prev => prev.map(item => item.id === id ? { ...item, isActive: newStatus } : item));

        await toggleCommunityStatus(id, newStatus);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            setCommunities(prev => prev.filter(c => c.id !== id));
            await deleteCommunity(id);
        }
    };

    const handleExport = (community: Community) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(community, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${community.slug}_export.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleAdd = async () => {
        if (!newCommunity.name || !newCommunity.slug) {
            alert("Please enter a name and slug.");
            return;
        }

        const res = await createCommunity({
            ...newCommunity,
            // defaults
            branding: {
                logoUrl: '',
                primaryColor: '#4f46e5',
                secondaryColor: '#1e1b4b',
                accentColor: '#f59e0b'
            }
        });

        if (res.success && res.data) {
            setCommunities([...communities, res.data]);
            setShowAddModal(false);
            setNewCommunity({
                name: '', slug: '', plan: 'starter_100',
                features: {
                    marketplace: true, resources: true, events: true, documents: true,
                    forum: true, messages: true, services: true, local: true
                }
            });
        } else {
            alert(`Failed to create community: ${res.error || 'Unknown error'}`);
        }
    };

    const handleSeed = async () => {
        setLoading(true);
        const res = await seedCommunitiesIfNeeded();
        if (res.success) {
            loadCommunities();
        } else {
            alert(`Seed failed: ${res.error || 'Unknown error'}`);
            setLoading(false);
        }
    };

    const updateBrandingPreview = (id: string, field: string, value: string) => {
        // Just local state update for preview, ideally implementation would save on blur or store separately
        setCommunities(prev => prev.map(c => c.id === id ? {
            ...c,
            branding: { ...c.branding, [field]: value }
        } : c));
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <Shield size={32} color="#4f46e5" />
                        Super Admin Console <span className={styles.version}>v2.1</span>
                    </h1>
                    <p className={styles.subtitle}>Master control for all NeighborNet tenants.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={styles.addButton}
                >
                    <Plus size={20} />
                    Add Tenant
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading tenants...</div>
            ) : communities.length === 0 ? (
                <div className={styles.emptyState}>
                    <Database size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No tenants found in the database.</p>
                    <button onClick={handleSeed} className={styles.seedButton}>
                        Inventory Empty? Seed Default Data
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {communities.map(comm => (
                        <div key={comm.id} className={`${styles.card} ${!comm.isActive ? styles.cardInactive : ''}`}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitleSection}>
                                    <div className={styles.iconBox}>
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h2 className={styles.cardTitle}>{comm.name}</h2>
                                        <div className={styles.cardMeta}>
                                            <span style={{ fontFamily: 'monospace' }}>{comm.id.substring(0, 8)}...</span>
                                            <span>•</span>
                                            <span>{comm.slug}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                        onClick={() => handleExport(comm)}
                                        title="Export Data"
                                        className={styles.iconButton}
                                        aria-label={`Export data for ${comm.name}`}
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleActive(comm.id)}
                                        title={comm.isActive ? "Disable Tenant" : "Enable Tenant"}
                                        className={`${styles.statusButton} ${comm.isActive ? styles.active : styles.inactive}`}
                                        aria-label={comm.isActive ? "Disable tenant" : "Enable tenant"}
                                    >
                                        {comm.isActive ? <Check size={12} /> : <PowerOff size={12} />}
                                        {comm.isActive ? 'Active' : 'Disabled'}
                                    </button>
                                </div>
                            </div>

                            {/* Branding Section */}
                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Branding</h3>
                                <div className={styles.brandingGrid}>
                                    <div>
                                        <label className={styles.label}>Primary Color</label>
                                        <div className={styles.colorInputWrapper}>
                                            <input
                                                type="color"
                                                value={comm.branding.primaryColor}
                                                onChange={(e) => updateBrandingPreview(comm.id, 'primaryColor', e.target.value)}
                                                className={styles.colorInput}
                                                aria-label="Primary color picker"
                                            />
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{comm.branding.primaryColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={styles.label}>Secondary Color</label>
                                        <div className={styles.colorInputWrapper}>
                                            <input
                                                type="color"
                                                value={comm.branding.secondaryColor}
                                                onChange={(e) => updateBrandingPreview(comm.id, 'secondaryColor', e.target.value)}
                                                className={styles.colorInput}
                                                aria-label="Secondary color picker"
                                            />
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{comm.branding.secondaryColor}</span>
                                        </div>
                                    </div>
                                    {/* Logo URL */}
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label className={styles.label}>Logo URL</label>
                                        <input
                                            type="text"
                                            value={comm.branding.logoUrl}
                                            onChange={(e) => updateBrandingPreview(comm.id, 'logoUrl', e.target.value)}
                                            placeholder="https://..."
                                            className={styles.textInput}
                                            aria-label="Logo URL"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Module Configuration</h3>
                                <div className={styles.modulesFlex}>
                                    {Object.entries(comm.features).map(([key, enabled]) => (
                                        <label key={key} className={`${styles.moduleLabel} ${enabled ? styles.moduleEnabled : styles.moduleDisabled}`}>
                                            <input
                                                type="checkbox"
                                                checked={enabled}
                                                onChange={() => handleToggleFeature(comm.id, key as any)}
                                                className={styles.checkbox}
                                                aria-label={`Toggle ${key} module`}
                                            />
                                            <span className={`${styles.moduleText} ${enabled ? styles.moduleTextEnabled : styles.moduleTextDisabled}`}>{key}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.footer}>
                                <div className={styles.manageButtons}>
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('neighborNet_communityName', comm.name);
                                            localStorage.setItem('neighborNet_modules', JSON.stringify(comm.features));
                                            localStorage.setItem('neighborNet_customPrimary', comm.branding.primaryColor);
                                            localStorage.setItem('neighborNet_customSecondary', comm.branding.secondaryColor);
                                            localStorage.setItem('neighborNet_customAccent', comm.branding.accentColor);
                                            localStorage.setItem('neighborNet_communityLogo', comm.branding.logoUrl);

                                            alert(`Simulating login for ${comm.name}!`);
                                            window.location.href = '/dashboard';
                                        }}
                                        className={styles.simulateButton}
                                    >
                                        <Building size={16} />
                                        Simulate Login
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comm.id)}
                                        className={styles.deleteButton}
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    Current Plan: <strong style={{ color: '#111827' }}>{comm.plan.replace('_', ' ').toUpperCase()}</strong>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Add New Tenant</h2>
                        <input
                            placeholder="Community Name"
                            className={styles.modalInput}
                            value={newCommunity.name}
                            onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
                            aria-label="New Community Name"
                        />
                        <input
                            placeholder="Slug (e.g. oak-hills)"
                            className={styles.modalInput}
                            value={newCommunity.slug}
                            onChange={e => setNewCommunity({ ...newCommunity, slug: e.target.value })}
                            aria-label="New Community Slug"
                        />
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowAddModal(false)} className={styles.cancelButton}>Cancel</button>
                            <button onClick={handleAdd} className={styles.createButton}>Create Tenant</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
