'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function FinanceCenter() {
    const { expenses, categories, getUser, settleExpense, approveExpense } = useApp();
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState('');
    const [receiptViewModal, setReceiptViewModal] = useState(null);
    const [settleModal, setSettleModal] = useState(null);
    const [paymentMode, setPaymentMode] = useState('NEFT');

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
        selectedIds.forEach(id => settleExpense(id, paymentMode));
        setSelectedIds([]);
    };

    const handleSettle = (id) => {
        setSettleModal(id);
    };

    const confirmSettle = () => {
        if (settleModal) {
            settleExpense(settleModal, paymentMode);
            setSelectedIds(prev => prev.filter(x => x !== settleModal));
            setSettleModal(null);
        }
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
                                <th>Receipt</th>
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
                                            {exp.receiptData && (exp.receiptType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(exp.receiptName || '')) ? (
                                                <img
                                                    src={exp.receiptData}
                                                    alt="Receipt"
                                                    onClick={() => setReceiptViewModal(exp)}
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border-color)',
                                                        cursor: 'pointer',
                                                    }}
                                                />
                                            ) : exp.receiptName ? (
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📎 {exp.receiptName}</span>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                                            )}
                                        </td>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <select
                            value={paymentMode}
                            onChange={(e) => setPaymentMode(e.target.value)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                fontSize: '13px',
                                fontWeight: 600,
                            }}
                        >
                            <option value="NEFT">🏦 NEFT</option>
                            <option value="RTGS">⚡ RTGS</option>
                            <option value="UPI">📱 UPI</option>
                        </select>
                        <button className="btn btn-success" onClick={handleBulkSettle}>
                            💰 Settle All
                        </button>
                    </div>
                </div>
            )}

            {/* Settlement Confirmation Modal */}
            {settleModal && (() => {
                const exp = expenses.find(e => e.id === settleModal);
                const employee = exp ? getUser(exp.userId) : null;
                return (
                    <div className="modal-overlay" onClick={() => setSettleModal(null)}>
                        <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                            <div className="modal-header">
                                <div className="modal-title">🏦 Confirm Settlement</div>
                                <button className="modal-close" onClick={() => setSettleModal(null)}>✕</button>
                            </div>
                            {exp && (
                                <div style={{ padding: '0 24px' }}>
                                    <div style={{
                                        background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                                        padding: '16px', marginBottom: '16px',
                                    }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Employee</div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{employee?.name}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</div>
                                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--success-400)', marginTop: '2px' }}>{formatCurrency(exp.amount)}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expense ID</div>
                                                <div style={{ fontSize: '13px', fontFamily: 'monospace', marginTop: '2px' }}>{exp.id}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</div>
                                                <div style={{ fontSize: '13px', marginTop: '2px' }}>{employee?.department}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Payment Mode</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {['NEFT', 'RTGS', 'UPI'].map(mode => (
                                                <button
                                                    key={mode}
                                                    className={`btn ${paymentMode === mode ? 'btn-primary' : 'btn-outline'} btn-sm`}
                                                    onClick={() => setPaymentMode(mode)}
                                                    style={{ flex: 1 }}
                                                >
                                                    {mode === 'NEFT' ? '🏦' : mode === 'RTGS' ? '⚡' : '📱'} {mode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success-400)',
                                        borderRadius: 'var(--radius-md)', padding: '12px', marginTop: '8px', marginBottom: '8px',
                                        fontSize: '12px', color: 'var(--success-400)',
                                    }}>
                                        ✅ Payment will be processed via {paymentMode} to {employee?.name}'s registered bank account. A transaction reference will be generated automatically.
                                    </div>
                                </div>
                            )}
                            <div className="modal-footer">
                                <button className="btn btn-outline" onClick={() => setSettleModal(null)}>Cancel</button>
                                <button className="btn btn-success" onClick={confirmSettle}>
                                    💰 Settle via {paymentMode}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Receipt Lightbox Modal */}
            {receiptViewModal && (
                <div className="modal-overlay" onClick={() => setReceiptViewModal(null)} style={{ zIndex: 200 }}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', padding: 0, overflow: 'hidden' }}>
                        <div className="modal-header" style={{ padding: '16px 20px' }}>
                            <div>
                                <div className="modal-title">🧾 Receipt - {receiptViewModal.id}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {receiptViewModal.receiptName} · {getUser(receiptViewModal.userId)?.name}
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setReceiptViewModal(null)}>✕</button>
                        </div>
                        <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
                            <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                                <a
                                    href={receiptViewModal.receiptData}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline btn-sm"
                                >
                                    🔍 Open Full Original Receipt
                                </a>
                            </div>
                            {receiptViewModal.receiptData && (receiptViewModal.receiptType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(receiptViewModal.receiptName || '')) ? (
                                <img
                                    src={receiptViewModal.receiptData}
                                    alt="Receipt"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border-color)',
                                    }}
                                />
                            ) : (
                                <div style={{ padding: '40px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                                    📄 {receiptViewModal.receiptName}
                                    <br />
                                    <a
                                        href={receiptViewModal.receiptData}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary btn-sm"
                                        style={{ marginTop: '16px', display: 'inline-flex' }}
                                    >
                                        ⬇ Download / View Document
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
