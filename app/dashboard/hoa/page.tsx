"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import styles from "./hoa.module.css";
import { FileText, Download, Mail, Phone, MapPin, Upload } from "lucide-react";
import { UploadDocumentModal } from "@/components/dashboard/UploadDocumentModal";
import { getNeighbors, getCommunityOfficers } from "@/app/actions/neighbors";
import { ContactOfficerModal } from "@/components/dashboard/ContactOfficerModal";
import { getCommunityDocuments, createDocument } from "@/app/actions/documents";
import { getCommunities } from "@/app/actions/communities";

interface HoaDocument {
    id: string;
    name: string;
    category: string;
    uploadDate: string;
    size: string;
    url: string;
    uploaderName: string;
}

interface Officer {
    id: string;
    name: string;
    role: string;
    hoaPosition: string | null;
    email: string;
    avatar?: string;
}

export default function HoaPage() {
    const { user } = useUser();
    const [documents, setDocuments] = useState<HoaDocument[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
    const [officers, setOfficers] = useState<Officer[]>([]);
    const [isLoadingOfficers, setIsLoadingOfficers] = useState(true);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [hoaSettings, setHoaSettings] = useState<{ duesAmount: string | null; duesFrequency: string | null } | null>(null);

    const role = user?.role?.toLowerCase();
    const canUpload = role === 'admin' || role === 'board member';

    useEffect(() => {
        if (user?.communityId) {
            fetchOfficers();
            fetchDocuments();
            fetchCommunitySettings();
        }
    }, [user?.communityId]);

    const fetchCommunitySettings = async () => {
        if (!user?.communityId) return;
        try {
            const res = await getCommunities();
            if (res.success && res.data) {
                const current = res.data.find((c: any) => c.id === user.communityId);
                if (current && current.hoaSettings) {
                    setHoaSettings(current.hoaSettings);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchOfficers = async () => {
        if (!user?.communityId) return;
        setIsLoadingOfficers(true);
        try {
            const result = await getCommunityOfficers(user.communityId);
            if (result.success && result.data) {
                const foundOfficers = result.data.map((n: any) => ({
                    id: n.id,
                    name: n.name,
                    role: n.role,
                    hoaPosition: n.hoaPosition,
                    email: n.email || "",
                    avatar: n.avatar
                }));
                setOfficers(foundOfficers);
            }
        } catch (e) {
            console.error(e);
        }
        setIsLoadingOfficers(false);
    };

    const fetchDocuments = async () => {
        if (!user?.communityId) return;
        setIsLoadingDocs(true);
        const res = await getCommunityDocuments(user.communityId);
        if (res.success && res.data) {
            const adapted = res.data.map((d: any) => ({
                id: d.id,
                name: d.title,
                category: d.category,
                uploadDate: d.date,
                size: d.size,
                url: d.url,
                uploaderName: d.uploaderName || "Unknown"
            }));
            setDocuments(adapted);
        }
        setIsLoadingDocs(false);
    };

    const handleUpload = async (docData: any) => {
        if (!user?.communityId || !user?.id) return;

        const path = docData.source === 'external' ? docData.url : "#";

        const res = await createDocument({
            communityId: user.communityId,
            name: docData.name,
            category: docData.category,
            filePath: path,
            uploadedBy: user.id
        });

        if (res.success) {
            fetchDocuments();
            setIsUploadModalOpen(false);
        } else {
            alert("Failed to upload: " + res.error);
        }
    };

    const handleEmailClick = (officer: Officer) => {
        setSelectedOfficer(officer);
        setIsContactModalOpen(true);
    };

    return (
        <div className={styles.container}>
            <div className={styles.intro}>
                <h1>Maple Grove HOA</h1>
                <p>
                    Welcome to the official information hub for the Maple Grove community.
                    Here you can find board contacts, community rules, and financial reports.
                </p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.title}>Community Information</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Contact</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div className={styles.cardValue}>
                                <Mail size={18} className="text-muted-foreground" />
                                board@maplegrovehoa.com
                            </div>
                            <div className={styles.cardValue}>
                                <Phone size={18} className="text-muted-foreground" />
                                (555) 123-4567
                            </div>
                            <div className={styles.cardValue}>
                                <MapPin size={18} className="text-muted-foreground" />
                                P.O. Box 42, Springfield
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Board Members / Officers</span>
                        <div className={styles.officerList}>
                            {isLoadingOfficers ? (
                                <div style={{ padding: '1rem', color: 'var(--muted-foreground)' }}>Loading officers...</div>
                            ) : officers.length === 0 ? (
                                <div style={{ padding: '1rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                    No officers listed.
                                </div>
                            ) : (
                                officers.map(officer => (
                                    <div key={officer.id} className={styles.officerItem}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                                                {officer.avatar || officer.name.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{officer.name}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                                    {officer.hoaPosition || "Board Member"}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            className={styles.contactLink}
                                            onClick={() => handleEmailClick(officer)}
                                            title={`Email ${officer.name}`}
                                        >
                                            <Mail size={16} />
                                            Email
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Dues & Fees</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 700 }}>
                                {hoaSettings?.duesAmount ? `$${hoaSettings.duesAmount}` : 'Not set'}
                                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted-foreground)' }}>
                                    {hoaSettings?.duesFrequency ? `/${hoaSettings.duesFrequency.toLowerCase()}` : ''}
                                </span>
                            </span>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                {hoaSettings?.duesAmount ? 'Current period' : 'Contact board for details'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.title}>Documents & Resources</h2>
                    {canUpload && (
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: 'var(--primary)',
                                color: 'var(--primary-foreground)',
                                border: 'none',
                                padding: '0.6rem 1rem',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            <Upload size={18} />
                            Upload Document
                        </button>
                    )}
                </div>

                {isLoadingDocs ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading documents...</div>
                ) : (
                    <div className={styles.docsList}>
                        {documents.map(doc => (
                            <div key={doc.id} className={styles.docItem}>
                                <div className={styles.docInfo}>
                                    <div className={styles.docIcon}>
                                        <FileText size={24} />
                                    </div>
                                    <div className={styles.docMeta}>
                                        <span className={styles.docName}>{doc.name}</span>
                                        <span className={styles.docDetails}>
                                            {doc.category} • {doc.size} • Uploaded {doc.uploadDate}
                                        </span>
                                    </div>
                                </div>
                                <button className={styles.downloadButton} title="Download">
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                        {documents.length === 0 && (
                            <div style={{ padding: '1rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                No documents found.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <UploadDocumentModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
            />

            <ContactOfficerModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                officer={selectedOfficer ? {
                    name: selectedOfficer.name,
                    email: selectedOfficer.email,
                    position: selectedOfficer.hoaPosition || "Officer"
                } : null}
                sender={{
                    name: user?.name || "Resident",
                    email: user?.email || ""
                }}
            />
        </div >
    );
}
