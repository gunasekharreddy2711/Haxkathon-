'use client';
import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function Dashboard() {
    const { currentUser, expenses, categories, getUser } = useApp();

    const stats = useMemo(() => {
        const userExpenses = expenses.filter(e => e.userId === currentUser?.id);
        const totalClaimed = userExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalReimbursed = userExpenses.filter(e => e.status === 'settled').reduce((sum, e) => sum + e.amount, 0);
        const pendingAmount = userExpenses.filter(e => e.status === 'pending' || e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
        const rejectedAmount = userExpenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0);
        const pendingCount = userExpenses.filter(e => e.status === 'pending').length;
        const approvedCount = userExpenses.filter(e => e.status === 'approved' || e.status === 'settled').length;
        const rejectedCount = userExpenses.filter(e => e.status === 'rejected').length;

        return { totalClaimed, totalReimbursed, pendingAmount, rejectedAmount, pendingCount, approvedCount, rejectedCount, total: userExpenses.length };
    }, [currentUser, expenses]);

    const recentExpenses = useMemo(() => {
        return expenses
            .filter(e => e.userId === currentUser?.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
    }, [currentUser, expenses]);

    const categoryBreakdown = useMemo(() => {
        const userExpenses = expenses.filter(e => e.userId === currentUser?.id);
        const breakdown = {};
        userExpenses.forEach(exp => {
            const cat = categories.find(c => c.id === exp.categoryId);
            if (cat) {
                if (!breakdown[cat.name]) breakdown[cat.name] = { name: cat.name, icon: cat.icon, amount: 0, count: 0 };
                breakdown[cat.name].amount += exp.amount;
                breakdown[cat.name].count += 1;
            }
        });
        return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
    }, [currentUser, expenses, categories]);

    const formatCurrency = (amt) => '₹' + amt.toLocaleString('en-IN');

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
                    Welcome back, {currentUser?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Here&apos;s your expense overview for this month
                </p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Claimed</span>
                        <div className="stat-card-icon primary">💰</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.totalClaimed)}</div>
                    <div className="stat-card-change positive">
                        <span>📊</span> {stats.total} total claims
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Reimbursed</span>
                        <div className="stat-card-icon success">✅</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.totalReimbursed)}</div>
                    <div className="stat-card-change positive">
                        <span>↑</span> {stats.approvedCount} approved
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Pending</span>
                        <div className="stat-card-icon warning">⏳</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.pendingAmount)}</div>
                    <div className="stat-card-change">
                        <span>🔄</span> {stats.pendingCount} awaiting review
                    </div>
                </div>

                <div className="stat-card danger">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Rejected</span>
                        <div className="stat-card-icon danger">❌</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.rejectedAmount)}</div>
                    <div className="stat-card-change negative">
                        <span>↓</span> {stats.rejectedCount} rejected
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Recent Expenses */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Recent Expenses</div>
                            <div className="card-subtitle">Your latest expense submissions</div>
                        </div>
                    </div>
                    {recentExpenses.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📭</div>
                            <div className="empty-state-title">No expenses yet</div>
                            <div className="empty-state-text">Submit your first expense claim to get started</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentExpenses.map(exp => {
                                const cat = categories.find(c => c.id === exp.categoryId);
                                return (
                                    <div key={exp.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px',
                                        background: 'rgba(15, 23, 42, 0.4)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '18px', flexShrink: 0,
                                        }}>
                                            {cat?.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {exp.description}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                {cat?.name} · {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatCurrency(exp.amount)}</div>
                                            <span className={`badge ${exp.status}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                                                <span className="badge-dot"></span>
                                                {exp.status}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Spending by Category</div>
                            <div className="card-subtitle">Where your money goes</div>
                        </div>
                    </div>
                    {categoryBreakdown.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📊</div>
                            <div className="empty-state-title">No data</div>
                            <div className="empty-state-text">Submit expenses to see category breakdown</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {categoryBreakdown.map(cat => {
                                const maxAmount = categoryBreakdown[0]?.amount || 1;
                                const percentage = Math.round((cat.amount / maxAmount) * 100);
                                return (
                                    <div key={cat.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {cat.icon} {cat.name}
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({cat.count})</span>
                                            </span>
                                            <span style={{ fontSize: '13px', fontWeight: 700 }}>{formatCurrency(cat.amount)}</span>
                                        </div>
                                        <div style={{
                                            height: '6px',
                                            background: 'var(--bg-tertiary)',
                                            borderRadius: 'var(--radius-full)',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${percentage}%`,
                                                background: 'linear-gradient(90deg, var(--primary-400), var(--primary-600))',
                                                borderRadius: 'var(--radius-full)',
                                                transition: 'width 0.8s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
