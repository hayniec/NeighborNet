"use client";

import { useState, useEffect } from "react";
import styles from "./settings.module.css";
import { User, Bell, Wrench, X, Save, Stethoscope, Phone, Plus, Trash2, Palette, Key, Moon, Sun, Monitor, Laptop, Smartphone } from "lucide-react";
import { MOCK_NEIGHBORS } from "@/lib/data";
import { useTheme, THEMES } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";

// ... (Rest of existing interfaces: EquipmentItem, ExternalContact, UserProfile)
interface EquipmentItem {
    id: string;
    name: string;
    isAvailable: boolean;
}

interface ExternalContact {
    id: string;
    name: string;
    relationship: string;
    phone: string;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    bio: string;
    skills: string[];
    equipment: EquipmentItem[];
    selectedMedicalNeighbors: string[];
    externalContacts: ExternalContact[];
    personalEmergencyCode?: string;
    personalEmergencyInstructions?: string;
    primaryContactId?: string;
}

export default function SettingsPage() {
    const { theme, setTheme, communityName, setCommunityName, colorMode, setColorMode, showEmergencyOnDesktop, setShowEmergencyOnDesktop } = useTheme();
    const { user, toggleRole, setUser } = useUser();
    const medicalKeywords = ["Nurse", "Doctor", "EMT", "Paramedic", "First Aid", "CPR", "Medical"];

    // Filter neighbors with medical skills
    const medicalNeighbors = MOCK_NEIGHBORS.filter(neighbor =>
        neighbor.skills.some(skill =>
            medicalKeywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()))
        )
    );

    const [profile, setProfile] = useState<UserProfile>({
        firstName: "Eric",
        lastName: "H.",
        email: "eric.h@example.com",
        address: "123 Maple Drive",
        bio: "Love gardening and woodworking. Happy to help neighbors with small repairs!",
        skills: ["Woodworking", "Gardening", "Grilling"],
        equipment: [
            { id: '1', name: 'Lawn Mower', isAvailable: true },
            { id: '2', name: 'Cordless Drill', isAvailable: true }
        ],
        selectedMedicalNeighbors: [], // Start empty, will hydrate from local storage
        externalContacts: [
            { id: 'mock1', name: 'Dr. Williams', relationship: 'Primary Care Physician', phone: '555-0199' },
            { id: 'mock2', name: 'Jane Doe', relationship: 'Sister', phone: '555-0123' }
        ],
        personalEmergencyCode: "",
        personalEmergencyInstructions: "",
        primaryContactId: "mock1" // Default for demo
    });

    // Load from LocalStorage on mount
    useEffect(() => {
        // 1. Try to load detailed profile settings
        const savedProfile = localStorage.getItem('kithGrid_profile');
        if (savedProfile) {
            try {
                setProfile(prev => ({ ...prev, ...JSON.parse(savedProfile) }));
            } catch (e) {
                console.error("Failed to parse profile", e);
            }
        } else if (user && user.name !== "Eric H.") {
            // 2. Fallback: If no detailed profile, but we have a logged-in user (from registration), use that name
            const names = user.name.split(' ');
            const firstName = names[0] || "";
            const lastName = names.slice(1).join(' ') || ""; // Handle multi-word last names
            setProfile(prev => ({
                ...prev,
                firstName,
                lastName,
                // We don't have email in UserContext context yet, but we could fetch it or just leave placeholder
            }));
        }
    }, [user]);

    const [notifications, setNotifications] = useState(() => {
        const savedMethod = typeof window !== 'undefined' ? localStorage.getItem('kithGrid_notification_method') : 'both';
        return {
            emailAlerts: true,
            pushNotifications: true,
            neighborAlerts: true,
            marketing: false,
            contactMethod: (savedMethod as 'text' | 'call' | 'both') || 'both'
        };
    });

    const [newSkill, setNewSkill] = useState("");
    const [newEquipment, setNewEquipment] = useState("");

    // External Contact Form State
    const [newContactName, setNewContactName] = useState("");
    const [newContactRelation, setNewContactRelation] = useState("");
    const [newContactPhone, setNewContactPhone] = useState("");

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newSkill.trim()) {
            setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
            setNewSkill("");
        }
    };

    const removeSkill = (skill: string) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
    };

    const handleAddEquipment = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newEquipment.trim()) {
            const newItem: EquipmentItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: newEquipment.trim(),
                isAvailable: true
            };
            setProfile({ ...profile, equipment: [...profile.equipment, newItem] });
            setNewEquipment("");
        }
    };

    const removeEquipment = (id: string) => {
        setProfile({ ...profile, equipment: profile.equipment.filter(e => e.id !== id) });
    };

    const toggleMedicalNeighbor = (id: string) => {
        setProfile(prev => {
            const isSelected = prev.selectedMedicalNeighbors.includes(id);
            if (isSelected) {
                return { ...prev, selectedMedicalNeighbors: prev.selectedMedicalNeighbors.filter(nid => nid !== id) };
            } else {
                return { ...prev, selectedMedicalNeighbors: [...prev.selectedMedicalNeighbors, id] };
            }
        });
    };

    const handleAddContact = () => {
        if (newContactName && newContactPhone) {
            const newContact: ExternalContact = {
                id: Math.random().toString(36).substr(2, 9),
                name: newContactName,
                relationship: newContactRelation,
                phone: newContactPhone
            };
            setProfile({ ...profile, externalContacts: [...profile.externalContacts, newContact] });
            setNewContactName("");
            setNewContactRelation("");
            setNewContactPhone("");
        }
    };

    const removeContact = (id: string) => {
        setProfile({ ...profile, externalContacts: profile.externalContacts.filter(c => c.id !== id) });
    };

    const handleSave = () => {
        // Save to local storage for persistence across reloads
        localStorage.setItem('kithGrid_profile', JSON.stringify(profile));
        localStorage.setItem('kithGrid_notification_method', notifications.contactMethod);

        // Update global user context so Sidebar updates immediately
        const fullName = `${profile.firstName} ${profile.lastName}`.trim();
        setUser({
            ...user,
            name: fullName,
            address: profile.address,
            personalEmergencyCode: profile.personalEmergencyCode,
            personalEmergencyInstructions: profile.personalEmergencyInstructions
        });

        alert("Profile settings saved successfully!");
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage your profile, preferences, and account security.</p>
            </div>



            {/* Profile Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <User size={20} />
                        Public Profile
                    </div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatarPreview}>
                            {profile.firstName[0]}{profile.lastName[0]}
                        </div>
                        <div className={styles.col}>
                            <button className={`${styles.button} ${styles.outlineButton}`} aria-label="Change Avatar">Change Avatar</button>
                            <span className={styles.sectionSubtitle}>JPG, GIF or PNG. 1MB max.</span>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.col}>
                            <label className={styles.label}>First Name</label>
                            <input
                                className={styles.input}
                                value={profile.firstName}
                                onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                aria-label="First Name"
                            />
                        </div>
                        <div className={styles.col}>
                            <label className={styles.label}>Last Name</label>
                            <input
                                className={styles.input}
                                value={profile.lastName}
                                onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                aria-label="Last Name"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Address (Visible to Neighbors)</label>
                        <input
                            className={styles.input}
                            value={profile.address}
                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                            aria-label="Address"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Bio</label>
                        <textarea
                            className={`${styles.input} ${styles.textarea}`}
                            value={profile.bio}
                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                            aria-label="Bio"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Skills to Share (Press Enter to add)</label>
                        <div className={styles.tagsInput}>
                            {profile.skills.map(skill => (
                                <span key={skill} className={styles.tag}>
                                    {skill}
                                    <X size={12} className={styles.removeTag} onClick={() => removeSkill(skill)} />
                                </span>
                            ))}
                            <input
                                className={styles.tagInputText}
                                placeholder="Add a skill..."
                                value={newSkill}
                                onChange={e => setNewSkill(e.target.value)}
                                onKeyDown={handleAddSkill}
                                aria-label="Add new skill"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Wrench size={14} className={styles.inlineIcon} />
                            Equipment Inventory (Press Enter to add)
                        </label>
                        <div className={styles.sectionSubtitle}>
                            Items you list here will be available for neighbors to borrow.
                        </div>
                        <div className={styles.tagsInput}>
                            {profile.equipment.map(item => (
                                <span key={item.id} className={`${styles.tag} ${styles.tagGreen}`}>
                                    {item.name}
                                    <X size={12} className={styles.removeTag} onClick={() => removeEquipment(item.id)} />
                                </span>
                            ))}
                            <input
                                className={styles.tagInputText}
                                placeholder="Add equipment (e.g. Ladder, Drill)..."
                                value={newEquipment}
                                onChange={e => setNewEquipment(e.target.value)}
                                onKeyDown={handleAddEquipment}
                                aria-label="Add new equipment"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <Palette size={20} />
                        Appearance
                    </div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Theme Preference</label>
                        <div className={styles.sectionSubtitleLarge}>
                            Choose how KithGrid looks on your device.
                        </div>
                        <div className={styles.themeToggleGroup}>
                            <button
                                className={`${styles.outlineButton} ${styles.themeButton} ${colorMode === 'light' ? styles.primaryButton + ' ' + styles.themeButtonActive : ''}`}
                                onClick={() => setColorMode('light')}
                                aria-label="Set Light Theme"
                            >
                                <Sun size={18} /> Light
                            </button>
                            <button
                                className={`${styles.outlineButton} ${styles.themeButton} ${colorMode === 'dark' ? styles.primaryButton + ' ' + styles.themeButtonActive : ''}`}
                                onClick={() => setColorMode('dark')}
                                aria-label="Set Dark Theme"
                            >
                                <Moon size={18} /> Dark
                            </button>
                            <button
                                className={`${styles.outlineButton} ${styles.themeButton} ${colorMode === 'system' ? styles.primaryButton + ' ' + styles.themeButtonActive : ''}`}
                                onClick={() => setColorMode('system')}
                                aria-label="Set System Theme"
                            >
                                <Monitor size={18} /> System
                            </button>
                        </div>
                    </div>

                    <div className={`${styles.toggleRow} ${styles.toggleRowSeparator}`}>
                        <div className={styles.toggleLabel}>
                            <div className={styles.desktopToggleLabel}>
                                <Laptop size={18} />
                                <span>Show Emergency Tab on Desktop</span>
                            </div>
                            <span className={styles.toggleDescription}>
                                The Emergency tab is always visible on mobile. Enable this to keep it visible on larger screens too.
                            </span>
                        </div>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={showEmergencyOnDesktop}
                                onChange={e => setShowEmergencyOnDesktop(e.target.checked)}
                                aria-label="Toggle Emergency Tab on Desktop"
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <Bell size={20} />
                        Notifications
                    </div>
                </div>
                <div className={styles.sectionContent}>
                    <div className={styles.toggleRow}>
                        <div className={styles.toggleLabel}>
                            <span>Email Alerts</span>
                            <span className={styles.toggleDescription}>Receive daily digests and important updates.</span>
                        </div>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={notifications.emailAlerts}
                                onChange={e => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                                aria-label="Toggle Email Alerts"
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>

                    <div className={styles.toggleRow}>
                        <div className={styles.toggleLabel}>
                            <span>Emergency Alerts (SMS)</span>
                            <span className={styles.toggleDescription}>Get instant SMS for SOS calls in your area.</span>
                        </div>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={notifications.pushNotifications}
                                onChange={e => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                                aria-label="Toggle SMS Alerts"
                            />
                            <span className={styles.slider}></span>
                        </label>
                    </div>
                    <div className={styles.formGroup} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <div className={styles.sectionSubtitleLarge}>
                            Preferred Method for Emergency Alerts
                        </div>
                        <div className={styles.notificationMethodGroup}>
                            {['text', 'call', 'both'].map((method) => (
                                <label key={method} className={styles.notificationMethodLabel}>
                                    <input
                                        type="radio"
                                        name="contactMethod"
                                        checked={notifications.contactMethod === method}
                                        onChange={() => setNotifications({ ...notifications, contactMethod: method as 'text' | 'call' | 'both' })}
                                        className={styles.contactMethodRadio}
                                        aria-label={`Select ${method} for alerts`}
                                    />
                                    <span className={styles.capitalize}>{method}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Emergency Contacts */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <div className={styles.sectionTitleContent}>
                            <span className={styles.sectionTitleIcon}>🚑</span>
                            Emergency Safety Network
                        </div>
                    </div>
                </div>
                <div className={styles.sectionContent}>
                    {/* Personal Digital Lock */}
                    <div className={styles.formGroup} style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <label className={styles.label}>
                            <Key size={14} className={styles.inlineIcon} />
                            My Digital Lock Code (Optional)
                        </label>
                        <div className={styles.sectionSubtitle}>
                            Providing this code allows it to be included in SOS texts sent from your account.
                        </div>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <label className={styles.label} style={{ fontSize: '0.85rem' }}>Door/Gate Code</label>
                                <input
                                    className={styles.input}
                                    placeholder="#1234"
                                    value={profile.personalEmergencyCode || ""}
                                    onChange={e => setProfile({ ...profile, personalEmergencyCode: e.target.value })}
                                    aria-label="Door or Gate Code"
                                />
                            </div>
                            <div className={`${styles.col} ${styles.colFlex2}`}>
                                <label className={styles.label} style={{ fontSize: '0.85rem' }}>Instructions</label>
                                <input
                                    className={styles.input}
                                    placeholder="e.g. Front door smart lock..."
                                    value={profile.personalEmergencyInstructions || ""}
                                    onChange={e => setProfile({ ...profile, personalEmergencyInstructions: e.target.value })}
                                    aria-label="Emergency Entry Instructions"
                                />
                            </div>
                        </div>
                    </div>

                    {/* External Contacts List */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            <Phone size={14} className={styles.inlineIcon} />
                            External Emergency Contacts
                        </label>
                        <div className={styles.sectionSubtitle}>
                            Add trusted contacts outside the network (Family, Doctors, etc.)
                        </div>

                        <div className={styles.contactListContainer}>
                            {profile.externalContacts.map(contact => (
                                <div key={contact.id} className={`${styles.contactCard} ${profile.primaryContactId === contact.id ? styles.contactCardActive : ''}`}>
                                    <div className={styles.contactCardInner}>
                                        <input
                                            type="radio"
                                            name="primaryContact"
                                            checked={profile.primaryContactId === contact.id}
                                            onChange={() => setProfile({ ...profile, primaryContactId: contact.id })}
                                            className={styles.radioInput}
                                            title="Set as Primary Call Contact"
                                            aria-label={`Set ${contact.name} as primary contact`}
                                        />
                                        <div>
                                            <div className={styles.contactName}>
                                                {contact.name}
                                                {profile.primaryContactId === contact.id && (
                                                    <span className={styles.primaryBadge}>Primary Call</span>
                                                )}
                                            </div>
                                            <div className={styles.contactDetails}>{contact.relationship} • {contact.phone}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeContact(contact.id)} className={styles.deleteButton} aria-label={`Remove ${contact.name}`}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.contactFormGrid}>
                            <input
                                className={styles.input}
                                placeholder="Name"
                                value={newContactName}
                                onChange={e => setNewContactName(e.target.value)}
                                aria-label="New Contact Name"
                            />
                            <input
                                className={styles.input}
                                placeholder="Relationship"
                                value={newContactRelation}
                                onChange={e => setNewContactRelation(e.target.value)}
                                aria-label="New Contact Relationship"
                            />
                            <input
                                className={styles.input}
                                placeholder="Phone"
                                value={newContactPhone}
                                onChange={e => setNewContactPhone(e.target.value)}
                                aria-label="New Contact Phone"
                            />
                            <button className={`${styles.button} ${styles.addButton}`} onClick={handleAddContact} aria-label="Add Contact">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>


                    <div className={`${styles.formGroup} ${styles.medicalSection}`}>
                        <label className={styles.label}>
                            <Stethoscope size={14} className={styles.inlineIcon} />
                            Medical Response Neighbors
                        </label>
                        <div className={styles.sectionSubtitle}>
                            Select medically trained neighbors to notify in case of an SOS.
                        </div>
                        <div className={styles.medicalNeighborsList}>
                            {medicalNeighbors.map(neighbor => (
                                <label key={neighbor.id} className={`${styles.medicalNeighborLabel} ${profile.selectedMedicalNeighbors.includes(neighbor.id) ? styles.medicalNeighborActive : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={profile.selectedMedicalNeighbors.includes(neighbor.id)}
                                        onChange={() => toggleMedicalNeighbor(neighbor.id)}
                                        className={styles.checkboxInput}
                                        aria-label={`Select ${neighbor.name}`}
                                    />
                                    <div className={styles.medicalNameContainer}>
                                        <span className={styles.medicalName}>{neighbor.name}</span>
                                        <span className={styles.medicalSkills}>
                                            {neighbor.skills.filter(s => medicalKeywords.some(k => s.toLowerCase().includes(k.toLowerCase()))).join(", ")}
                                        </span>
                                    </div>
                                </label>
                            ))}
                            {medicalNeighbors.length === 0 && (
                                <p className={styles.noMedicalText}>No neighbors with listed medical training found.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className={styles.saveButtonContainer}>
                <button className={`${styles.button} ${styles.outlineButton}`}>Cancel</button>
                <button className={`${styles.button} ${styles.primaryButton}`} onClick={handleSave}>
                    <Save size={16} className={styles.saveIcon} />
                    Save Changes
                </button>
            </div>

            {/* Debug / Dev Tools */}
            <div className={styles.debugTools}>
                <p className={styles.sectionSubtitleLarge}>Development Tools</p>
                <button
                    onClick={toggleRole}
                    className={`${styles.outlineButton} ${styles.devRoleButton}`}
                >
                    Switch to {user.role === 'admin' ? 'Resident' : 'Admin'} Mode
                </button>
            </div>
        </div >
    );
}
