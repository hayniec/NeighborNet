"use client";

import { useState, useEffect } from "react";
import styles from "@/components/dashboard/dashboard.module.css";
import hoaStyles from "../hoa/hoa.module.css";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getCommunityEvents } from "@/app/actions/events";
import { getCommunityAnnouncements, createAnnouncement, deleteAnnouncement } from "@/app/actions/announcements";
import { getCommunityDocuments, createDocument } from "@/app/actions/documents";
import { getCommunityOfficers } from "@/app/actions/neighbors";
import { getCommunityById } from "@/app/actions/communities";
import { Event } from "@/types/event";
import { Plus, Trash2, Megaphone, FileText, Download, Upload, Mail, Phone, MapPin, MessageSquare, X, ChevronDown } from "lucide-react";
import { CreateAnnouncementModal } from "@/components/dashboard/CreateAnnouncementModal";
import { UploadDocumentModal } from "@/components/dashboard/UploadDocumentModal";
import { ContactOfficerModal } from "@/components/dashboard/ContactOfficerModal";

interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    activateAt?: string;
    expiresAt?: string;
    authorName?: string;
}

interface HoaDocument {
    id: string;
    name: string;
    category: string;
    uploadDate: string;
    size: string;
    url: string;
    uploaderName: string;
}

interface Officer {
    id: string;
    name: string;
    role: string;
    hoaPosition: string | null;
    email: string;
    avatar?: string;
}

type CommunityTab = 'info' | 'rules' | 'services' | 'documents';

