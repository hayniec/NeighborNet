"use client";

import { useState } from "react";
import styles from "./Modal.module.css";
import { X } from "lucide-react";

interface CreateServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: any) => void;
}

export function CreateServiceModal({ isOpen, onClose, onCreate }: CreateServiceModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        category: "Handyman",
        phone: "",
        description: "" // Used as "Why do you recommend?"
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!formData.name || !formData.category || !formData.phone || !formData.description) return;
        onCreate(formData);
        setFormData({
            name: "",
            category: "Handyman",
            phone: "",
            description: ""
        });
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className={styles.title} style={{ margin: 0 }}>Recommend a Pro</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Provider Name</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. John's Plumbing"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Category</label>
                    <select
                        className={styles.select}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option value="Handyman">Handyman</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Electrician">Electrician</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Landscaping">Landscaping</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Pest Control">Pest Control</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                        className={styles.input}
                        placeholder="e.g. 555-0123"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>Why do you recommend them?</label>
                    <textarea
                        className={styles.textarea}
                        placeholder="They did a great job fixing my..."
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
                        disabled={!formData.name || !formData.phone || !formData.description}
                        style={{ opacity: (!formData.name || !formData.phone || !formData.description) ? 0.5 : 1 }}
                    >
                        Add Recommendation
                    </button>
                </div>
            </div>
        </div>
    );
}
