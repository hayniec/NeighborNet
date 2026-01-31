
"use client";

import { useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UserProvider } from "@/contexts/UserContext"; // Wrap if needed, or just standard html/body
import { Shield, Plus, Settings, Check, X, Building } from "lucide-react";

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
    };
    isActive: boolean;
    branding: {
        logoUrl: string;
        primaryColor: string;
    };
};

const MOCK_COMMUNITIES: Community[] = [
    {
        id: 'c1',
        name: 'Oak Hills HOA',
        slug: 'oak-hills',
        plan: 'growth_250',
        features: { marketplace: true, resources: true, events: true, documents: true },
        isActive: true,
        branding: {
            logoUrl: 'https://cdn-icons-png.flaticon.com/512/3590/3590453.png',
            primaryColor: '#059669' // Forest green
        }
    },
    {
        id: 'c2',
        name: 'Sunset Valley',
        slug: 'sunset-valley',
        plan: 'starter_100',
        features: { marketplace: false, resources: false, events: true, documents: true },
        isActive: true,
        branding: {
            logoUrl: '',
            primaryColor: '#ea580c' // Orange
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
        features: { marketplace: true, resources: true, events: true, documents: true }
    });

    const toggleFeature = (id: string, feature: keyof Community['features']) => {
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

    const handleAddCommunity = () => {
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
                primaryColor: '#4f46e5' // Default indigo
            }
        };

        setCommunities([...communities, newComm]);
        setShowAddModal(false);
        setNewCommunity({ name: '', slug: '', plan: 'starter_100', features: { marketplace: true, resources: true, events: true, documents: true } });
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
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
                        backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
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
                            <span style={{
                                padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                                backgroundColor: comm.isActive ? '#dcfce7' : '#fee2e2',
                                color: comm.isActive ? '#166534' : '#991b1b'
                            }}>
                                {comm.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem', fontWeight: 600 }}>Branding</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Logo URL</label>
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
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', marginBottom: '1rem', fontWeight: 600 }}>Module Configuration</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
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
                            <button
                                onClick={() => {
                                    localStorage.setItem('neighborNet_communityName', comm.name);
                                    localStorage.setItem('neighborNet_modules', JSON.stringify(comm.features));
                                    localStorage.setItem('neighborNet_communityLogo', comm.branding.logoUrl);
                                    // We persist the color preference, which the ThemeContext will pick up if logic is adjusted there
                                    // For now, let's create a new key or update how ThemeContext works if needed. 
                                    // Actually, let's match the Theme structure or create a custom one.
                                    // Simpler: Just override the CSS variables for now as a 'custom' theme simulation
                                    localStorage.setItem('neighborNet_customPrimary', comm.branding.primaryColor);

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
