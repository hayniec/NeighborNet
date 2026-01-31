"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import styles from "./join.module.css";

export default function JoinPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Code, 2: Profile
    const [formData, setFormData] = useState({
        code: "",
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        password: ""
    });
    const [error, setError] = useState("");

    const verifyCode = () => {
        // Retrieve valid invites from simulated backend
        let validInvites = [];
        try {
            const stored = localStorage.getItem('neighborNet_invites');
            if (stored) validInvites = JSON.parse(stored);
        } catch (e) { }

        const match = validInvites.find((invite: any) =>
            invite.code === formData.code.toUpperCase() &&
            invite.status === 'pending'
        );

        if (match) {
            setFormData(prev => ({ ...prev, email: match.email }));
            setError("");
            setStep(2);
        } else {
            setError("Invalid or expired invitation code.");
        }
    };

    const handleRegister = () => {
        // Simulate registration
        alert(`Welcome, ${formData.firstName}! Account created successfully.`);
        // In a real app, we'd invalidate the code now

        // Redirect
        router.push("/dashboard");
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                    <h1 className={styles.title}>Join NeighborNet</h1>
                    <p className={styles.subtitle}>
                        {step === 1 ? "Enter your invitation code to get started." : "Complete your profile."}
                    </p>
                </div>

                {step === 1 && (
                    <div className={styles.formCol}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="invite-code" className={styles.label}>Invitation Code</label>
                            <input
                                id="invite-code"
                                type="text"
                                placeholder="e.g. A1B2C3"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className={styles.codeInput}
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button
                            onClick={verifyCode}
                            className={styles.button}
                        >
                            Verify Code
                        </button>
                        <p className={styles.footerText}>
                            Already have an account? <a href="/login" className={styles.link}>Sign in</a>
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.formCol}>
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles.flex1}`}>
                                <label htmlFor="first-name" className={styles.label}>First Name</label>
                                <input
                                    id="first-name"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles.flex1}`}>
                                <label htmlFor="last-name" className={styles.label}>Last Name</label>
                                <input
                                    id="last-name"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="email" className={styles.label}>Email Address</label>
                            <input
                                id="email"
                                value={formData.email}
                                disabled
                                className={`${styles.input} ${styles.inputDisabled}`}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="address" className={styles.label}>Home Address</label>
                            <input
                                id="address"
                                placeholder="123 Maple Drive"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="password" className={styles.label}>Password</label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className={styles.input}
                            />
                        </div>

                        <button
                            onClick={handleRegister}
                            className={styles.button}
                            style={{ marginTop: '1rem' }}
                        >
                            Create Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
