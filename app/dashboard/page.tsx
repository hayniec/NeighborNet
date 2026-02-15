"use client";

import { useState, useEffect } from "react";
import styles from "@/components/dashboard/dashboard.module.css";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { getCommunityEvents } from "@/app/actions/events";
import { getCommunityAnnouncements, createAnnouncement, deleteAnnouncement } from "@/app/actions/announcements";
import { Event } from "@/types/event";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { CreateAnnouncementModal } from "@/components/dashboard/CreateAnnouncementModal";

interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorName?: string;
}

export default function DashboardPage() {
    const { communityName } = useTheme();
    const { user } = useUser();
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
    const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);

    const isAdmin = user?.role === 'admin' || user?.role === 'board member';

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
                const res = await getCommunityAnnouncements(user.communityId);
                if (res.success && res.data) {
                    setAnnouncements(res.data);
                }
                setIsLoadingAnnouncements(false);
            }
        };
        fetchAnnouncements();
    }, [user?.communityId]);

    const handleCreateAnnouncement = async (data: { title: string; content: string }) => {
        if (!user?.communityId || !user?.id) return;

        const res = await createAnnouncement({
            communityId: user.communityId,
            title: data.title,
            content: data.content,
            userId: user.id
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
                        {announcements.map(announcement => (
                            <div key={announcement.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', position: 'relative' }}>
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
                                </div>
                            </div>
                        ))}

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

            <CreateAnnouncementModal
                isOpen={isAnnouncementModalOpen}
                onClose={() => setIsAnnouncementModalOpen(false)}
                onCreate={handleCreateAnnouncement}
            />
        </div>
    );
}
