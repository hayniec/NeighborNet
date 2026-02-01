"use client";

import { useState, useEffect } from "react";
import { EventCard } from "@/components/dashboard/EventCard";
import { CreateEventModal } from "@/components/dashboard/CreateEventModal";
import { RsvpModal } from "@/components/dashboard/RsvpModal";
import styles from "./events.module.css";
import { Plus } from "lucide-react";
import { Event } from "@/types/event";
import { useUser } from "@/contexts/UserContext";
import { getCommunityEvents, createEvent } from "@/app/actions/events";

export default function EventsPage() {
    const { user } = useUser();
    const [events, setEvents] = useState<Event[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // RSVP State
    const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user.communityId) {
                setIsLoading(false);
                return;
            }
            try {
                const result = await getCommunityEvents(user.communityId);
                if (result.success && result.data) {
                    setEvents(result.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, [user.communityId]);

    // Sorting
    const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const handleCreateEvent = async (newEventData: any) => {
        if (!user.communityId) {
            alert("Error: No community ID found.");
            return;
        }

        try {
            const result = await createEvent({
                communityId: user.communityId,
                organizerId: user.id || "",
                title: newEventData.title,
                description: newEventData.description,
                date: newEventData.date,
                time: newEventData.time,
                location: newEventData.location,
                category: newEventData.category
            });

            if (result.success && result.data) {
                setEvents(prev => [...prev, result.data]);
                setIsCreateModalOpen(false);
            } else {
                alert("Failed to create event: " + result.error);
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        }
    };

    const handleRsvpClick = (event: Event) => {
        setSelectedEventId(event.id);
        setIsRsvpModalOpen(true);
    };

    const handleRsvpConfirm = (count: number) => {
        if (!selectedEventId) return;

        setEvents(events.map(ev => {
            if (ev.id === selectedEventId) {
                const previousUserRsvp = ev.userRsvp || 0;
                const newTotal = ev.attendees - previousUserRsvp + count;
                return {
                    ...ev,
                    attendees: newTotal,
                    userRsvp: count
                };
            }
            return ev;
        }));

        setIsRsvpModalOpen(false);
        setSelectedEventId(null);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Community Events</h1>
                    <p className={styles.subtitle}>
                        Stay up to date with HOA meetings, social gatherings, and maintenance schedules.
                    </p>
                </div>
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                        border: 'none',
                        padding: '0.75rem 1.25rem',
                        borderRadius: 'var(--radius)',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={20} />
                    Create Event
                </button>
            </div>

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading events...</div>
            ) : (
                <div className={styles.grid}>
                    {sortedEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onRsvp={handleRsvpClick}
                        />
                    ))}
                    {sortedEvents.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            No upcoming events.
                        </div>
                    )}
                </div>
            )}

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateEvent}
            />

            <RsvpModal
                isOpen={isRsvpModalOpen}
                onClose={() => setIsRsvpModalOpen(false)}
                onConfirm={handleRsvpConfirm}
                eventTitle={events.find(e => e.id === selectedEventId)?.title || ''}
                currentRsvp={events.find(e => e.id === selectedEventId)?.userRsvp}
            />
        </div>
    );
}
