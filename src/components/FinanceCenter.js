'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function FinanceCenter() {
    const { expenses, categories, getUser, settleExpense, approveExpense } = useApp();
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState('');

    const formatCurrency = (amt) => '₹' + amt.toLocaleString('en-IN');
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    // Expenses ready for finance (HOD approved)
    const readyForSettlement = useMemo(() => {
        return expenses.filter(exp => {
            const hodApproval = exp.approvals.find(a => a.level === 'hod');
            const finApproval = exp.approvals.find(a => a.level === 'finance');
            return hodApproval?.status === 'approved' && finApproval?.status === 'pending';
        });
    }, [expenses]);

    const settledExpenses = useMemo(() => {
        return expenses.filter(e => e.status === 'settled');
    }, [expenses]);

    const rejectedExpenses = useMemo(() => {
        return expenses.filter(e => e.status === 'rejected');
    }, [expenses]);

    const allExpenses = useMemo(() => {
        let list = activeTab === 'pending' ? readyForSettlement : activeTab === 'settled' ? settledExpenses : activeTab === 'rejected' ? rejectedExpenses : expenses;
        if (search) {
            list = list.filter(e =>
                e.description.toLowerCase().includes(search.toLowerCase()) ||
                e.id.toLowerCase().includes(search.toLowerCase()) ||
                getUser(e.userId)?.name.toLowerCase().includes(search.toLowerCase())
            );
        }
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [activeTab, readyForSettlement, settledExpenses, rejectedExpenses, expenses, search, getUser]);

    const stats = useMemo(() => ({
        totalPending: readyForSettlement.reduce((s, e) => s + e.amount, 0),
        pendingCount: readyForSettlement.length,
        totalSettled: settledExpenses.reduce((s, e) => s + e.amount, 0),
        settledCount: settledExpenses.length,
        totalAll: expenses.reduce((s, e) => s + e.amount, 0),
        totalCount: expenses.length,
    }), [readyForSettlement, settledExpenses, expenses]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAll = () => {
        if (selectedIds.length === readyForSettlement.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(readyForSettlement.map(e => e.id));
        }
    };

    const handleBulkSettle = () => {
        selectedIds.forEach(id => settleExpense(id));
        setSelectedIds([]);
    };

    const handleSettle = (id) => {
        settleExpense(id);
        setSelectedIds(prev => prev.filter(x => x !== id));
    };

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>🏦 Finance Command Centre</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Audit, approve, and settle expense claims
                </p>
            </div>

            {/* Finance Stats */}
            <div className="stats-grid">
                <div className="stat-card warning">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Pending Settlement</span>
                        <div className="stat-card-icon warning">⏳</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.totalPending)}</div>
                    <div className="stat-card-change">
                        📋 {stats.pendingCount} claims ready
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Settled</span>
                        <div className="stat-card-icon success">✅</div>
                    </div>
                    <div className="stat-card-value">{formatCurrency(stats.totalSettled)}</div>
                    <div className="stat-card-change positive">
                        💰 {stats.settledCount} paid
                    </div>
                </div>

                <div className="stat-card primary">
                    <div className="stat-card-header">
                        <span className="stat-card-label">Total Claims</span>
                        <div className="stat-card-icon primary">📊</div>
                    </div>
                    <div className="stat-card-value">{stats.totalCount}</div>
                    <div className="stat-card-change">
                        {formatCurrency(stats.totalAll)} total value
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
                    Pending Settlement ({readyForSettlement.length})
                </button>
                <button className={`tab ${activeTab === 'settled' ? 'active' : ''}`} onClick={() => setActiveTab('settled')}>
                    Settled ({settledExpenses.length})
                </button>
                <button className={`tab ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>
                    Rejected ({rejectedExpenses.length})
                </button>
                <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
                    All Claims ({expenses.length})
                </button>
            </div>

            {/* Toolbar */}
            <div className="filter-bar">
                <div className="search-wrapper">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, ID, or description..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {activeTab === 'pending' && selectedIds.length > 0 && (
                    <button className="btn btn-success btn-sm" onClick={handleBulkSettle}>
                        💰 Settle Selected ({selectedIds.length})
                    </button>
                )}
            </div>

            {/* Table */}
            {allExpenses.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <div className="empty-state-title">No claims found</div>
                        <div className="empty-state-text">No expense claims match the current filter.</div>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                {activeTab === 'pending' && (
                                    <th style={{ width: '40px' }}>
                                        <label className="checkbox-wrapper">
                                            <input type="checkbox" className="checkbox" checked={selectedIds.length === readyForSettlement.length && readyForSettlement.length > 0} onChange={selectAll} />
                                        </label>
                                    </th>
                                )}
                                <th>ID</th>
                                <th>Employee</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                {activeTab === 'pending' && <th>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {allExpenses.map(exp => {
                                const cat = categories.find(c => c.id === exp.categoryId);
                                const employee = getUser(exp.userId);
                                return (
                                    <tr key={exp.id}>
                                        {activeTab === 'pending' && (
                                            <td>
                                                <label className="checkbox-wrapper">
                                                    <input type="checkbox" className="checkbox" checked={selectedIds.includes(exp.id)} onChange={() => toggleSelect(exp.id)} />
                                                </label>
                                            </td>
                                        )}
                                        <td style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600 }}>{exp.id}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '28px', height: '28px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '10px', fontWeight: 700, color: 'white', flexShrink: 0,
                                                }}>
                                                    {employee?.avatar}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{employee?.name}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{employee?.department} · Grade {employee?.grade}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                                {cat?.icon} {cat?.name}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                                            {exp.description}
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>{formatDate(exp.date)}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{formatCurrency(exp.amount)}</td>
                                        <td>
                                            <span className={`badge ${exp.status}`}>
                                                <span className="badge-dot"></span>
                                                {exp.status}
                                            </span>
                                        </td>
                                        {activeTab === 'pending' && (
                                            <td>
                                                <button className="btn btn-success btn-sm" onClick={() => handleSettle(exp.id)}>
                                                    💰 Settle
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bulk settle summary */}
            {activeTab === 'pending' && selectedIds.length > 0 && (
                <div style={{
                    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--primary-400)',
                    borderRadius: 'var(--radius-xl)', padding: '14px 28px',
                    display: 'flex', alignItems: 'center', gap: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 100,
                }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                        {selectedIds.length} selected · {formatCurrency(readyForSettlement.filter(e => selectedIds.includes(e.id)).reduce((s, e) => s + e.amount, 0))}
                    </span>
                    <button className="btn btn-success" onClick={handleBulkSettle}>
                        💰 Settle All via Bank Transfer
                    </button>
                </div>
            )}
        </div>
    );
}
