'use client';
import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function Reports() {
    const { expenses, categories, users, getUser } = useApp();

    const formatCurrency = (amt) => '₹' + amt.toLocaleString('en-IN');

    const stats = useMemo(() => {
        const total = expenses.reduce((s, e) => s + e.amount, 0);
        const settled = expenses.filter(e => e.status === 'settled').reduce((s, e) => s + e.amount, 0);
        const pending = expenses.filter(e => e.status === 'pending' || e.status === 'approved').reduce((s, e) => s + e.amount, 0);
        const rejected = expenses.filter(e => e.status === 'rejected').reduce((s, e) => s + e.amount, 0);

        const avgClaim = expenses.length > 0 ? Math.round(total / expenses.length) : 0;
        const approvalRate = expenses.length > 0 ? Math.round(((expenses.filter(e => e.status === 'approved' || e.status === 'settled').length) / expenses.length) * 100) : 0;

        return { total, settled, pending, rejected, avgClaim, approvalRate, count: expenses.length };
    }, [expenses]);

    const categoryStats = useMemo(() => {
        const byCategory = {};
        expenses.forEach(exp => {
            const cat = categories.find(c => c.id === exp.categoryId);
            if (cat) {
                if (!byCategory[cat.name]) byCategory[cat.name] = { name: cat.name, icon: cat.icon, total: 0, count: 0, approved: 0, rejected: 0 };
                byCategory[cat.name].total += exp.amount;
                byCategory[cat.name].count += 1;
                if (exp.status === 'approved' || exp.status === 'settled') byCategory[cat.name].approved += 1;
                if (exp.status === 'rejected') byCategory[cat.name].rejected += 1;
            }
        });
        return Object.values(byCategory).sort((a, b) => b.total - a.total);
    }, [expenses, categories]);

    const departmentStats = useMemo(() => {
        const byDept = {};
        expenses.forEach(exp => {
            const user = getUser(exp.userId);
            if (user) {
                if (!byDept[user.department]) byDept[user.department] = { name: user.department, total: 0, count: 0, employees: new Set() };
                byDept[user.department].total += exp.amount;
                byDept[user.department].count += 1;
                byDept[user.department].employees.add(user.id);
            }
        });
        return Object.values(byDept).map(d => ({ ...d, employees: d.employees.size })).sort((a, b) => b.total - a.total);
    }, [expenses, getUser]);

    const topClaimants = useMemo(() => {
        const byUser = {};
        expenses.forEach(exp => {
            if (!byUser[exp.userId]) byUser[exp.userId] = { userId: exp.userId, total: 0, count: 0 };
            byUser[exp.userId].total += exp.amount;
            byUser[exp.userId].count += 1;
        });
        return Object.values(byUser).sort((a, b) => b.total - a.total).slice(0, 5);
    }, [expenses]);

    const statusDistribution = useMemo(() => {
        const dist = { pending: 0, approved: 0, rejected: 0, settled: 0 };
        expenses.forEach(e => { if (dist[e.status] !== undefined) dist[e.status]++; });
        return dist;
    }, [expenses]);

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>📈 Reports & Analytics</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Insights and trends across expense claims
                </p>
            </div>

            {/* Overview Stats */}
            <div className="stats-grid">
                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Claims Value</span>
                        <div className="stat-card-icon primary">💰</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.total)}</div>
                    <div className="stat-card-change">{stats.count} total claims</div>
                </div>
                <div className="stat-card success">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Approval Rate</span>
                        <div className="stat-card-icon success">📊</div>
                    </div>
                    <div className="stat-card-value">{stats.approvalRate}%</div>
                    <div className="stat-card-change positive">Claims approved or settled</div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Average Claim</span>
                        <div className="stat-card-icon warning">📋</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.avgClaim)}</div>
                    <div className="stat-card-change">Per expense submission</div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Rejected Value</span>
                        <div className="stat-card-icon danger">❌</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.rejected)}</div>
                    <div className="stat-card-change negative">{expenses.filter(e => e.status === 'rejected').length} claims</div>
                </div>
            </div>

            <div className="grid-2">
                {/* Status Distribution */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Claim Status Distribution</div>
                            <div className="card-subtitle">Breakdown by current status</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(statusDistribution).map(([status, count]) => {
                            const total = expenses.length || 1;
                            const pct = Math.round((count / total) * 100);
                            const colors = {
                                pending: 'var(--warning-400)',
                                approved: 'var(--success-400)',
                                rejected: 'var(--danger-400)',
                                settled: 'var(--primary-400)',
                            };
                            return (
                                <div key={status}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: colors[status] }}>
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: `${pct}%`, background: colors[status],
                                            borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease',
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Claimants */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Top Claimants</div>
                            <div className="card-subtitle">Employees with highest total claims</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {topClaimants.map((item, idx) => {
                            const user = getUser(item.userId);
                            return (
                                <div key={item.userId} style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '12px', background: 'rgba(15, 23, 42, 0.4)',
                                    borderRadius: 'var(--radius-md)',
                                }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'var(--bg-tertiary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
                                    }}>
                                        {idx + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user?.department} · {item.count} claims</div>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatCurrency(item.total)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Spending by Category</div>
                            <div className="card-subtitle">Total amounts across all employees</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {categoryStats.map(cat => (
                            <div key={cat.name} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '12px', background: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{cat.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        {cat.count} claims · {cat.approved} approved · {cat.rejected} rejected
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '14px' }}>{formatCurrency(cat.total)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Stats */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <div className="card-title">Department Spending</div>
                            <div className="card-subtitle">Total claims by department</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {departmentStats.map(dept => {
                            const maxTotal = departmentStats[0]?.total || 1;
                            const pct = Math.round((dept.total / maxTotal) * 100);
                            return (
                                <div key={dept.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                                            🏢 {dept.name}
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                                                {dept.employees} employees · {dept.count} claims
                                            </span>
                                        </span>
                                        <span style={{ fontSize: '14px', fontWeight: 700 }}>{formatCurrency(dept.total)}</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', width: `${pct}%`,
                                            background: 'linear-gradient(90deg, var(--success-400), var(--success-600))',
                                            borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease',
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
