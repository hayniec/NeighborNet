"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import styles from "../join/join.module.css";
import { authenticateUser } from "@/app/actions/auth";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await authenticateUser(email, password);

            if (result.success && result.user) {
                // @ts-ignore - mismatch between strict casing "resident" vs "Resident"
                setUser(result.user);
                // Also persist client side manually if context doesn't (Context does it, but let's be safe per prior patterns)
                // Actually setUser in context already does localStorage.setItem.

                router.push("/dashboard");
            } else {
                setError(result.error || "Login failed");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to NeighborNet</p>
                </div>

                <form onSubmit={handleLogin} className={styles.formCol}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Example: temp123"
                            className={styles.input}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                        style={{ marginTop: "1rem" }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>

                </form>
                <p className={styles.footerText} style={{ marginTop: '1.5rem' }}>
                    Don't have an account? <a href="/join" className={styles.link}>Join with Code</a>
                </p>
            </div>
        </div>
    );
}
