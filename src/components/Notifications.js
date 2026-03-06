'use client';
import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function Notifications() {
    const { currentUser, notifications, markNotificationRead } = useApp();

    const userNotifs = useMemo(() => {
        return notifications
            .filter(n => n.userId === currentUser?.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [currentUser, notifications]);

    const unreadCount = userNotifs.filter(n => !n.read).length;

    const formatTime = (d) => {
        const date = new Date(d);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const typeIcons = {
        success: '✅',
        info: '💡',
        warning: '⚠️',
        error: '❌',
    };

    const typeColors = {
        success: 'var(--success-400)',
        info: 'var(--primary-400)',
        warning: 'var(--warning-400)',
        error: 'var(--danger-400)',
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>🔔 Notifications</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Stay updated on your expense claims and approvals
                    </p>
                </div>
                {unreadCount > 0 && (
                    <span className="badge" style={{
                        background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)',
                        padding: '8px 16px', fontSize: '14px',
                    }}>
                        {unreadCount} unread
                    </span>
                )}
            </div>

            {userNotifs.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">🔔</div>
                        <div className="empty-state-title">No notifications</div>
                        <div className="empty-state-text">You&apos;re all caught up! Notifications will appear here when there are updates on your expenses.</div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {userNotifs.map(notif => (
                        <div
                            key={notif.id}
                            className="card"
                            style={{
                                padding: '16px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                cursor: 'pointer',
                                opacity: notif.read ? 0.6 : 1,
                                borderLeft: notif.read ? 'none' : `3px solid ${typeColors[notif.type]}`,
                            }}
                            onClick={() => !notif.read && markNotificationRead(notif.id)}
                        >
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: `${typeColors[notif.type]}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '18px', flexShrink: 0,
                            }}>
                                {typeIcons[notif.type]}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: notif.read ? 400 : 600, color: 'var(--text-primary)' }}>
                                    {notif.message}
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {formatTime(notif.date)}
                                </div>
                            </div>
                            {!notif.read && (
                                <div style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: typeColors[notif.type], flexShrink: 0,
                                }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
