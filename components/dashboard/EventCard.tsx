"use client";

import { Event } from "@/types/event";
import styles from "../../app/dashboard/events/events.module.css";
import { Clock, MapPin, Users } from "lucide-react";

interface EventCardProps {
    event: Event;
    onRsvp: (event: Event) => void;
    onDelete?: (eventId: string) => void;
}

export function EventCard({ event, onRsvp, onDelete }: EventCardProps) {
    const dateObj = new Date(event.date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();

    // Helper for category color
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Social': return { bg: '#fce7f3', color: '#db2777' };
            case 'HOA': return { bg: '#e0e7ff', color: '#4f46e5' };
            case 'Maintenance': return { bg: '#fef3c7', color: '#d97706' };
            case 'Security': return { bg: '#fee2e2', color: '#dc2626' };
            default: return { bg: '#f3f4f6', color: '#4b5563' };
        }
    };

    const catStyle = getCategoryColor(event.category);

    return (
        <div className={styles.card}>
            <div className={styles.cardHeader} style={{
                background: `linear-gradient(to bottom, ${catStyle.bg}, var(--card))`,
                height: '6rem',
                position: 'relative'
            }}>
                <div className={styles.dateBadge}>
                    <span className={styles.month}>{month}</span>
                    <span className={styles.day}>{day}</span>
                </div>
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: 'rgba(255,255,255,0.8)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#dc2626'
                        }}
                        title="Delete Event"
                    >
                        &times;
                    </button>
                )}
            </div>

            <div className={styles.cardContent}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '-0.5rem' }}>
                    <span className={styles.categoryTag} style={{ backgroundColor: catStyle.bg, color: catStyle.color }}>
                        {event.category}
                    </span>
                </div>
                <h3 className={styles.eventTitle}>{event.title}</h3>

                <div className={styles.metaRow}>
                    <Clock size={16} />
                    <span>{event.time}</span>
                </div>

                <div className={styles.metaRow}>
                    <MapPin size={16} />
                    <span>{event.location}</span>
                </div>

                <p className={styles.description}>{event.description}</p>
            </div>

            <div className={styles.footer}>
                <div className={styles.attendees}>
                    <Users size={16} style={{ marginRight: 6 }} />
                    {event.attendees} {event.attendees === 1 ? 'going' : 'going'}
                    {event.userRsvp && event.userRsvp > 0 && (
                        <span style={{ marginLeft: 4, color: 'var(--primary)', fontSize: '0.75rem' }}>
                            (You: {event.userRsvp})
                        </span>
                    )}
                </div>
                <button
                    className={styles.joinButton}
                    onClick={() => onRsvp(event)}
                    style={event.userRsvp && event.userRsvp > 0 ? { backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : {}}
                >
                    {event.userRsvp && event.userRsvp > 0 ? 'Edit RSVP' : 'RSVP'}
                </button>
            </div>
        </div>
    );
}
