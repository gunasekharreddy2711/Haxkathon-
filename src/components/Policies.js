'use client';
import { useApp } from '@/context/AppContext';

export default function Policies() {
    const { categories, policyLimits } = useApp();

    const grades = ['A', 'B', 'C'];
    const formatCurrency = (amt) => '₹' + amt.toLocaleString('en-IN');

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>📜 Policy & Spending Limits</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Expense limits by employee grade and category. Claims exceeding these limits will be flagged.
                </p>
            </div>

            {/* Grade Overview */}
            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                {grades.map(grade => {
                    const limits = policyLimits.filter(p => p.grade === grade);
                    const totalLimit = limits.reduce((s, l) => s + l.limit, 0);
                    const colors = { A: 'primary', B: 'success', C: 'warning' };
                    return (
                        <div key={grade} className={`stat-card ${colors[grade]}`}>
                            <div className="stat-card-header">
                                <span className="stat-card-label">Grade {grade}</span>
                                <div className={`stat-card-icon ${colors[grade]}`}>
                                    {grade === 'A' ? '👑' : grade === 'B' ? '⭐' : '🔹'}
                                </div>
                            </div>
                            <div className="stat-card-value" style={{ fontSize: '20px' }}>
                                {grade === 'A' ? 'Senior' : grade === 'B' ? 'Mid-Level' : 'Junior'}
                            </div>
                            <div className="stat-card-change">
                                {categories.length} categories · Avg {formatCurrency(Math.round(totalLimit / limits.length))}/limit
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Policy Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Spending Limits Matrix</div>
                        <div className="card-subtitle">Maximum allowed amount per category per grade</div>
                    </div>
                </div>

                <div className="table-container" style={{ border: 'none' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                {grades.map(g => (
                                    <th key={g} style={{ textAlign: 'center' }}>
                                        Grade {g}
                                    </th>
                                ))}
                                <th style={{ textAlign: 'center' }}>Period</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => {
                                const policies = grades.map(g => policyLimits.find(p => p.grade === g && p.categoryId === cat.id));
                                return (
                                    <tr key={cat.id}>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                                                <span style={{
                                                    width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                                                    background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: '18px',
                                                }}>
                                                    {cat.icon}
                                                </span>
                                                <div>
                                                    <div style={{ fontSize: '14px' }}>{cat.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400 }}>{cat.description}</div>
                                                </div>
                                            </span>
                                        </td>
                                        {policies.map((policy, i) => (
                                            <td key={i} style={{ textAlign: 'center' }}>
                                                <span style={{
                                                    fontWeight: 700,
                                                    fontSize: '15px',
                                                    color: i === 0 ? 'var(--primary-400)' : i === 1 ? 'var(--success-400)' : 'var(--warning-400)',
                                                }}>
                                                    {policy ? formatCurrency(policy.limit) : '—'}
                                                </span>
                                            </td>
                                        ))}
                                        <td style={{ textAlign: 'center' }}>
                                            <span className="badge" style={{
                                                background: 'rgba(148, 163, 184, 0.1)',
                                                color: 'var(--text-secondary)',
                                                fontSize: '11px',
                                            }}>
                                                {policies[0]?.period?.replace(/_/g, ' ') || '—'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rules */}
            <div className="grid-2" style={{ marginTop: '24px' }}>
                <div className="card">
                    <div className="card-title" style={{ marginBottom: '16px' }}>📋 General Rules</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            'Claims must be submitted within 7 days of the expense date',
                            'Original receipts/invoices required for amounts above ₹500',
                            'Claims exceeding policy limits require additional justification',
                            'Duplicate claims will be automatically flagged and rejected',
                            'All claims follow Manager → HOD → Finance approval workflow',
                        ].map((rule, i) => (
                            <div key={i} style={{
                                display: 'flex', gap: '10px', padding: '10px 12px',
                                background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)',
                                fontSize: '13px', color: 'var(--text-secondary)',
                            }}>
                                <span style={{ color: 'var(--primary-400)', fontWeight: 700 }}>{i + 1}.</span> {rule}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-title" style={{ marginBottom: '16px' }}>⚡ Approval SLA</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { level: 'Manager Review', time: '24 hours', icon: '👤' },
                            { level: 'HOD Review', time: '48 hours', icon: '👔' },
                            { level: 'Finance Settlement', time: '72 hours', icon: '🏦' },
                            { level: 'Bank Transfer', time: 'Next business day', icon: '💰' },
                        ].map((sla, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 14px', background: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: 'var(--radius-md)',
                            }}>
                                <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {sla.icon} {sla.level}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-400)' }}>{sla.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
