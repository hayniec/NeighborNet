"use client";

import styles from "@/components/dashboard/dashboard.module.css";
import { MOCK_EVENTS } from "@/lib/data";

import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";

export default function DashboardPage() {
    const { communityName } = useTheme();
    const { user } = useUser();

    // Sort events by date and take the first 3
    const upcomingEvents = [...MOCK_EVENTS]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{
                padding: '2rem',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>{communityName || 'My Community'}</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Welcome back, {user?.name || 'Neighbor'}.</p>
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
                    border: '1px solid var(--border)'
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Announcements</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>Pool Maintenance</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                                The community pool will be closed for routine maintenance on Feb 20-22.
                            </p>
                        </div>
                        <div>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>Trash Pickup Schedule</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                                Due to the holiday, trash pickup will be delayed by one day next week.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
