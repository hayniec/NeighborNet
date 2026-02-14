"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import styles from "./join.module.css";
import { validateInvitation, markInvitationUsed } from "@/app/actions/invitations";
import { registerNeighbor } from "@/app/actions/neighbors";
import { useUser } from "@/contexts/UserContext";

export default function JoinPage() {
    const router = useRouter();
    const { setUser } = useUser();
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
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [invitationId, setInvitationId] = useState<string>("");
    const [communityId, setCommunityId] = useState<string>("");

    const verifyCode = async () => {
        if (!formData.code) {
            setError("Please enter an invitation code");
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            const result = await validateInvitation(formData.code);

            if (result.success && result.data) {
                setFormData(prev => ({ ...prev, email: result.data.email }));
                setInvitationId(result.data.id);
                setCommunityId(result.data.communityId);
                setStep(2);
            } else {
                setError(result.error || "Invalid or expired invitation code.");
            }
        } catch (error) {
            console.error("Error validating invitation:", error);
            setError("Unexpected error validating invitation code");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRegister = async () => {
        if (!formData.firstName || !formData.lastName || !formData.password) {
            alert("Please fill in all required fields.");
            return;
        }

        setIsRegistering(true);
        try {
            // 1. Create the user account
            const registerResult = await registerNeighbor({
                communityId: communityId,
                email: formData.email,
                password: formData.password,
                name: `${formData.firstName} ${formData.lastName}`,
                address: formData.address || "",
                role: 'Resident'
            });

            if (!registerResult.success) {
                alert(`Registration failed: ${registerResult.error}`);
                setIsRegistering(false);
                return;
            }

            // 2. Mark invitation used
            if (invitationId) {
                await markInvitationUsed(formData.code);
            }

            // 3. Update User Context
            const newUserProfile = {
                id: registerResult.data.id,
                communityId: registerResult.data.communityId,
                email: registerResult.data.email,
                name: registerResult.data.name,
                role: "resident" as const,
                avatar: registerResult.data.name.charAt(0).toUpperCase()
            };
            setUser(newUserProfile);

            alert(`Welcome, ${formData.firstName}! Account created successfully.`);
            router.push("/dashboard");
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Error completing registration");
            setIsRegistering(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.logoBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                            <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" />
                            <path d="M9 7V17" />
                            <path d="M15 7L9 12L15 17" />
                        </svg>
                    </div>
                    <h1 className={styles.title}>Join KithGrid</h1>
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
                                disabled={isVerifying}
                            />
                        </div>
                        {error && <p className={styles.error}>{error}</p>}
                        <button
                            onClick={verifyCode}
                            className={styles.button}
                            disabled={isVerifying}
                        >
                            {isVerifying ? 'Verifying...' : 'Verify Code'}
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
