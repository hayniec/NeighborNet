"use client";

import { useState, useEffect } from "react";
import styles from "./services.module.css";
import { Wrench, Phone, Star, User, Hammer, Trees, ShieldCheck } from "lucide-react";
import { getServiceProviders } from "@/app/actions/services";
import { useUser } from "@/contexts/UserContext";

interface ServiceProvider {
    id: string;
    name: string;
    category: string;
    phone: string;
    rating: string;
    recommendedBy: string;
    description: string;
}

export default function ServicesPage() {
    const { user } = useUser();
    const [providers, setProviders] = useState<ServiceProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.communityId) {
            loadServices();
        }
    }, [user?.communityId]);

    const loadServices = async () => {
        if (!user) return;
        setIsLoading(true);
        const res = await getServiceProviders(user.communityId);
        if (res.success && res.data) {
            setProviders(res.data);
        }
        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Service Recommendations</h1>
                <p className={styles.pageSubtitle}>Trusted professionals recommended by your neighbors.</p>
            </div>

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading services...</div>
            ) : (
                <div className={styles.grid}>
                    {providers.map((provider) => (
                        <div key={provider.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>
                                    {provider.category === 'Handyman' && <Hammer size={24} />}
                                    {provider.category === 'Tree Service' && <Trees size={24} />}
                                    {provider.category === 'Roofer' && <ShieldCheck size={24} />}
                                    {provider.category === 'Landscaping' && <Trees size={24} />}
                                    {!['Handyman', 'Tree Service', 'Roofer', 'Landscaping'].includes(provider.category) && <Wrench size={24} />}
                                </div>
                                <div className={styles.categoryBadge}>{provider.category}</div>
                            </div>

                            <h3 className={styles.providerName}>{provider.name}</h3>

                            <div className={styles.ratingRow}>
                                <div className={styles.stars}>
                                    <Star size={16} fill="currentColor" className={styles.starIcon} />
                                    <span>{provider.rating}</span>
                                </div>
                                <span className={styles.reviewCount}>(Verified)</span>
                            </div>

                            <p className={styles.description}>"{provider.description}"</p>

                            <div className={styles.footer}>
                                <div className={styles.recommendedBy}>
                                    <User size={14} />
                                    <span>Rec by {provider.recommendedBy}</span>
                                </div>
                                <a href={`tel:${provider.phone}`} className={styles.callButton}>
                                    <Phone size={16} />
                                    Call
                                </a>
                            </div>
                        </div>
                    ))}
                    {providers.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            No service providers found. Be the first to recommend one!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
