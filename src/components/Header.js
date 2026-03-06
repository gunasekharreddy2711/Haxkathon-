'use client';
import { useApp } from '@/context/AppContext';

export default function Header({ title, onNavigate }) {
    const { currentUser, notifications } = useApp();
    const unreadCount = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

    return (
        <header className="header">
            <h2 className="header-title">{title}</h2>
            <div className="header-actions">
                <button className="header-btn" onClick={() => onNavigate('notifications')} title="Notifications">
                    🔔
                    {unreadCount > 0 && <span className="notification-dot"></span>}
                </button>
                <button className="header-btn" title="Settings">⚙️</button>
            </div>
        </header>
    );
}
