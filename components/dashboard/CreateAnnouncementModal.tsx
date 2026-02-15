
"use client";

import { useState } from "react";
// Using inline styles for simplicity as per user request to avoid lint errors from previous files being messy, 
// but user also wants "Rich Aesthetics" so using CSS modules is better if available.
// However, the previous modal used Modal.module.css. I'll use that.
// I need check if Modal.module.css is available. Yes, likely at components/dashboard/Modal.module.css.
import styles from "./Modal.module.css"; // Relative from components/dashboard/
import { X } from "lucide-react";

interface CreateAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { title: string; content: string }) => void;
}

export function CreateAnnouncementModal({ isOpen, onClose, onCreate }: CreateAnnouncementModalProps) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        onCreate({ title, content });
        setTitle("");
        setContent("");
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'var(--card)',
                padding: '2rem',
                borderRadius: 'var(--radius)',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>New Announcement</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Title</label>
                        <input
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'calc(var(--radius) - 2px)',
                                border: '1px solid var(--border)',
                                background: 'var(--background)',
                                color: 'var(--foreground)'
                            }}
                            placeholder="e.g. Pool Maintenance"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Content</label>
                        <textarea
                            style={{
                                padding: '0.5rem',
                                borderRadius: 'calc(var(--radius) - 2px)',
                                border: '1px solid var(--border)',
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                            placeholder="Details about the announcement..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'calc(var(--radius) - 2px)',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim() || !content.trim()}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: 'calc(var(--radius) - 2px)',
                                border: 'none',
                                background: 'var(--primary)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                opacity: (!title.trim() || !content.trim()) ? 0.5 : 1
                            }}
                        >
                            Post Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