export default function DashboardPage() {
    const { communityName } = useTheme();
    const { user } = useUser();
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

    // Community Info Tab State
    const [activeTab, setActiveTab] = useState<CommunityTab>('info');
    const [documents, setDocuments] = useState<HoaDocument[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [isLoadingOfficers, setIsLoadingOfficers] = useState(true);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [hoaSettings, setHoaSettings] = useState<{ duesAmount: string | null; duesFrequency: string | null; duesDate: string | null; contactEmail: string | null } | null>(null);
    const [isBoardContactOpen, setIsBoardContactOpen] = useState(false);
    const [dbCommunityName, setDbCommunityName] = useState<string>("Community HOA");
    const [extendedSettings, setExtendedSettings] = useState<any>(null);

    const isAdmin = user?.role === 'admin' || user?.role === 'board member';
    const canUpload = isAdmin;

    // Fallback data for amenities, rules, and vendors
    const defaultAmenities = [
        { icon: "🏊", name: "Community Pool", hours: "6 AM - 10 PM Daily", season: "Memorial Day - Labor Day", note: "Pool key required. Contact board for access." },
        { icon: "🏛️", name: "Clubhouse", hours: "8 AM - 9 PM", capacity: "50 people", note: "Reservation required. $50 deposit for events." },
        { icon: "🎾", name: "Tennis Courts", hours: "Dawn to Dusk", courts: "2 available", note: "First come, first served. 1-hour limit when others waiting." },
        { icon: "🏋️", name: "Fitness Center", hours: "24/7 Access", equipment: "Cardio & Weights", note: "Access code required. See board for details." }
    ];

    const defaultRules = [
        { category: "Property Maintenance", icon: "🏡", items: ["Lawns must be mowed regularly and kept free of weeds", "Exterior paint colors must be approved by Architectural Committee", "Holiday decorations may be displayed 30 days before and after holidays", "Trash bins must be stored out of sight except on collection days"] },
        { category: "Parking & Vehicles", icon: "🚗", items: ["No parking on streets overnight (11 PM - 6 AM)", "Guest parking available in designated areas", "RVs and boats must be stored in garages or approved storage areas", "Vehicle repairs in driveways limited to minor maintenance"] },
        { category: "Pets", icon: "🐕", items: ["Maximum of 2 pets per household", "Dogs must be leashed in common areas", "Owners must clean up after pets immediately", "Excessive barking or aggressive behavior must be addressed"] },
        { category: "Noise & Nuisance", icon: "🔇", items: ["Quiet hours: 10 PM - 7 AM on weekdays, 11 PM - 8 AM on weekends", "Construction and lawn work: 8 AM - 6 PM only", "Notify neighbors 48 hours before hosting large gatherings"] }
    ];

    const defaultVendors = [
        { type: "Landscaping", icon: "🌿", company: "GreenScape Services", services: "Common area maintenance, irrigation", schedule: "Tuesdays & Fridays", contact: "(555) 123-4567" },
        { type: "Pool Maintenance", icon: "🏊", company: "Crystal Clear Pools", services: "Cleaning, chemical balance, repairs", schedule: "Mondays & Thursdays", contact: "(555) 234-5678" },
        { type: "Security", icon: "🔒", company: "SafeGuard Security", services: "Patrol, gate monitoring, emergency response", schedule: "24/7 Coverage", emergency: "(555) 911-0000" },
        { type: "Property Management", icon: "🏢", company: "Premier HOA Management", services: "Financial, compliance, maintenance coordination", hours: "Mon-Fri 9 AM - 5 PM", contact: "(555) 345-6789", email: "info@premierhoa.com" }
    ];

    useEffect(() => {
        const fetchEvents = async () => {
            if (user?.communityId) {
                const res = await getCommunityEvents(user.communityId);
                if (res.success && res.data) {
                    // Sort by date ascending for "Upcoming"
                    const sorted = res.data
                        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 3);
                    setUpcomingEvents(sorted);
                }
            }
        };
        fetchEvents();
    }, [user?.communityId]);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            if (user?.communityId) {
                setIsLoadingAnnouncements(true);
                // Pass user.id so backend can return expired/future items for admins
                const res = await getCommunityAnnouncements(user.communityId, user.id);
                if (res.success && res.data) {
                    setAnnouncements(res.data);
                }
                setIsLoadingAnnouncements(false);
            }
        };
        fetchAnnouncements();
    }, [user?.communityId, user?.id]);

    useEffect(() => {
        if (user?.communityId) {
            fetchOfficers();
            fetchDocuments();
            fetchCommunitySettings();
        }
    }, [user?.communityId]);

    const fetchCommunitySettings = async () => {
        if (!user?.communityId) return;
        console.log("[Dashboard] Fetching community settings for:", user.communityId);
        try {
            const res = await getCommunityById(user.communityId);
            console.log("[Dashboard] getCommunityById response:", res);
            if (res.success && res.data) {
                const current = res.data;
                console.log("[Dashboard] Community data:", current);
                // Set community name
                setDbCommunityName(current.name || "Community HOA");

                // Set basic HOA settings
                if (current.hoaSettings) {
                    console.log("[Dashboard] Setting HOA settings:", current.hoaSettings);
                    setHoaSettings(current.hoaSettings);
                } else {
                    console.warn("[Dashboard] No hoaSettings found in response");
                }

                // Set extended settings (amenities, rules, vendors)
                if (current.hoaExtendedSettings) {
                    setExtendedSettings(current.hoaExtendedSettings);
                }
            } else {
                console.warn("[Dashboard] Failed to fetch community:", res.error);
            }
        } catch (e) {
            console.error("[Dashboard] Error fetching community:", e);
        }
    };

    const fetchOfficers = async () => {
        if (!user?.communityId) return;
        try {
            setIsLoadingOfficers(true);
            const res = await getCommunityOfficers(user.communityId);
            if (res.success && res.data) {
                setOfficers(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingOfficers(false);
        }
    };

    const fetchDocuments = async () => {
        if (!user?.communityId) return;
        try {
            setIsLoadingDocs(true);
            const res = await getCommunityDocuments(user.communityId);
            if (res.success && res.data) {
                setDocuments(res.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    // Fetch community settings on mount and when communityId changes
    useEffect(() => {
        if (user?.communityId) {
            fetchCommunitySettings();
            fetchOfficers();
            fetchDocuments();
        }
    }, [user?.communityId]);

    const handleCreateAnnouncement = async (data: { title: string; content: string; activateAt: string; expiresAt: string }) => {
        if (!user?.communityId || !user?.id) return;

        const res = await createAnnouncement({
            communityId: user.communityId,
            title: data.title,
            content: data.content,
            userId: user.id,
            activateAt: data.activateAt || undefined,
            expiresAt: data.expiresAt || undefined
        });

        if (res.success && res.data) {
            setAnnouncements([res.data, ...announcements]);
            setIsAnnouncementModalOpen(false);
        } else {
            alert("Failed to create announcement: " + res.error);
        }
    };

    const handleDeleteAnnouncement = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return;
        if (!user?.id) return;

        const res = await deleteAnnouncement(id, user.id);
        if (res.success) {
            setAnnouncements(announcements.filter(a => a.id !== id));
        } else {
            alert("Failed to delete: " + res.error);
        }
    };

    const handleUploadDocument = async (data: { name: string; category: string; url: string; size: string }) => {
        if (!user?.communityId || !user?.id) return;

        const res = await createDocument({
            communityId: user.communityId,
            name: data.name,
            category: data.category,
            filePath: data.url, // Map url to filePath for the action
            uploadedBy: user.id
        });

        if (res.success && res.data) {
            setDocuments([res.data, ...documents]);
            setIsUploadModalOpen(false);
        } else {
            alert("Failed to upload document: " + res.error);
        }
    };

    const handleContactOfficer = (officer: Officer) => {
        setSelectedOfficer(officer);
        setIsContactModalOpen(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
                padding: '2rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Welcome back, {user?.name ? user.name.split(' ')[0] : 'Neighbor'}.</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Here's what's happening in {communityName || 'your community'}.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Upcoming Events Widget */}
                <div style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Upcoming Events</h3>
                        <a href="/dashboard/events" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>View All</a>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {upcomingEvents.map(event => {
                            const dateObj = new Date(event.date);
                            const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                            const day = dateObj.getDate();

                            return (
                                <div key={event.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        background: 'var(--muted)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: 1
                                    }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted-foreground)' }}>{month}</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{day}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{event.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{event.time} • {event.location}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {upcomingEvents.length === 0 && (
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>No upcoming events.</p>
                        )}
                    </div>
                </div>

                {/* Announcements Widget */}
                <div style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius)',
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Megaphone size={18} />
                            Announcements
                        </h3>
                        {isAdmin && (
                            <button
                                onClick={() => setIsAnnouncementModalOpen(true)}
                                style={{
                                    fontSize: '0.85rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--secondary)',
                                    color: 'var(--foreground)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <Plus size={14} /> Add
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        {announcements.map(announcement => {
                            const now = new Date();
                            const isFuture = announcement.activateAt && new Date(announcement.activateAt) > now;
                            const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < now;

                            return (
                                <div key={announcement.id} style={{
                                    paddingBottom: '1rem',
                                    borderBottom: '1px solid var(--border)',
                                    position: 'relative',
                                    opacity: (isFuture || isExpired) ? 0.6 : 1
                                }}>
                                    {(isFuture || isExpired) && (
                                        <div style={{
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            marginBottom: '0.25rem',
                                            color: isExpired ? 'var(--destructive)' : 'var(--warning)',
                                            textTransform: 'uppercase'
                                        }}>
                                            {isExpired ? 'Expired' : `Scheduled: ${new Date(announcement.activateAt!).toLocaleDateString()}`}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{announcement.title}</div>
                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteAnnouncement(announcement.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--muted-foreground)',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    opacity: 0.6
                                                }}
                                                title="Delete Announcement"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                        {announcement.content}
                                    </p>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginTop: '0.5rem', opacity: 0.8 }}>
                                        Posted {new Date(announcement.createdAt).toLocaleDateString()}
                                        {announcement.expiresAt && !isExpired && (
                                            <span style={{ marginLeft: '0.5rem' }}>• Expires {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {!isLoadingAnnouncements && announcements.length === 0 && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', padding: '2rem 0' }}>
                                <p style={{ fontSize: '0.9rem' }}>No announcements yet.</p>
                            </div>
                        )}

                        {isLoadingAnnouncements && (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Community Information Section with Tabs */}
            <div style={{
                padding: '2rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Community Information</h2>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    borderBottom: '2px solid var(--border)',
                    marginBottom: '2rem',
                    flexWrap: 'wrap'
                }}>
                    {[
                        { id: 'info' as CommunityTab, label: 'Community Info' },
                        { id: 'rules' as CommunityTab, label: 'Rules & Guidelines' },
                        { id: 'services' as CommunityTab, label: 'Service Providers' },
                        { id: 'documents' as CommunityTab, label: 'Documents' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab.id ? 600 : 400,
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                                marginBottom: '-2px',
                                transition: 'all 0.2s',
                                fontSize: '0.95rem'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {/* Community Info Tab */}
                    {activeTab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Contact & Dues Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                <div style={{
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius)',
                                    backgroundColor: 'var(--muted)',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>Contact</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                                        <Mail size={18} />
                                        {hoaSettings?.contactEmail || 'Contact board members below'}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', borderRadius: 'var(--radius)', backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>HOA Dues</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                        {hoaSettings?.duesAmount && hoaSettings.duesAmount !== 'null' && hoaSettings.duesAmount !== '' ? `$${hoaSettings.duesAmount}` : 'Not set'}
                                        {hoaSettings?.duesAmount && hoaSettings.duesAmount !== 'null' && hoaSettings.duesAmount !== '' && hoaSettings?.duesFrequency && <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--muted-foreground)' }}> / {hoaSettings.duesFrequency}</span>}
                                    </div>
                                    {hoaSettings?.duesDate && hoaSettings.duesAmount && hoaSettings.duesAmount !== 'null' && hoaSettings.duesAmount !== '' && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                            Due on the {hoaSettings.duesDate}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Board Officers */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Board Members</h3>
                                {isLoadingOfficers ? (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading officers...</div>
                                ) : officers.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {officers.map(officer => (
                                            <div key={officer.id} style={{
                                                padding: '1.25rem',
                                                borderRadius: 'var(--radius)',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'var(--card)'
                                            }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{officer.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>
                                                    {officer.hoaPosition || officer.role}
                                                </div>
                                                <button
                                                    onClick={() => handleContactOfficer(officer)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: 'var(--radius)',
                                                        border: '1px solid var(--border)',
                                                        background: 'var(--secondary)',
                                                        color: 'var(--foreground)',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        width: '100%',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <MessageSquare size={16} />
                                                    Contact
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                        No board members listed yet.
                                    </div>
                                )}
                            </div>

                            {/* Community Amenities */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Community Amenities</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {(extendedSettings?.amenities || defaultAmenities).map((amenity: any, index: number) => (
                                        <div key={index} style={{
                                            padding: '1.25rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--card)'
                                        }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{amenity.icon}</div>
                                            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{amenity.name}</h4>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                                                {amenity.hours && <div><strong>Hours:</strong> {amenity.hours}</div>}
                                                {amenity.season && <div><strong>Season:</strong> {amenity.season}</div>}
                                                {amenity.capacity && <div><strong>Capacity:</strong> {amenity.capacity}</div>}
                                                {amenity.courts && <div><strong>Courts:</strong> {amenity.courts}</div>}
                                                {amenity.equipment && <div><strong>Equipment:</strong> {amenity.equipment}</div>}
                                            </div>
                                            {amenity.note && (
                                                <div style={{
                                                    marginTop: '0.75rem',
                                                    padding: '0.5rem',
                                                    backgroundColor: 'var(--muted)',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--muted-foreground)'
                                                }}>
                                                    {amenity.note}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Rules Tab */}
                    {activeTab === 'rules' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {(extendedSettings?.rules || defaultRules).map((ruleCategory: any, index: number) => (
                                <div key={index} style={{
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--card)'
                                }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{ruleCategory.icon}</span>
                                        {ruleCategory.category}
                                    </h3>
                                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {ruleCategory.items.map((item: string, itemIndex: number) => (
                                            <li key={itemIndex} style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                            <div style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius)',
                                backgroundColor: 'var(--muted)',
                                fontSize: '0.9rem',
                                color: 'var(--muted-foreground)',
                                textAlign: 'center'
                            }}>
                                📄 <strong>Full CC&Rs and Bylaws available in Documents tab</strong>
                                <br />
                                Violations may result in fines. Contact the board with questions or to report violations.
                            </div>
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                            {(extendedSettings?.vendors || defaultVendors).map((vendor: any, index: number) => (
                                <div key={index} style={{
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--card)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '2.5rem' }}>{vendor.icon}</div>
                                        <div>
                                            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{vendor.type}</h3>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>{vendor.company}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
                                        {vendor.services && <div><strong>Services:</strong> {vendor.services}</div>}
                                        {vendor.schedule && <div><strong>Schedule:</strong> {vendor.schedule}</div>}
                                        {vendor.hours && <div><strong>Office Hours:</strong> {vendor.hours}</div>}
                                        {vendor.contact && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <Phone size={14} />
                                                {vendor.contact}
                                            </div>
                                        )}
                                        {vendor.emergency && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--destructive)' }}>
                                                <Phone size={14} />
                                                <strong>Emergency:</strong> {vendor.emergency}
                                            </div>
                                        )}
                                        {vendor.email && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                <Mail size={14} />
                                                {vendor.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div>
                            {canUpload && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <button
                                        onClick={() => setIsUploadModalOpen(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            fontWeight: 500
                                        }}
                                    >
                                        <Upload size={18} />
                                        Upload Document
                                    </button>
                                </div>
                            )}

                            {isLoadingDocs ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    Loading documents...
                                </div>
                            ) : documents.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {documents.map(doc => (
                                        <div key={doc.id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1rem 1.25rem',
                                            borderRadius: 'var(--radius)',
                                            border: '1px solid var(--border)',
                                            backgroundColor: 'var(--card)',
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                <FileText size={20} style={{ color: 'var(--primary)' }} />
                                                <div>
                                                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{doc.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                                        {doc.category} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                                                        {doc.uploaderName && ` by ${doc.uploaderName}`}
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: 'var(--radius)',
                                                    border: '1px solid var(--border)',
                                                    background: 'var(--secondary)',
                                                    color: 'var(--foreground)',
                                                    textDecoration: 'none',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Download size={16} />
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '3rem',
                                    textAlign: 'center',
                                    color: 'var(--muted-foreground)',
                                    border: '2px dashed var(--border)',
                                    borderRadius: 'var(--radius)'
                                }}>
                                    <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                    <p>No documents uploaded yet.</p>
                                    {canUpload && <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Click "Upload Document" to add files.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <CreateAnnouncementModal
                isOpen={isAnnouncementModalOpen}
                onClose={() => setIsAnnouncementModalOpen(false)}
                onCreate={handleCreateAnnouncement}
            />

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUploadDocument}
            />

            {selectedOfficer && (
                <ContactOfficerModal
                    isOpen={isContactModalOpen}
                    onClose={() => {
                        setIsContactModalOpen(false);
                        setSelectedOfficer(null);
                    }}
                    officer={{
                        name: selectedOfficer.name,
                        email: selectedOfficer.email,
                        position: selectedOfficer.hoaPosition || selectedOfficer.role
                    }}
                    sender={{
                        name: user?.name || 'Resident',
                        email: user?.email || ''
                    }}
                />
            )}
        </div>
    );
}
