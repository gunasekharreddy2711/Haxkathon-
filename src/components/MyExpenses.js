'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function MyExpenses() {
    const { currentUser, expenses, categories, getUser } = useApp();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedExpense, setSelectedExpense] = useState(null);

    const userExpenses = useMemo(() => {
        let filtered = expenses.filter(e => e.userId === currentUser?.id);
        if (filter !== 'all') filtered = filtered.filter(e => e.status === filter);
        if (search) filtered = filtered.filter(e =>
            e.description.toLowerCase().includes(search.toLowerCase()) ||
            e.id.toLowerCase().includes(search.toLowerCase())
        );
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [currentUser, expenses, filter, search]);

    const formatCurrency = (amt) => '₹' + amt.toLocaleString('en-IN');
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>My Expenses</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track all your expense claims and their approval status</p>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by description or ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {['all', 'pending', 'approved', 'rejected', 'settled'].map(f => (
                    <button
                        key={f}
                        className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Expenses Table */}
            {userExpenses.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-title">No expenses found</div>
                        <div className="empty-state-text">
                            {filter !== 'all' ? `No ${filter} expenses. Try another filter.` : 'Submit your first expense to see it here.'}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userExpenses.map(exp => {
                                const cat = categories.find(c => c.id === exp.categoryId);
                                return (
                                    <tr key={exp.id}>
                                        <td style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>{exp.id}</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {cat?.icon} {cat?.name}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {exp.description}
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(exp.date)}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(exp.amount)}</td>
                                        <td>
                                            <span className={`badge ${exp.status}`}>
                                                <span className="badge-dot"></span>
                                                {exp.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => setSelectedExpense(selectedExpense?.id === exp.id ? null : exp)}
                                            >
                                                {selectedExpense?.id === exp.id ? '✖ Close' : '👁 Track'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Live Tracking Modal */}
            {selectedExpense && (
                <div className="modal-overlay" onClick={() => setSelectedExpense(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Live Tracking</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedExpense.id}</div>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedExpense(null)}>✕</button>
                        </div>

                        {/* Expense Details */}
                        <div style={{
                            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                            padding: '16px', marginBottom: '24px',
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                                        {categories.find(c => c.id === selectedExpense.categoryId)?.icon} {categories.find(c => c.id === selectedExpense.categoryId)?.name}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{formatCurrency(selectedExpense.amount)}</div>
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</div>
                                    <div style={{ fontSize: '14px', marginTop: '2px' }}>{selectedExpense.description}</div>
                                </div>
                            </div>
                        </div>

                        {/* Approval Progress */}
                        <div className="progress-tracker">
                            <div className="progress-step completed">
                                <div className="progress-step-dot">✓</div>
                                <div className="progress-step-label">Submitted</div>
                            </div>
                            {selectedExpense.approvals.map((approval, idx) => {
                                let stepClass = '';
                                if (approval.status === 'approved') stepClass = 'completed';
                                else if (approval.status === 'rejected') stepClass = 'rejected';
                                else {
                                    const prevApproved = idx === 0 || selectedExpense.approvals[idx - 1].status === 'approved';
                                    if (prevApproved) stepClass = 'active';
                                }
                                return (
                                    <div key={approval.level} className={`progress-step ${stepClass}`}>
                                        <div className="progress-step-dot">
                                            {approval.status === 'approved' ? '✓' : approval.status === 'rejected' ? '✕' : idx + 2}
                                        </div>
                                        <div className="progress-step-label">{approval.level.charAt(0).toUpperCase() + approval.level.slice(1)}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Approval Details */}
                        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selectedExpense.approvals.map(approval => {
                                const approver = getUser(approval.userId);
                                return (
                                    <div key={approval.level} style={{
                                        padding: '14px', borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)', background: 'rgba(15, 23, 42, 0.4)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>
                                                {approval.level.charAt(0).toUpperCase() + approval.level.slice(1)} Review
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                {approver?.name || 'Pending assignment'}
                                                {approval.date && ` · ${formatDate(approval.date)}`}
                                            </div>
                                            {approval.comment && (
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                                                    &quot;{approval.comment}&quot;
                                                </div>
                                            )}
                                        </div>
                                        <span className={`badge ${approval.status}`}>
                                            <span className="badge-dot"></span>
                                            {approval.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setSelectedExpense(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
