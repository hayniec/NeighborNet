'use client'

import { useState } from 'react';
import { resetAndSeed } from '@/app/actions/seed';

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSeed = async () => {
        if (!confirm("WARNING: This will delete ALL users and members. Are you sure?")) return;

        setLoading(true);
        try {
            const res = await resetAndSeed();
            setResult(res);
            if (res.success) {
                alert("Database Reset & Seed Complete! Please verify.");
            } else {
                alert("Seed Failed: " + res.error);
            }
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1>Database Reset Tool</h1>
            <p>
                This tool will:
                <br />1. Delete all existing Neighbors (Members).
                <br />2. Delete all existing Users.
                <br />3. Create standard test users for each validation scenario.
            </p>

            <div style={{ margin: '2rem 0', padding: '1rem', background: '#ffe4e6', border: '1px solid #f43f5e', borderRadius: '8px', color: '#881337' }}>
                <strong>⚠️ DANGER ZONE:</strong> This action cannot be undone. All production user data will be lost.
            </div>

            <button
                onClick={handleSeed}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Processing...' : 'RESET DATABASE NOW'}
            </button>

            {loading && <p>Please wait... this may take up to 30 seconds.</p>}

            {result && (
                <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                    <h3>Result:</h3>
                    <pre style={{ background: '#f8f8f8', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
