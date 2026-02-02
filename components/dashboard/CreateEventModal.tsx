"use client";

import { useState } from "react";
import styles from "./Modal.module.css";
import { X } from "lucide-react";

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (eventData: any) => void;
}

export function CreateEventModal({ isOpen, onClose, onCreate }: CreateEventModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        category: "Social",
        date: "",
        time: "",
        location: "",
        description: ""
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.title || !formData.date || !formData.time || !formData.location) return;
        onCreate(formData);
        // Reset form
        setFormData({
            title: "",
            category: "Social",
            date: "",
            time: "",
            location: "",
            description: ""
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.title}>Create New Event</h3>
                    <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--muted-foreground)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Event Title</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. Summer BBQ"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.field}>
                        <label className={styles.label}>Date</label>
                        <input
                            type="date"
                            className={styles.input}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Time</label>
                        <input
                            type="time"
                            className={styles.input}
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Location</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. Community Center or 123 Maple Dr"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <select
                        className={styles.select}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Social">Social</option>
                        <option value="HOA">HOA</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Security">Security</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Description</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="Details about the event..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.secondaryButton}`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className={`${styles.button} ${styles.primaryButton}`}
                        onClick={handleSubmit}
                        disabled={!formData.title || !formData.date || !formData.time || !formData.location}
                        style={{ opacity: (!formData.title || !formData.date || !formData.time || !formData.location) ? 0.5 : 1 }}
                    >
                        Create Event
                    </button>
                </div>
            </div>
        </div>
    );
}
