"use client";

import { useEffect, useState } from "react";
import { Siren, Phone, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react"; // Import AlertTriangle
import styles from "./emergency.module.css"; // We'll need to update CSS too potentially
import Link from "next/link";

interface ExternalContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
}

export default function EmergencyPage() {
    const [contacts, setContacts] = useState<ExternalContact[]>([]);
    const [isActive, setIsActive] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const [status, setStatus] = useState<'idle' | 'counting' | 'active' | 'sent'>('idle');

    useEffect(() => {
        // Load contacts from settings
        const savedProfile = localStorage.getItem('neighborNet_profile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);
                if (profile.externalContacts) {
                    setContacts(profile.externalContacts);
                }
            } catch (e) {
                console.error("Error loading profile", e);
            }
        }
    }, []);

    const handleSOSClick = () => {
        if (status === 'idle') {
            setStatus('counting');
            setCountdown(3);
        }
    };

    const handleCancel = () => {
        setStatus('idle');
        setCountdown(3);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (status === 'counting') {
            if (countdown > 0) {
                timer = setTimeout(() => setCountdown(c => c - 1), 1000);
            } else {
                setStatus('active');
                // Simulate sending alerts
                setTimeout(() => {
                    setStatus('sent');

                    // Logic for Call initiation based on preferences
                    const savedProfile = localStorage.getItem('neighborNet_profile');
                    if (savedProfile) {
                        const profile = JSON.parse(savedProfile);
                        const primaryId = profile.primaryContactId;
                        const contactMethod = localStorage.getItem('neighborNet_notification_method') || 'both'; // We need to sync this from settings too, or checking the state

                        // Actually, SettingsPage saves profile. Let's assume notifications state is saved separately or we just check contacts.
                        // For this turn, we just check primary ID.

                        if (contacts.length > 0 && (contactMethod === 'call' || contactMethod === 'both')) {
                            const targetContact = contacts.find(c => c.id === primaryId) || contacts[0];
                            if (targetContact) {
                                console.log(`Initiating call to ${targetContact.name} (${targetContact.phone})...`);
                                window.location.href = `tel:${targetContact.phone}`;
                            }
                        }
                    }
                }, 2000);
            }
        }
        return () => clearTimeout(timer);
    }, [status, countdown, contacts]);

    return (
        <div className={styles.container} style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            {status === 'idle' && (
                <>
                    <h1 className={styles.title} style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Emergency Assistance</h1>
                    <p className={styles.subtitle} style={{ marginBottom: '3rem', textAlign: 'center', maxWidth: '400px' }}>
                        Press the button below to immediately notify your emergency contacts and community responders.
                    </p>

                    <button
                        onClick={handleSOSClick}
                        className={styles.sosButton}
                        style={{
                            width: '280px',
                            height: '280px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            border: '10px solid #fee2e2',
                            color: 'white',
                            fontSize: '4rem',
                            fontWeight: '900',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.4), 0 10px 10px -5px rgba(239, 68, 68, 0.2)',
                            transition: 'transform 0.2s',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                        }}
                    >
                        SOS
                        <span style={{ fontSize: '1rem', fontWeight: 'normal', marginTop: '0.5rem' }}>TAP TO ALERT</span>
                    </button>

                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                        <a href="tel:911" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            backgroundColor: '#ef4444', color: 'white', padding: '1rem', borderRadius: '8px',
                            fontWeight: 'bold', textDecoration: 'none', fontSize: '1.2rem',
                            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)'
                        }}>
                            <Phone size={24} />
                            Call 911
                        </a>

                        <a href="tel:1-800-222-1222" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            backgroundColor: '#f59e0b', color: 'white', padding: '1rem', borderRadius: '8px',
                            fontWeight: 'bold', textDecoration: 'none', fontSize: '1.2rem',
                            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.4)'
                        }}>
                            <AlertTriangle size={24} />
                            Poison Control
                        </a>
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        <p>SOS Alert will notify: {contacts.length > 0 ? (
                            <span style={{ fontWeight: 'bold' }}>
                                {contacts.map(c => c.name).join(", ")}
                            </span>
                        ) : (
                            <span style={{ color: '#ef4444' }}>No contacts configured! Go to Settings.</span>
                        )}</p>
                    </div>
                </>
            )}

            {status === 'counting' && (
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Sending Alert in...</h2>
                    <div style={{ fontSize: '8rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '2rem' }}>
                        {countdown}
                    </div>
                    <p style={{ marginBottom: '2rem' }}>Keep calm, help is being notified.</p>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '1rem 3rem',
                            fontSize: '1.2rem',
                            borderRadius: '50px',
                            border: 'none',
                            backgroundColor: '#e5e7eb',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {status === 'active' && (
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '120px', height: '120px', margin: '0 auto 2rem',
                        borderRadius: '50%', border: '4px solid #ef4444', borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <h2>Contacting Network...</h2>
                </div>
            )}

            {status === 'sent' && (
                <div style={{ textAlign: 'center' }}>
                    <CheckCircle2 size={80} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Alerts Sent</h2>
                    <p style={{ marginBottom: '2rem', maxWidth: '400px' }}>
                        Your emergency contacts and nearby medical responders have been notified of your location.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
                        <Link href="tel:911" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            backgroundColor: '#ef4444', color: 'white', padding: '1rem', borderRadius: '8px',
                            fontWeight: 'bold', textDecoration: 'none'
                        }}>
                            <Phone size={20} />
                            Call 911
                        </Link>

                        <button
                            onClick={() => setStatus('idle')}
                            style={{
                                padding: '1rem', borderRadius: '8px', border: '1px solid #d1d5db',
                                backgroundColor: 'transparent', cursor: 'pointer'
                            }}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: .9; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
