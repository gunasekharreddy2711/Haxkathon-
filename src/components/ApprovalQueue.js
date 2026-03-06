'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function ApprovalQueue() {
    const { currentUser, getPendingApprovals, categories, getUser, approveExpense, rejectExpense } = useApp();
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectComment, setRejectComment] = useState('');
    const [approveComment, setApproveComment] = useState('');
    const [approveModal, setApproveModal] = useState(null);

    const pendingApprovals = getPendingApprovals();
    const level = currentUser?.role === 'manager' ? 'manager' : currentUser?.role === 'hod' ? 'hod' : 'finance';

    const formatCurrency = (amt) => '₹' + amt.toLocaleString('en-IN');
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleApprove = (expenseId) => {
        approveExpense(expenseId, level, approveComment || 'Approved');
        setApproveModal(null);
        setApproveComment('');
    };

    const handleReject = () => {
        if (!rejectComment.trim()) return;
        rejectExpense(rejectModal, level, rejectComment);
        setRejectModal(null);
        setRejectComment('');
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Approval Queue</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Review and approve expense claims as {currentUser?.role?.toUpperCase()}
                    </p>
                </div>
                <div className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', padding: '8px 16px', fontSize: '14px' }}>
                    {pendingApprovals.length} Pending
                </div>
            </div>

            {pendingApprovals.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">✅</div>
                        <div className="empty-state-title">All caught up!</div>
                        <div className="empty-state-text">No expenses waiting for your approval right now.</div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingApprovals.map(exp => {
                        const cat = categories.find(c => c.id === exp.categoryId);
                        const employee = getUser(exp.userId);
                        const policyCheck = currentUser ? null : null; // Could add policy checking here

                        return (
                            <div key={exp.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    {/* Employee Avatar */}
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '16px', color: 'white', flexShrink: 0,
                                    }}>
                                        {employee?.avatar}
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 700 }}>{employee?.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {employee?.department} · Grade {employee?.grade} · {formatDate(exp.date)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '22px', fontWeight: 800 }}>{formatCurrency(exp.amount)}</div>
                                                <span className={`badge ${exp.status}`} style={{ fontSize: '10px' }}>
                                                    <span className="badge-dot"></span>
                                                    {exp.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{
                                            background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                                            padding: '12px 16px', marginBottom: '12px',
                                        }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                {cat?.icon} {cat?.name}
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{exp.description}</div>
                                            {exp.receiptName && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    📎 {exp.receiptName}
                                                </div>
                                            )}
                                        </div>

                                        {/* Previous approvals */}
                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                            {exp.approvals.filter(a => a.status === 'approved').map(a => (
                                                <div key={a.level} style={{ fontSize: '11px', color: 'var(--success-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    ✓ {a.level.charAt(0).toUpperCase() + a.level.slice(1)}: {getUser(a.userId)?.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{
                                    padding: '14px 24px', background: 'rgba(15, 23, 42, 0.4)',
                                    borderTop: '1px solid var(--border-color)',
                                    display: 'flex', justifyContent: 'flex-end', gap: '10px',
                                }}>
                                    <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(exp.id); setRejectComment(''); }}>
                                        ✕ Reject
                                    </button>
                                    <button className="btn btn-success btn-sm" onClick={() => { setApproveModal(exp.id); setApproveComment(''); }}>
                                        ✓ Approve
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Approve Modal */}
            {approveModal && (
                <div className="modal-overlay" onClick={() => setApproveModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">✅ Approve Expense</div>
                            <button className="modal-close" onClick={() => setApproveModal(null)}>✕</button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Comment (optional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Add an optional comment..."
                                value={approveComment}
                                onChange={e => setApproveComment(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setApproveModal(null)}>Cancel</button>
                            <button className="btn btn-success" onClick={() => handleApprove(approveModal)}>Approve</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModal && (
                <div className="modal-overlay" onClick={() => setRejectModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">❌ Reject Expense</div>
                            <button className="modal-close" onClick={() => setRejectModal(null)}>✕</button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reason for rejection *</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Please provide a reason for rejection..."
                                value={rejectComment}
                                onChange={e => setRejectComment(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setRejectModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleReject} disabled={!rejectComment.trim()}>Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
