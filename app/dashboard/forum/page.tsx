"use client";

import { useState, useEffect } from "react";
import styles from "./forum.module.css";
import { MessageSquare, Heart, Share2, Send, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCommunityPosts, createPost, createComment, toggleLike, ForumPost } from "@/app/actions/forum";
import { useUser } from "@/contexts/UserContext";

export default function ForumPage() {
    const router = useRouter();
    const { user } = useUser();
    const [newPost, setNewPost] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [newPostCategory, setNewPostCategory] = useState<string>("General");
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
    const [newComment, setNewComment] = useState("");

    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.communityId) {
            loadPosts();
        }
    }, [user?.communityId]);

    const loadPosts = async () => {
        if (!user?.communityId) return;
        setIsLoading(true);
        const res = await getCommunityPosts(user.communityId, user.id);
        if (res.success && res.data) {
            setPosts(res.data);

            // If a post is selected, refresh its data too
            if (selectedPost) {
                const refreshedPost = res.data.find((p: ForumPost) => p.id === selectedPost.id);
                if (refreshedPost) setSelectedPost(refreshedPost);
            }
        }
        setIsLoading(false);
    };

    const handlePost = async () => {
        if (!newPost.trim() || !user?.communityId || !user?.id) return;

        const res = await createPost({
            communityId: user.communityId,
            authorId: user.id,
            content: newPost,
            category: newPostCategory
        });

        if (res.success) {
            setNewPost("");
            setNewPostCategory("General");
            loadPosts();
        } else {
            alert("Failed to create post: " + res.error);
        }
    };

    const handleComment = async () => {
        if (!selectedPost || !newComment.trim() || !user?.id) return;

        const res = await createComment({
            postId: selectedPost.id,
            authorId: user.id,
            content: newComment
        });

        if (res.success) {
            setNewComment("");
            loadPosts(); // Refresh to update comments list
        } else {
            alert("Failed to add comment: " + res.error);
        }
    };

    const handleLike = async (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        if (!user?.id) return;

        // Optimistic update
        const updateLikeLocal = (post: ForumPost) => {
            if (post.id !== postId) return post;
            const isLiked = !!post.likedByMe;
            return {
                ...post,
                likes: isLiked ? post.likes - 1 : post.likes + 1,
                likedByMe: !isLiked
            };
        };

        setPosts(posts.map(updateLikeLocal));
        if (selectedPost && selectedPost.id === postId) {
            setSelectedPost(updateLikeLocal(selectedPost));
        }

        await toggleLike(postId, user.id);
    };

    const handleMessageUser = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        // Assuming we navigate to messages with the userId ?
        // Or handle looking up name. The previous code used userName.
        // My routing probably relies on user ID or needs lookup.
        // Let's pass ID for now.
        router.push(`/dashboard/messages?to=${userId}`);
    };

    const filteredPosts = activeCategory === "All"
        ? posts
        : posts.filter(post => post.category === activeCategory);

    const categories = ["All", "General", "Safety", "Events", "Lost & Found", "Recommendations"];
    const postCategories = ["General", "Safety", "Events", "Lost & Found", "Recommendations"];

    return (
        <div style={{ paddingBottom: '3rem' }}>
            {/* Post Details Modal */}
            {selectedPost && (
                <div className={styles.modalOverlay} onClick={() => setSelectedPost(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitle}>Post Details</div>
                            <button className={styles.closeButton} onClick={() => setSelectedPost(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.postHeader}>
                                <div className={styles.author}>
                                    <div className={styles.avatar}>{selectedPost.initials}</div>
                                    <div className={styles.authorInfo}>
                                        <div className={styles.authorName}>{selectedPost.author}</div>
                                        <div className={styles.timestamp}>{selectedPost.timestamp}</div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.postCategoryTag}>{selectedPost.category}</div>
                            <div className={styles.postContent} style={{ fontSize: '1.05rem' }}>{selectedPost.content}</div>

                            <div className={styles.commentSection}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Comments ({selectedPost.comments?.length || 0})</h3>
                                <div className={styles.commentsList}>
                                    {selectedPost.comments?.map(comment => (
                                        <div key={comment.id} className={styles.comment}>
                                            <div className={styles.commentAvatar}>{comment.authorName.charAt(0)}</div>
                                            <div className={styles.commentContent}>
                                                <div className={styles.commentAuthor}>
                                                    {comment.authorName}
                                                    <span className={styles.commentTime}>{comment.timestamp}</span>
                                                </div>
                                                <div>{comment.content}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.commentInputArea}>
                            <div className={styles.commentInputWrapper}>
                                <input
                                    className={styles.commentInput}
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                                    autoFocus
                                />
                                <button className={styles.sendCommentButton} onClick={handleComment}>
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.feed}>
                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Community Forum</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Discuss neighborhood matters, ask questions, and share updates.</p>
                </div>

                {/* Category Filter */}
                <div className={styles.categoryFilter}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterPill} ${activeCategory === cat ? styles.activeFilter : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Create Post Widget */}
                {user && (
                    <div className={styles.createPost}>
                        <textarea
                            className={styles.postInput}
                            placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
                            value={newPost}
                            onChange={e => setNewPost(e.target.value)}
                        />
                        <div className={styles.postActions}>
                            <select
                                className={styles.selectCategory}
                                value={newPostCategory}
                                onChange={(e) => setNewPostCategory(e.target.value)}
                            >
                                {postCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <button className={styles.button} onClick={handlePost}>Post Update</button>
                        </div>
                    </div>
                )}

                {/* Feed */}
                {isLoading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>Loading posts...</div>
                ) : filteredPosts.map(post => (
                    <div
                        key={post.id}
                        className={styles.post}
                        onClick={() => setSelectedPost(post)}
                    >
                        <div className={styles.postHeader}>
                            <div className={styles.author}>
                                <div className={styles.avatar}>{post.initials}</div>
                                <div className={styles.authorInfo}>
                                    <div className={styles.authorName}>{post.author}</div>
                                    <div className={styles.timestamp}>{post.timestamp}</div>
                                </div>
                            </div>
                            {post.authorId !== user?.id && (
                                <button
                                    className={styles.messageButton}
                                    onClick={(e) => handleMessageUser(e, post.authorId)}
                                >
                                    <MessageCircle size={14} />
                                    Message
                                </button>
                            )}
                        </div>

                        <div className={styles.postCategoryTag}>
                            {post.category}
                        </div>

                        <div className={styles.postContent}>
                            {post.content}
                        </div>
                        <div className={styles.postFooter}>
                            <button
                                className={styles.actionButton}
                                onClick={(e) => handleLike(e, post.id)}
                                style={{ color: post.likedByMe ? '#ef4444' : undefined }}
                            >
                                <Heart size={18} fill={post.likedByMe ? "currentColor" : "none"} />
                                {post.likes} Likes
                            </button>
                            <button className={styles.actionButton}>
                                <MessageSquare size={18} />
                                {post.comments?.length || 0} Comments
                            </button>
                            <button className={styles.actionButton}>
                                <Share2 size={18} />
                                Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
