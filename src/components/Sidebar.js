'use client';
import { useApp } from '@/context/AppContext';

export default function Sidebar({ activePage, onNavigate }) {
    const { currentUser, getPendingApprovals, notifications, logout } = useApp();

    const pendingCount = getPendingApprovals().length;
    const unreadNotifs = notifications.filter(n => n.userId === currentUser?.id && !n.read).length;

    const navItems = [
        {
            section: 'Main', items: [
                { id: 'dashboard', icon: '📊', label: 'Dashboard' },
                { id: 'submit', icon: '➕', label: 'Submit Expense' },
                { id: 'my-expenses', icon: '📋', label: 'My Expenses' },
            ]
        },
        ...(currentUser?.role === 'manager' || currentUser?.role === 'hod' ? [{
            section: 'Approvals', items: [
                { id: 'approvals', icon: '✅', label: 'Approval Queue', badge: pendingCount || null },
            ]
        }] : []),
        ...(currentUser?.role === 'finance' ? [{
            section: 'Finance', items: [
                { id: 'finance', icon: '🏦', label: 'Command Centre', badge: pendingCount || null },
            ]
        }] : []),
        {
            section: 'System', items: [
                { id: 'policies', icon: '📜', label: 'Policy & Limits' },
                { id: 'reports', icon: '📈', label: 'Reports' },
                { id: 'notifications', icon: '🔔', label: 'Notifications', badge: unreadNotifs || null },
            ]
        },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">💳</div>
                <div>
                    <h1>ExpensifyPro</h1>
                    <span>Expense Portal</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(section => (
                    <div key={section.section}>
                        <div className="sidebar-section-title">{section.section}</div>
                        {section.items.map(item => (
                            <button
                                key={item.id}
                                className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
                                onClick={() => onNavigate(item.id)}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                            </button>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-avatar">{currentUser?.avatar}</div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">{currentUser?.name}</div>
                    <div className="sidebar-user-role">{currentUser?.role} · Grade {currentUser?.grade}</div>
                </div>
                <button className="btn-ghost" onClick={logout} title="Logout" style={{ fontSize: '16px', padding: '6px' }}>🚪</button>
            </div>
        </aside>
    );
}
