"use client";

import { useState, useEffect } from "react";
import styles from "./local.module.css";
import { Utensils, Music, MapPin, Star, Navigation } from "lucide-react";
import { getLocalPlaces } from "@/app/actions/local";
import { useUser } from "@/contexts/UserContext";

interface LocalSpot {
    id: string;
    name: string;
    category: string;
    rating: string;
    address: string;
    description: string;
}

export default function LocalGuidePage() {
    const { user } = useUser();
    const [spots, setSpots] = useState<LocalSpot[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.communityId) {
            loadSpots();
        }
    }, [user?.communityId]);

    const loadSpots = async () => {
        if (!user?.communityId) return;
        setIsLoading(true);
        const res = await getLocalPlaces(user.communityId);
        if (res.success && res.data) {
            setSpots(res.data);
        }
        setIsLoading(false);
    };

    const getColor = (name: string) => {
        const colors = ["#ef4444", "#8b5cf6", "#10b981", "#f59e0b", "#eab308"];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Local Guide</h1>
                <p className={styles.pageSubtitle}>Discover the best local dining and activities near the neighborhood.</p>
            </div>

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading local guide...</div>
            ) : (
                <div className={styles.grid}>
                    {spots.map((spot) => (
                        <div key={spot.id} className={styles.card}>
                            <div className={styles.imageHeader} style={{ backgroundColor: getColor(spot.name) }}>
                                {spot.category === 'Restaurant' ? <Utensils size={48} color="white" /> : <Music size={48} color="white" />}
                            </div>

                            <div className={styles.content}>
                                <div className={styles.typeRow}>
                                    <span className={styles.typeBadge}>{spot.category}</span>
                                    <div className={styles.rating}>
                                        <Star size={14} fill="currentColor" />
                                        {spot.rating}
                                    </div>
                                </div>

                                <h3 className={styles.spotName}>{spot.name}</h3>

                                <div className={styles.infoRow}>
                                    <MapPin size={16} />
                                    <span>{spot.address}</span>
                                </div>

                                <div className={styles.infoRow}>
                                    <Navigation size={16} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>{spot.description}</span>
                                </div>

                                <button className={styles.visitButton}>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                    {spots.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            No local places found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
