"use client";

import { useState, useEffect } from "react";
import styles from "./documents.module.css";
import { FileText, Download, Eye, X, Upload, Home, Mail, Phone, MapPin, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getCommunityDocuments, createDocument } from "@/app/actions/documents";
import { getNeighbors } from "@/app/actions/neighbors"; // For board members if needed

interface Document {
    id: string;
    title: string;
    type: string;
    source: 'internal' | 'external';
    size?: string;
    date: string;
    url: string;
    category?: string;
}

export default function DocumentsPage() {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'documents' | 'info'>('info');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            if (!user.communityId) {
                if (user.role) setIsLoading(false);
                return;
            }
            try {
                const res = await getCommunityDocuments(user.communityId);
                if (res.success && res.data) {
                    setDocuments(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocs();
    }, [user.communityId, user.role]);

    const handleUpload = async (docData: any) => {
        if (!user.communityId) return;

        // Mock upload logic -> just create record with link
        try {
            const res = await createDocument({
                communityId: user.communityId,
                name: docData.name,
                category: docData.category,
                filePath: docData.url || "#",
                uploadedBy: user.id || ""
            });

            if (res.success && res.data) {
                const newDoc: Document = {
                    id: res.data.id,
                    title: res.data.name,
                    type: 'External Link',
                    source: 'external',
                    category: res.data.category,
                    date: new Date().toLocaleDateString(),
                    size: 'N/A',
                    url: res.data.filePath
                };
                setDocuments([newDoc, ...documents]);
                setIsUploadModalOpen(false);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to upload document.");
        }
    };

    const handlePreview = (doc: Document) => {
        setSelectedDoc(doc);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>HOA Documents & Info</h1>
                <p className={styles.pageSubtitle}>Central hub for community documents, board contacts, and resources.</p>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'info' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    Community Information
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'documents' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('documents')}
                >
                    Documents & Forms
                </button>
            </div>

            {activeTab === 'info' && (
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <span className={styles.cardLabel}>Contact</span>
                        <div className={styles.contactInfo}>
                            <div className={styles.cardValue}>
                                <Mail size={18} className="text-muted-foreground" />
                                board@community.com
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'documents' && (
                <div>
                    <div className={styles.flexEndContainer}>
                        {/* Only admins might upload in future, for now allow all or check role */}
                        <button
                            className={styles.uploadButton}
                            onClick={() => setIsUploadModalOpen(true)}
                        >
                            <Upload size={16} />
                            Upload Document
                        </button>
                    </div>

                    {isLoading ? (
                        <div className={styles.loadingMessage}>Loading documents...</div>
                    ) : documents.length === 0 ? (
                        <div className={styles.emptyMessage}>No documents found.</div>
                    ) : (
                        <div className={styles.documentList}>
                            {documents.map((doc) => (
                                <div key={doc.id} className={styles.documentCard} onClick={() => handlePreview(doc)}>
                                    <div className={styles.docIcon}>
                                        {doc.source === 'external' ? <LinkIcon size={24} /> : <FileText size={24} />}
                                    </div>
                                    <div className={styles.docInfo}>
                                        <h3 className={styles.docTitle}>{doc.title}</h3>
                                        <div className={styles.docMeta}>
                                            <span className={styles.docType}>{doc.type}</span>
                                            <span className={styles.docSize}>{doc.size}</span>
                                            <span className={styles.docDate}>{doc.date}</span>
                                            {doc.category && <span className={styles.docCategory}>{doc.category}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {isUploadModalOpen && (
                <div className={styles.viewerOverlay}>
                    <div className={styles.uploadModal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Upload Document</h2>
                            <button className={styles.closeButton} onClick={() => setIsUploadModalOpen(false)} aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>
                        <form
                            className={styles.uploadForm}
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleUpload({
                                    name: formData.get('name'),
                                    category: formData.get('category'),
                                    url: formData.get('url')
                                });
                            }}
                        >
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Document Title</label>
                                <input name="name" className={styles.formInput} placeholder="e.g. Annual Budget 2026" required />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Category</label>
                                <select name="category" className={styles.formInput} aria-label="Document Category">
                                    <option value="Meeting Minutes">Meeting Minutes</option>
                                    <option value="Financials">Financials</option>
                                    <option value="Rules & Bylaws">Rules & Bylaws</option>
                                    <option value="Notices">Notices</option>
                                    <option value="Forms">Forms</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Link URL</label>
                                <input name="url" className={styles.formInput} placeholder="https://..." type="url" required />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelButton} onClick={() => setIsUploadModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitButton}>Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
