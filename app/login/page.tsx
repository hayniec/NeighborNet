"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import styles from "../join/join.module.css";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple mock authentication logic
        if (email.includes("admin")) {
            setUser({
                name: "Admin User",
                role: "admin",
                avatar: "AD"
            });
            router.push("/dashboard");
        } else if (email.includes("resident")) {
            setUser({
                name: "Resident User",
                role: "resident",
                avatar: "RU"
            });
            router.push("/dashboard");
        } else if (email === "erich@example.com") {
            setUser({
                name: "Eric H.",
                role: "admin", // Eric is admin by default in this demo
                avatar: "EH"
            });
            router.push("/dashboard");
        } else {
            // For demo purposes, let anyone login as resident if not specified
            setUser({
                name: email.split('@')[0],
                role: "resident",
                avatar: email.substring(0, 2).toUpperCase()
            });
            router.push("/dashboard");
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
                            placeholder="Type 'admin' to be admin..."
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
                            placeholder="Any password works"
                            className={styles.input}
                        />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                        style={{ marginTop: "1rem" }}
                    >
                        Sign In
                    </button>

                    <div style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--muted-foreground)", textAlign: "center" }}>
                        <p>Demo Hints:</p>
                        <p>Use email containing "admin" for Admin role.</p>
                        <p>Use email containing "resident" for Resident role.</p>
                    </div>
                </form>
                <p className={styles.footerText} style={{ marginTop: '1.5rem' }}>
                    Don't have an account? <a href="/join" className={styles.link}>Join with Code</a>
                </p>
            </div>
        </div>
    );
}
