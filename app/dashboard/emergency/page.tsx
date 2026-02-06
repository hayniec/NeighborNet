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
        <div className={`${styles.container} ${styles.pageContainer}`}>

            {status === 'idle' && (
                <>
                    <h1 className={styles.mainTitle}>Emergency Assistance</h1>
                    <p className={styles.subtitle}>
                        Press the button below to immediately notify your emergency contacts and community responders.
                    </p>

                    <button
                        onClick={handleSOSClick}
                        className={styles.sosButtonBig}
                    >
                        SOS
                        <span className={styles.sosButtonText}>TAP TO ALERT</span>
                    </button>

                    <div className={styles.quickLinks}>
                        <a href="tel:911" className={styles.call911}>
                            <Phone size={24} />
                            Call 911
                        </a>

                        <a href="tel:1-800-222-1222" className={styles.callPoison}>
                            <AlertTriangle size={24} />
                            Poison Control
                        </a>
                    </div>

                    <div className={styles.notifyList}>
                        <p>SOS Alert will notify: {contacts.length > 0 ? (
                            <span className={styles.boldText}>
                                {contacts.map(c => c.name).join(", ")}
                            </span>
                        ) : (
                            <span className={styles.errorText}>No contacts configured! Go to Settings.</span>
                        )}</p>
                    </div>
                </>
            )}

            {status === 'counting' && (
                <div className={styles.countingSection}>
                    <h2 className={styles.countingTitle}>Sending Alert in...</h2>
                    <div className={styles.countDownNumber}>
                        {countdown}
                    </div>
                    <p className={styles.calmText}>Keep calm, help is being notified.</p>
                    <button
                        onClick={handleCancel}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {status === 'active' && (
                <div className={styles.spinnerContainer}>
                    <div className={styles.spinner} />
                    <h2>Contacting Network...</h2>
                </div>
            )}

            {status === 'sent' && (
                <div className={styles.sentSection}>
                    <CheckCircle2 size={80} color="#10b981" className={styles.checkIcon} />
                    <h2 className={styles.sentTitle}>Alerts Sent</h2>
                    <p className={styles.sentDescription}>
                        Your emergency contacts and nearby medical responders have been notified of your location.
                    </p>

                    <div className={styles.quickLinks}>
                        <Link href="tel:911" className={styles.call911}>
                            <Phone size={20} />
                            Call 911
                        </Link>

                        <button
                            onClick={() => setStatus('idle')}
                            className={styles.resetButton}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}
