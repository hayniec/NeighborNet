"use client";

import { useState, useEffect } from "react";
import { EventCard } from "@/components/dashboard/EventCard";
import { CreateEventModal } from "@/components/dashboard/CreateEventModal";
import { RsvpModal } from "@/components/dashboard/RsvpModal";
import styles from "./events.module.css";
import { Plus } from "lucide-react";
import { Event } from "@/types/event";
import { useUser } from "@/contexts/UserContext";
import { getCommunityEvents, createEvent, deleteEvent, updateRsvp } from "@/app/actions/events";

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
                const result = await getCommunityEvents(user.communityId, user.id);
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
    }, [user.communityId, user.id]);

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

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const result = await deleteEvent(eventId, user.id || "");
            if (result.success) {
                setEvents(prev => prev.filter(e => e.id !== eventId));
            } else {
                alert("Failed to delete event: " + result.error);
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("An error occurred while deleting.");
        }
    };

    const handleRsvpClick = (event: Event) => {
        setSelectedEventId(event.id);
        setIsRsvpModalOpen(true);
    };

    const handleRsvpConfirm = async (count: number) => {
        if (!selectedEventId) return;
        const eventId = selectedEventId;

        setEvents(events.map(ev => {
            if (ev.id === selectedEventId) {
                // Determine logic: 
                // If previous userRsvp was > 0, we subtract it and add new count.
                // If count is 0, we subtract previous.
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

        try {
            await updateRsvp(eventId, user.id || "", count);
        } catch (error) {
            console.error("RSVP update failed:", error);
            alert("Failed to update RSVP");
        }
    };

    // Check for any leadership role
    const userRole = user.role?.toLowerCase() || '';
    const canManageEvents = [
        'admin',
        'super admin',
        'event manager',
        'board member',
        'hoa officer',
        'president',
        'vice president',
        'secretary',
        'treasurer'
    ].includes(userRole);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Community Events</h1>
                    <p className={styles.subtitle}>
                        Stay up to date with HOA meetings, social gatherings, and maintenance schedules.
                    </p>
                </div>
                {canManageEvents && (
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
                )}
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
                            onDelete={canManageEvents ? handleDeleteEvent : undefined}
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
