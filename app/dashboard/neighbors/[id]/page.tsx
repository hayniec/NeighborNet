"use client";

import { use, useState, useEffect } from "react";
import styles from "./profile.module.css";
import { MapPin, Mail, Phone, Calendar, Star, MessageCircle, Shield, Award, PenTool } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNeighbor } from "@/app/actions/neighbors";

export default function NeighborProfile({ params }: { params: Promise<{ id: string }> }) {
    // Correctly unwrap params using React.use()
    const resolvedParams = use(params);
    const [neighbor, setNeighbor] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getNeighbor(resolvedParams.id);
                if (result.success && result.data) {
                    setNeighbor({
                        ...result.data,
                        initials: result.data.name.slice(0, 2).toUpperCase(),
                        status: result.data.isOnline ? 'Online' : 'Offline',
                        memberSince: result.data.joinedDate ? new Date(result.data.joinedDate).toLocaleDateString() : 'Unknown'
                    });
                }
            } catch (error) {
                console.error("Failed to load neighbor:", error);
            }
        };
        fetchData();
    }, [resolvedParams.id]);

    if (!neighbor) {
        return <div className={styles.loading}>Loading profile...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.coverImage}></div>

            <div className={styles.profileHeader}>
                <div className={styles.avatarWrapper}>
                    <div className={styles.avatar}>{neighbor.initials}</div>
                    <div className={`statusIndicator ${neighbor.status === 'Online' ? 'statusOnline' : 'statusOffline'}`} />
                </div>

                <div className={styles.headerContent}>
                    <div className={styles.nameRow}>
                        <h1 className={styles.name}>{neighbor.name}</h1>
                        {neighbor.role === 'Board Member' && (
                            <span className={styles.boardBadge}>
                                <Shield size={14} /> Board Member
                            </span>
                        )}
                    </div>

                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <MapPin size={16} />
                            {neighbor.address}
                        </div>
                        <div className={styles.metaItem}>
                            <Calendar size={16} />
                            Resident since {neighbor.memberSince}
                        </div>
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <Link href={`/dashboard/messages?new=${neighbor.id}`} className={styles.messageButton}>
                        <MessageCircle size={18} />
                        Message
                    </Link>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Left Column: Info */}
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Contact Info</h3>
                        <div className={styles.contactList}>
                            <div className={styles.contactItem}>
                                <Mail size={16} className={styles.icon} />
                                <span>{neighbor.email || "email@example.com"}</span>
                            </div>
                            <div className={styles.contactItem}>
                                <Phone size={16} className={styles.icon} />
                                <span>{neighbor.phone || "(555) 123-4567"}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Skills & Interests</h3>
                        <div className={styles.tags}>
                            {neighbor.skills.map((skill: string) => (
                                <span key={skill} className={styles.tag}>
                                    {skill}
                                </span>
                            ))}
                            {neighbor.interests?.map((interest: string) => (
                                <span key={interest} className={styles.tagSecondary}>
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Activity */}
                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>
                            <Award size={20} className={styles.titleIcon} />
                            Community Contributions
                        </h3>
                        <div className={styles.statsRow}>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>12</span>
                                <span className={styles.statLabel}>Events Hosted</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>45</span>
                                <span className={styles.statLabel}>Helpful Votes</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statValue}>8</span>
                                <span className={styles.statLabel}>Tools Shared</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Recent Activity</h3>
                        <div className={styles.activityList}>
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon}><PenTool size={14} /></div>
                                <div>
                                    <p className={styles.activityText}>Posted in <strong>General Discussion</strong></p>
                                    <span className={styles.activityTime}>2 days ago</span>
                                </div>
                            </div>
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon}><Star size={14} /></div>
                                <div>
                                    <p className={styles.activityText}>Recommended <strong>Joe's Handyman</strong></p>
                                    <span className={styles.activityTime}>1 week ago</span>
                                </div>
                            </div>
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon}><Calendar size={14} /></div>
                                <div>
                                    <p className={styles.activityText}>RSVP'd to <strong>Community BBQ</strong></p>
                                    <span className={styles.activityTime}>2 weeks ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
