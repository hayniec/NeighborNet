
"use client";

import { useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext"; // Wrap if needed, or just standard html/body
import { Shield, Plus, Settings, Check, X, Building, Download, Trash2, Power, PowerOff } from "lucide-react";

// Mock Data for Communities (mimicking the DB schema)
type Community = {
    id: string;
    name: string;
    slug: string;
    plan: 'starter_100' | 'growth_250' | 'pro_500';
    features: {
        marketplace: boolean;
        resources: boolean;
        events: boolean;
        documents: boolean;
        forum: boolean;
        messages: boolean;
        services: boolean; // service pros
        local: boolean; // local guide
    };
    isActive: boolean;
    branding: {
        logoUrl: string;
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    };
};

const MOCK_COMMUNITIES: Community[] = [
    {
        id: 'c1',
        name: 'Oak Hills HOA',
        slug: 'oak-hills',
        plan: 'growth_250',
        features: {
            marketplace: true,
            resources: true,
            events: true,
            documents: true,
            forum: true,
            messages: true,
            services: true,
            local: true
        },
        isActive: true,
        branding: {
            logoUrl: 'https://cdn-icons-png.flaticon.com/512/3590/3590453.png',
            primaryColor: '#059669', // Forest green
            secondaryColor: '#064e3b', // Dark green
            accentColor: '#fbbf24' // Amber
        }
    },
    {
        id: 'c2',
        name: 'Sunset Valley',
        slug: 'sunset-valley',
        plan: 'starter_100',
        features: {
            marketplace: false,
            resources: false,
            events: true,
            documents: true,
            forum: false, // Default off for starter maybe?
            messages: true,
            services: false,
            local: true
        },
        isActive: true,
        branding: {
            logoUrl: '',
            primaryColor: '#ea580c', // Orange
            secondaryColor: '#7c2d12', // Dark orange
            accentColor: '#38bdf8' // Sky blue
        }
    }
];

export default function SuperAdminPage() {
    const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
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

    const toggleFeature = (id: string, feature: keyof Community['features']) => {
        // ... (existing)
        setCommunities(communities.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    features: {
                        ...c.features,
                        [feature]: !c.features[feature]
                    }
                };
            }
            return c;
        }));
    };

    const toggleActive = (id: string) => {
        setCommunities(communities.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    };

    const deleteCommunity = (id: string) => {
        if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            setCommunities(communities.filter(c => c.id !== id));
        }
    };

    const exportData = (community: Community) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(community, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${community.slug}_export.json`);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleAddCommunity = () => {
        // ... (existing) ...
        if (!newCommunity.name || !newCommunity.slug) return;

        const newComm: Community = {
            id: `c${communities.length + 1}`,
            name: newCommunity.name,
            slug: newCommunity.slug,
            plan: newCommunity.plan as any,
            features: newCommunity.features as any,
            isActive: true,
            branding: {
                logoUrl: '',
                primaryColor: '#4f46e5', // Default indigo
                secondaryColor: '#1e1b4b', // Default dark indigo
                accentColor: '#f59e0b' // Default amber
            }
        };

        setCommunities([...communities, newComm]);
        setShowAddModal(false);
        setNewCommunity({
            name: '', slug: '', plan: 'starter_100',
            features: {
                marketplace: true, resources: true, events: true, documents: true,
                forum: true, messages: true, services: true, local: true
            }
        });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
            {/* ... (Header) ... */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#111827' }}>
                        <Shield size={32} color="#4f46e5" />
                        Super Admin Console <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 400 }}>v2.0</span>
                    </h1>
                    <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Master control for all NeighborNet tenants.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        backgroundColor: '#4f46e5', color: 'white', padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                >
                    <Plus size={20} />
                    Add Tenant
                </button>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {communities.map(comm => (
                    <div key={comm.id} style={{
                        border: '1px solid #e5e7eb', borderRadius: '1rem', padding: '1.5rem',
                        backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        opacity: comm.isActive ? 1 : 0.7 // Dim inactive tenants
                    }}>
                        {/* Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '12px',
                                    backgroundColor: '#e0e7ff', color: '#4338ca',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{comm.name}</h2>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                        <span style={{ fontFamily: 'monospace' }}>{comm.id}</span>
                                        <span>•</span>
                                        <span>{comm.slug}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => exportData(comm)}
                                    title="Export Data"
                                    style={{ padding: '0.5rem', borderRadius: '9999px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#4b5563' }}
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => toggleActive(comm.id)}
                                    title={comm.isActive ? "Disable Tenant" : "Enable Tenant"}
                                    style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                        backgroundColor: comm.isActive ? '#dcfce7' : '#fee2e2',
                                        color: comm.isActive ? '#166534' : '#991b1b',
                                        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem'
                                    }}
                                >
                                    {comm.isActive ? <Check size={12} /> : <PowerOff size={12} />}
                                    {comm.isActive ? 'Active' : 'Disabled'}
                                </button>
                            </div>
                        </div>

                        {/* Branding Section (Existing) */}
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                            {/* ... keep branding content same or rely on existing ... */}
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem', fontWeight: 600 }}>Branding</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                {/* Primary Color */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Primary Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={comm.branding.primaryColor}
                                            onChange={(e) => {
                                                const newColor = e.target.value;
                                                setCommunities(communities.map(c => c.id === comm.id ? { ...c, branding: { ...c.branding, primaryColor: newColor } } : c));
                                            }}
                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{comm.branding.primaryColor}</span>
                                    </div>
                                </div>
                                {/* Secondary Color */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Secondary Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={comm.branding.secondaryColor}
                                            onChange={(e) => {
                                                const newColor = e.target.value;
                                                setCommunities(communities.map(c => c.id === comm.id ? { ...c, branding: { ...c.branding, secondaryColor: newColor } } : c));
                                            }}
                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{comm.branding.secondaryColor}</span>
                                    </div>
                                </div>
                                {/* Accent Color */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Accent Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={comm.branding.accentColor}
                                            onChange={(e) => {
                                                const newColor = e.target.value;
                                                setCommunities(communities.map(c => c.id === comm.id ? { ...c, branding: { ...c.branding, accentColor: newColor } } : c));
                                            }}
                                            style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.875rem', color: '#6b7280', fontFamily: 'monospace' }}>{comm.branding.accentColor}</span>
                                    </div>
                                </div>
                                {/* Logo URL & Upload */}
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Logo (URL or Upload)</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={comm.branding.logoUrl}
                                            onChange={(e) => {
                                                const newLogo = e.target.value;
                                                setCommunities(communities.map(c => c.id === comm.id ? { ...c, branding: { ...c.branding, logoUrl: newLogo } } : c));
                                            }}
                                            placeholder="https://..."
                                            style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontSize: '0.875rem' }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const base64 = reader.result as string;
                                                            setCommunities(communities.map(c => c.id === comm.id ? { ...c, branding: { ...c.branding, logoUrl: base64 } } : c));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                style={{ fontSize: '0.875rem' }}
                                            />
                                            {comm.branding.logoUrl && (
                                                <div style={{ width: '32px', height: '32px', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <img src={comm.branding.logoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem', fontWeight: 600 }}>Module Configuration</h3>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {Object.entries(comm.features).map(([key, enabled]) => (
                                    <label key={key} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.75rem', borderRadius: '0.5rem',
                                        border: enabled ? '1px solid #c7d2fe' : '1px solid #f3f4f6',
                                        backgroundColor: enabled ? '#eef2ff' : '#f9fafb',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="checkbox"
                                            checked={enabled}
                                            onChange={() => toggleFeature(comm.id, key as any)}
                                            style={{ width: '1.25rem', height: '1.25rem', borderRadius: '0.25rem', accentColor: '#4f46e5' }}
                                        />
                                        <span style={{ textTransform: 'capitalize', fontWeight: 500, color: enabled ? '#3730a3' : '#9ca3af' }}>{key}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => {
                                        localStorage.setItem('neighborNet_communityName', comm.name);
                                        localStorage.setItem('neighborNet_modules', JSON.stringify(comm.features));
                                        localStorage.setItem('neighborNet_customPrimary', comm.branding.primaryColor);
                                        localStorage.setItem('neighborNet_customSecondary', comm.branding.secondaryColor);
                                        localStorage.setItem('neighborNet_customAccent', comm.branding.accentColor);
                                        localStorage.setItem('neighborNet_communityLogo', comm.branding.logoUrl);

                                        alert(`Simulating login for ${comm.name}!\nPrimary: ${comm.branding.primaryColor}\nSecondary: ${comm.branding.secondaryColor}\nAccent: ${comm.branding.accentColor}`);

                                        window.location.href = '/dashboard';
                                    }}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.375rem',
                                        backgroundColor: '#fff',
                                        border: '1px solid #d1d5db',
                                        color: '#374151',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Building size={16} />
                                    Simulate Login
                                </button>
                                <button
                                    onClick={() => deleteCommunity(comm.id)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '0.375rem',
                                        backgroundColor: '#fee2e2',
                                        border: '1px solid #fecaca',
                                        color: '#b91c1c',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current Plan: <strong style={{ color: '#111827' }}>{comm.plan.replace('_', ' ').toUpperCase()}</strong></span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple Modal Implementation */}
            {showAddModal && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add New Tenant</h2>
                        <input
                            placeholder="Community Name"
                            style={{ display: 'block', width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            value={newCommunity.name}
                            onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
                        />
                        <input
                            placeholder="Slug (e.g. oak-hills)"
                            style={{ display: 'block', width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}
                            value={newCommunity.slug}
                            onChange={e => setNewCommunity({ ...newCommunity, slug: e.target.value })}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleAddCommunity} style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}>Create Tenant</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
