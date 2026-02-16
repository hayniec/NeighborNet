import { useState, useEffect } from "react";
import styles from "./services.module.css";
import { Wrench, Phone, Star, User, Hammer, Trees, ShieldCheck, Plus } from "lucide-react";
import { getServiceProviders, createServiceProvider } from "@/app/actions/services";
import { useUser } from "@/contexts/UserContext";
import { CreateServiceModal } from "@/components/dashboard/CreateServiceModal";

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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        if (user?.communityId) {
            loadServices();
        } else if (user) {
            // User loaded but no community? Stop loading.
            setIsLoading(false);
        }
    }, [user?.communityId]);

    const loadServices = async () => {
        if (!user?.communityId) return;
        setIsLoading(true);
        const res = await getServiceProviders(user.communityId);
        if (res.success && res.data) {
            setProviders(res.data);
        }
        setIsLoading(false);
    };

    const handleCreateService = async (data: any) => {
        if (!user?.communityId) return;
        try {
            const res = await createServiceProvider({
                communityId: user.communityId,
                name: data.name,
                category: data.category,
                phone: data.phone,
                description: data.description,
                recommendedBy: user.name || "Neighbor", // Default name if missing
            });

            if (res.success && res.data) {
                setProviders(prev => [res.data, ...prev]);
                setIsCreateModalOpen(false);
            } else {
                alert("Failed to add recommendation: " + res.error);
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.pageTitle}>Service Recommendations</h1>
                    <p className={styles.pageSubtitle}>Trusted professionals recommended by your neighbors.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1rem', background: 'var(--primary)', color: 'white',
                        border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                    }}
                >
                    <Plus size={18} />
                    Recommend a Pro
                </button>
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

            <CreateServiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateService}
            />
        </div>
    );
}
