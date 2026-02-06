"use client";

import { useState, useEffect } from "react";
import styles from "./marketplace.module.css";
import { ShoppingBag, Plus, Tag, Clock, User, Check, X, Image as ImageIcon } from "lucide-react";
import { MarketplaceItem } from "@/types/marketplace";
import { useUser } from "@/contexts/UserContext";
import { getCommunityMarketplaceItems, createMarketplaceItem } from "@/app/actions/marketplace";

export default function MarketplacePage() {
    const { user } = useUser();
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        price: "",
        isFree: false,
        isNegotiable: false,
    });

    useEffect(() => {
        const fetchItems = async () => {
            if (!user.communityId) {
                if (user.role) setIsLoading(false);
                return;
            }
            try {
                const res = await getCommunityMarketplaceItems(user.communityId);
                if (res.success && res.data) {
                    setItems(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItems();
    }, [user.communityId, user.role]);

    const handleCreate = async () => {
        if (!newItem.title || !user.communityId) return;

        // Note: For now, create action only supports basic fields. 
        // We'll map UI fields to what the server expects.
        // isFree/isNegotiable logic might be client-side derived or need schema update.
        // For now, price=0 means free.

        const priceVal = newItem.isFree ? "0" : newItem.price || "0";

        try {
            const res = await createMarketplaceItem({
                communityId: user.communityId,
                title: newItem.title,
                description: newItem.description,
                price: priceVal,
                sellerId: user.id || ""
            });

            if (res.success && res.data) {
                // Optimistic add or refetch. 
                // The returned item matches DB schema. 
                // We map it to UI type if needed.
                const createdItem: MarketplaceItem = {
                    id: res.data.id,
                    title: res.data.title,
                    description: res.data.description,
                    price: Number(res.data.price),
                    isFree: Number(res.data.price) === 0,
                    isNegotiable: false,
                    images: [],
                    status: 'Active',
                    postedDate: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    sellerId: user.id || "currentUser",
                    sellerName: user.name
                };
                setItems([createdItem, ...items]);
                setIsModalOpen(false);
                setNewItem({ title: "", description: "", price: "", isFree: false, isNegotiable: false });
            } else {
                alert("Failed to create item.");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating item.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Neighborhood Trade</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        Buy, sell, or trade items with your neighbors.
                    </p>
                </div>
                <button
                    className={styles.button}
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={18} />
                    Post Item
                </button>
            </div>

            {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading items...</div>
            ) : items.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No items found. Be the first to post!</div>
            ) : (
                <div className={styles.grid}>
                    {items.map(item => {
                        const isExpired = item.expiresAt ? new Date() > new Date(item.expiresAt) : false;
                        return (
                            <div key={item.id} className={styles.card} style={{ opacity: isExpired ? 0.6 : 1 }}>
                                <div className={styles.imagePlaceholder}>
                                    <ImageIcon size={40} />
                                    {item.status === 'Sold' && <div className={styles.soldOverlay}>SOLD</div>}
                                </div>
                                <div className={styles.content}>
                                    <div className={styles.header}>
                                        <h3 className={styles.title}>{item.title}</h3>
                                        {item.isFree ? (
                                            <span className={styles.freeTag}>FREE</span>
                                        ) : (
                                            <span className={styles.priceTag}>${item.price}</span>
                                        )}
                                    </div>
                                    <p className={styles.description}>{item.description}</p>

                                    <div className={styles.meta}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <User size={14} />
                                            <span>{item.sellerName || 'Neighbor'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={14} />
                                            <span>{item.postedDate ? new Date(item.postedDate).toLocaleDateString() : 'Now'}</span>
                                        </div>
                                    </div>

                                    <button className={styles.contactButton}>Contact Seller</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h2>Post New Item</h2>
                            <button onClick={() => setIsModalOpen(false)} className={styles.closeButton} aria-label="Close">
                                <X size={24} />
                            </button>
                        </div>
                        <div className={styles.form}>
                            {/* Form fields */}
                            <div className={styles.formGroup}>
                                <label>Item Title</label>
                                <input
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="e.g. Kids Bike"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea
                                    value={newItem.description}
                                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Condition, details, etc."
                                />
                            </div>
                            <div className={styles.flexibleRow}>
                                <div className={`${styles.formGroup} ${styles.flex1}`}>
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        value={newItem.price}
                                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                        disabled={newItem.isFree}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        checked={newItem.isFree}
                                        onChange={e => setNewItem({ ...newItem, isFree: e.target.checked })}
                                        id="free-check"
                                    />
                                    <label htmlFor="free-check">List as Free</label>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className={styles.submitButton} onClick={handleCreate}>Post Listing</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
