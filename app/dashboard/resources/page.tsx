"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import styles from "./resources.module.css";
import { Building2, Wrench, Car, Users, CheckCircle, Plus, Trash2 } from "lucide-react";
import { CreateResourceModal } from "@/components/dashboard/CreateResourceModal";
import { ReservationModal } from "@/components/dashboard/ReservationModal";
import { getCommunityResources, createResource, deleteResource } from "@/app/actions/resources";

interface Resource {
    id: string;
    name: string;
    type: "Facility" | "Tool" | "Vehicle";
    capacity: number | null;
    description: string;
    isReservable: boolean;
    nextAvailable?: string;
}

export default function ResourcesPage() {
    const { user } = useUser();
    const [resources, setResources] = useState<Resource[]>([]);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [reservationResource, setReservationResource] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.communityId) {
            loadResources();
        }
    }, [user?.communityId]);

    const loadResources = async () => {
        if (!user?.communityId) return;
        setIsLoading(true);
        const res = await getCommunityResources(user.communityId);
        if (res.success && res.data) {
            setResources(res.data);
        }
        setIsLoading(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Facility': return <Building2 size={40} />;
            case 'Vehicle': return <Car size={40} />;
            default: return <Wrench size={40} />;
        }
    };

    const handleReserve = (resource: any) => {
        setReservationResource(resource);
    };

    const handleReservationConfirm = (date: string, start: string, end: string) => {
        alert(`Request sent for ${reservationResource.name} on ${date} from ${start} to ${end}.`);
        setReservationResource(null);
    };

    const handleCreate = async (data: any) => {
        if (!user?.communityId) return;

        const res = await createResource({
            communityId: user.communityId,
            name: data.name,
            type: data.type,
            capacity: parseInt(data.capacity) || 0,
            description: data.description,
            isReservable: true
        });

        if (res.success) {
            loadResources();
            setIsCreateModalOpen(false);
        } else {
            alert("Failed to create resource: " + res.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to remove this resource?")) {
            const res = await deleteResource(id);
            if (res.success) {
                setResources(resources.filter(r => r.id !== id));
            } else {
                alert("Failed to delete: " + res.error);
            }
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Admin Toggle */}
            <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 100 }}>
                <button
                    onClick={() => setIsAdminMode(!isAdminMode)}
                    style={{
                        padding: '0.5rem 1rem',
                        background: isAdminMode ? 'var(--primary)' : 'var(--muted)',
                        color: isAdminMode ? 'white' : 'var(--foreground)',
                        borderRadius: '999px',
                        border: 'none',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600
                    }}
                >
                    {isAdminMode ? 'System Admin: ON' : 'System Admin: OFF'}
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Community Resources</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Shared assets available for all residents to reserve and enjoy.
                    </p>
                </div>
                {isAdminMode && (
                    <button
                        className={styles.button}
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={16} />
                        Add Resource
                    </button>
                )}
            </div>

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading resources...</div>
            ) : (
                <div className={styles.grid}>
                    {resources.map(resource => (
                        <div key={resource.id} className={styles.card}>
                            <div className={styles.imagePlaceholder}>
                                {getIcon(resource.type)}
                            </div>
                            <div className={styles.content}>
                                <span className={styles.typeTag}>{resource.type}</span>
                                <h3 className={styles.title}>{resource.name}</h3>
                                <p className={styles.description}>{resource.description}</p>

                                {resource.capacity !== null && resource.capacity > 0 && (
                                    <div className={styles.meta}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Users size={16} />
                                            Capacity: {resource.capacity}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={styles.footer}>
                                <div className={`${styles.status} ${styles.statusAvailable}`}>
                                    <CheckCircle size={14} />
                                    Available {resource.nextAvailable || "Now"}
                                </div>
                                {isAdminMode ? (
                                    <button
                                        className={styles.button}
                                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                                        onClick={() => handleDelete(resource.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                ) : (
                                    <button className={styles.button} onClick={() => handleReserve(resource)}>
                                        Reserve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {resources.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                            No resources found.
                        </div>
                    )}
                </div>
            )}

            <CreateResourceModal
                isOpen={iscreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreate}
            />

            <ReservationModal
                isOpen={!!reservationResource}
                onClose={() => setReservationResource(null)}
                resourceName={reservationResource?.name || null}
                onConfirm={handleReservationConfirm}
            />
        </div>
    );
}
