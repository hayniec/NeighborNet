"use client";

import { useState, useEffect, Suspense } from "react";
import styles from "./messages.module.css";
import { Send, User, MessageCircle, Plus } from "lucide-react";
import { MessageUserModal } from "@/components/dashboard/MessageUserModal";
import { getConversations, getThread, sendMessage } from "@/app/actions/messages";
import { useUser } from "@/contexts/UserContext";
import { useSearchParams } from "next/navigation";

// Local types matching what we expect from actions
interface Conversation {
    otherId: string;
    otherName: string;
    lastMessage: string;
    timestamp: Date;
    unreadCount: number;
}

interface DirectMessage {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
}

function MessagesContent() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const toId = searchParams.get("to");

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // New Message Modal State
    const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
    const [tempChatName, setTempChatName] = useState("");

    // Initial load
    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    // Handle "to" param
    useEffect(() => {
        if (toId && user && toId !== user.id) {
            setActiveChatId(toId);
        }
    }, [toId, user]);

    // Load thread when activeChatId changes
    useEffect(() => {
        if (activeChatId && user) {
            loadThread(activeChatId);
        }
    }, [activeChatId, user]);

    const loadConversations = async () => {
        if (!user?.id) return;
        setLoading(true);
        const res = await getConversations(user.id);
        if (res.success && res.data) {
            setConversations(res.data);
            // Default select first if none selected and not directed by URL
            // Only if we haven't manually selected one via modal (tempChatName check?)
            if (!activeChatId && !toId && res.data.length > 0 && !tempChatName) {
                setActiveChatId(res.data[0].otherId);
            }
        }
        setLoading(false);
    };

    const loadThread = async (otherId: string) => {
        if (!user?.id) return;
        const res = await getThread(user.id, otherId);
        if (res.success && res.data) {
            setMessages(res.data);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !user?.id || !activeChatId) return;

        // Optimistic append
        const tempMsg: DirectMessage = {
            id: 'temp-' + Date.now(),
            senderId: user.id,
            recipientId: activeChatId,
            content: newMessage,
            createdAt: new Date(),
            isRead: false
        };
        setMessages([...messages, tempMsg]);
        setNewMessage("");

        const res = await sendMessage(user.id, activeChatId, tempMsg.content);
        if (res.success && res.data) {
            // Refresh conversation list to update last message snippet
            loadConversations();
            // Replace temp with real (or re-fetch thread completely to be safe)
            const realMsg = res.data as DirectMessage;
            setMessages(prev => prev.map(m => m.id === tempMsg.id ? realMsg : m));
        } else {
            alert("Failed to send: " + res.error);
        }
    };

    const getActiveChatName = () => {
        const conv = conversations.find(c => c.otherId === activeChatId);
        return conv ? conv.otherName : (tempChatName || "Chat");
    };

    const handleSelectUser = (userId: string, userName: string) => {
        setActiveChatId(userId);
        setTempChatName(userName);
        setIsNewMessageModalOpen(false);
        // If this user is NOT in the list, we treat it as a fresh start.
        // The messages will likely be empty (or loaded if history exists but wasn't in list?)
        // If history exists, loadThread will find it.
    };

    return (
        <div className={styles.container}>
            {/* Sidebar List */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Messages</span>
                    <button
                        onClick={() => setIsNewMessageModalOpen(true)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--primary)', display: 'flex', alignItems: 'center'
                        }}
                        title="New Message"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className={styles.conversationList}>
                    {loading && conversations.length === 0 && <div style={{ padding: '1rem' }}>Loading...</div>}
                    {!loading && conversations.length === 0 && <div style={{ padding: '1rem', color: '#666' }}>No conversations yet.</div>}

                    {conversations.map(conv => (
                        <div
                            key={conv.otherId}
                            className={`${styles.conversationItem} ${activeChatId === conv.otherId ? styles.activeConversation : ''}`}
                            onClick={() => { setActiveChatId(conv.otherId); setTempChatName(""); }}
                        >
                            <div className={styles.conversationName}>{conv.otherName}</div>
                            <div className={styles.lastMessage}>{conv.lastMessage}</div>
                            {conv.unreadCount > 0 && <span className={styles.unreadBadge}>{conv.unreadCount}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={styles.chatArea}>
                {activeChatId ? (
                    <>
                        <div className={styles.chatHeader}>
                            <User size={20} />
                            {getActiveChatName()}
                        </div>

                        <div className={styles.messagesList}>
                            {messages.map(msg => (
                                <div key={msg.id} className={`${styles.messageBubble} ${msg.senderId === user?.id ? styles.sent : styles.received}`}>
                                    {msg.content}
                                </div>
                            ))}
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                    Start the conversation!
                                </div>
                            )}
                        </div>

                        <div className={styles.inputArea}>
                            <input
                                className={styles.input}
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button className={styles.sendButton} onClick={handleSendMessage}>
                                <Send size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <MessageCircle size={48} color="#ccc" />
                        <p>Select a conversation or start a new one.</p>
                        <button
                            onClick={() => setIsNewMessageModalOpen(true)}
                            style={{
                                marginTop: '1rem', padding: '0.5rem 1rem',
                                background: 'var(--primary)', color: 'white',
                                border: 'none', borderRadius: '4px', cursor: 'pointer'
                            }}
                        >
                            Start New Message
                        </button>
                    </div>
                )}
            </div>

            <MessageUserModal
                isOpen={isNewMessageModalOpen}
                onClose={() => setIsNewMessageModalOpen(false)}
                onSelectUser={handleSelectUser}
            />
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MessagesContent />
        </Suspense>
    );
}
