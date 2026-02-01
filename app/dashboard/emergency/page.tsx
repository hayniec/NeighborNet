"use client";

import { useState, useEffect } from "react";
import styles from "./emergency.module.css";
import { Phone, Heart, Zap, ShieldAlert, Siren, Flame, Info, AlertOctagon, Settings } from "lucide-react";
import { MOCK_NEIGHBORS } from "@/lib/data";
import Link from "next/link";

interface ExternalContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
}

export default function EmergencyPage() {
    const [externalContacts, setExternalContacts] = useState<ExternalContact[]>([]);
    const [medicalNeighbors, setMedicalNeighbors] = useState<typeof MOCK_NEIGHBORS>([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const savedProfile = localStorage.getItem('neighborNet_profile');
        if (savedProfile) {
            try {
                const profile = JSON.parse(savedProfile);

                // Load External Contacts
                if (profile.externalContacts && Array.isArray(profile.externalContacts)) {
                    setExternalContacts(profile.externalContacts);
                }

                // Load Selected Medical Neighbors
                // If the user has explicitly selected neighbors (array exists and has length > 0), filter by that.
                // Otherwise, fallback to showing ALL medically trained (default safety behavior).
                // Actually, if the array exists but is empty, it might mean they deselected everyone. 
                // Let's assume if the key 'selectedMedicalNeighbors' exists, we respect it.
                if (profile.selectedMedicalNeighbors) {
                    const selectedIds = profile.selectedMedicalNeighbors as string[];
                    const selected = MOCK_NEIGHBORS.filter(n => selectedIds.includes(n.id));
                    setMedicalNeighbors(selected);
                } else {
                    // Fallback to all trained if no preference saved
                    setMedicalNeighbors(MOCK_NEIGHBORS.filter(n =>
                        n.skills.some(s => ["Nurse", "Doctor", "First Aid", "CPR", "EMT", "First Aid/CPR"].some(term => s.includes(term)))
                    ));
                }
            } catch (e) {
                console.error("Failed to parse profile", e);
            }
        } else {
            // Default behavior if no profile saved yet: Show all trained neighbors, and maybe mock contacts? 
            // Better to show empty contacts to encourage setup.
            setExternalContacts([]);
            setMedicalNeighbors(MOCK_NEIGHBORS.filter(n =>
                n.skills.some(s => ["Nurse", "Doctor", "First Aid", "CPR", "EMT", "First Aid/CPR"].some(term => s.includes(term)))
            ));
        }
        setHasLoaded(true);
    }, []);

    const emergencyServices = [
        { name: "Emergency", number: "911", icon: Siren, color: "#ef4444", bg: "#fee2e2" },
        { name: "Poison Control", number: "1-800-222-1222", icon: ShieldAlert, color: "#d97706", bg: "#fef3c7" },
        { name: "Non-Emergency", number: "311", icon: Info, color: "#3b82f6", bg: "#dbeafe" },
    ];

    if (!hasLoaded) return null; // Prevent hydration mismatch or flash

    return (
        <div className={styles.container}>
            {/* SOS Hero */}
            <div className={styles.sosCard}>
                <div className={styles.sosHeader}>
                    <AlertOctagon size={48} />
                    <div className={styles.sosTitle}>Emergency SOS</div>
                </div>
                <div className={styles.sosButtonContainer}>
                    <button className={styles.sosButton} onClick={() => alert("Simulating SOS: Alert sent to neighbors and emergency contacts!")}>
                        SOS
                    </button>
                    <span className={styles.sosHint}>Tap to Alert Network</span>
                </div>
                <div className={styles.sosDescription}>
                    Pressing this button will instantly notify your designated emergency contacts and nearby neighbors listed as first responders.
                </div>
            </div>

            {/* Your Emergency Contacts */}
            <div className={styles.section}>
                <div className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Phone size={18} />
                        Your Emergency Contacts
                    </div>
                    <Link href="/dashboard/settings" className={styles.settingsLink} style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                        <Settings size={14} /> Manage
                    </Link>
                </div>

                {externalContacts.length > 0 ? (
                    <div className={styles.grid}>
                        {externalContacts.map(contact => (
                            <div key={contact.id} className={styles.card}>
                                <div className={styles.contactInfo}>
                                    <span className={styles.contactName}>{contact.name}</span>
                                    <span className={styles.contactRole}>{contact.relationship}</span>
                                </div>
                                <a href={`tel:${contact.phone}`} className={styles.callButton}>
                                    <Phone size={14} />
                                    Call
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--muted)', borderRadius: '1rem', color: 'var(--muted-foreground)' }}>
                        <p>No external contacts set.</p>
                        <Link href="/dashboard/settings" style={{ color: 'var(--primary)', fontWeight: 500 }}>Add contacts in Settings</Link>
                    </div>
                )}
            </div>

            {/* Neighbors with Medical Training */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Heart size={18} color="#ef4444" />
                    <span style={{ color: '#ef4444' }}>Neighbors with Medical Training</span>
                </div>
                {medicalNeighbors.length > 0 ? (
                    <div className={styles.grid}>
                        {medicalNeighbors.map(neighbor => (
                            <div key={neighbor.id} className={styles.card} style={{ borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: '#fff5f5' }}>
                                <div className={styles.contactInfo}>
                                    <span className={styles.contactName}>{neighbor.name}</span>
                                    <span className={styles.contactRole}>
                                        {neighbor.skills.find(s => ["Nurse", "Doctor", "First Aid", "CPR", "EMT", "First Aid/CPR"].some(term => s.includes(term)))}
                                    </span>
                                </div>
                                <a href={`tel:${neighbor.id}`} className={styles.callButton} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                                    <Phone size={14} />
                                    Alert
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No medical neighbors found or selected.</p>
                )}
            </div>

            {/* Local Services */}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    Local Emergency Services
                </div>
                <div className={styles.grid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                    {emergencyServices.map(service => (
                        <a key={service.name} href={`tel:${service.number}`} className={styles.serviceButton}>
                            <div className={styles.serviceIcon} style={{ backgroundColor: service.bg, color: service.color }}>
                                <service.icon size={24} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div className={styles.serviceName}>{service.name}</div>
                                <div className={styles.serviceNumber}>{service.number}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
