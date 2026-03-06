'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function GroupExpenseRequests() {
    const { currentUser, getSharedExpenseRequests, confirmShareExpense, declineShareExpense, categories, getUser } = useApp();
    const [declineModal, setDeclineModal] = useState(null);
    const [declineReason, setDeclineReason] = useState('');

    const requests = getSharedExpenseRequests();
    const formatCurrency = (amt) => '₹' + amt.toLocaleString('en-IN');
    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleConfirm = (expenseId) => {
        confirmShareExpense(expenseId, currentUser.id);
    };

    const handleDecline = () => {
        if (declineModal) {
            declineShareExpense(declineModal, currentUser.id, declineReason);
            setDeclineModal(null);
            setDeclineReason('');
        }
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>👥 Group Expense Confirmations</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Colleagues have tagged you in shared expenses. Confirm or decline your share.
                    </p>
                </div>
                {requests.length > 0 && (
                    <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '8px 16px', fontSize: '14px' }}>
                        {requests.length} awaiting your response
                    </span>
                )}
            </div>

            {requests.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <div className="empty-state-title">No pending group confirmations</div>
                        <div className="empty-state-text">When colleagues tag you in a shared expense (like a team dinner), it will appear here for your confirmation.</div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {requests.map(exp => {
                        const cat = categories.find(c => c.id === exp.categoryId);
                        const owner = getUser(exp.userId);
                        const myShare = exp.sharedWith.find(s => s.userId === currentUser.id);

                        return (
                            <div key={exp.id} className="card" style={{ padding: 0, overflow: 'hidden', borderLeft: '4px solid #38bdf8' }}>
                                {/* Header */}
                                <div style={{ padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        {/* Owner avatar */}
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #38bdf8, var(--primary-600))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '16px', color: 'white', flexShrink: 0,
                                        }}>
                                            {owner?.avatar}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                <div>
                                                    <div style={{ fontSize: '16px', fontWeight: 700 }}>
                                                        {owner?.name} <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>tagged you</span>
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                        {owner?.department} · {formatDate(exp.date)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expense details */}
                                            <div style={{
                                                background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
                                                padding: '14px 16px', marginBottom: '16px',
                                            }}>
                                                <div style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                    {cat?.icon} {cat?.name}
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px' }}>{exp.description}</div>
                                                {exp.receiptName && (
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        📎 {exp.receiptName}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Amount breakdown */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                                <div style={{
                                                    padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', textAlign: 'center',
                                                }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Bill</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 800 }}>{formatCurrency(exp.amount)}</div>
                                                </div>
                                                <div style={{
                                                    padding: '12px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: 'var(--radius-md)', textAlign: 'center',
                                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                                }}>
                                                    <div style={{ fontSize: '11px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Your Share</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8' }}>{formatCurrency(myShare?.shareAmount || 0)}</div>
                                                </div>
                                                <div style={{
                                                    padding: '12px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', textAlign: 'center',
                                                }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Split Type</div>
                                                    <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'capitalize' }}>{exp.splitType || 'Equal'}</div>
                                                </div>
                                            </div>

                                            {/* Participants */}
                                            <div style={{ marginBottom: '4px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Participants ({exp.sharedWith.length + 1})
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {/* Owner */}
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '8px',
                                                        padding: '6px 12px', borderRadius: 'var(--radius-full)',
                                                        background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                                                        fontSize: '12px',
                                                    }}>
                                                        <span style={{
                                                            width: '22px', height: '22px', borderRadius: '50%',
                                                            background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '9px', fontWeight: 700, color: 'white',
                                                        }}>{owner?.avatar}</span>
                                                        <span style={{ fontWeight: 600 }}>{owner?.name}</span>
                                                        <span style={{ fontSize: '10px', color: 'var(--primary-400)' }}>Organizer</span>
                                                    </div>
                                                    {/* Tagged members */}
                                                    {exp.sharedWith.map(s => {
                                                        const taggedUser = getUser(s.userId);
                                                        const isMe = s.userId === currentUser.id;
                                                        const statusStyles = {
                                                            pending: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning-400)' },
                                                            confirmed: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', color: 'var(--success-400)' },
                                                            declined: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-400)' },
                                                        };
                                                        const st = statusStyles[s.status] || statusStyles.pending;
                                                        return (
                                                            <div key={s.userId} style={{
                                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                                                                background: st.bg, border: `1px solid ${st.border}`,
                                                                fontSize: '12px',
                                                            }}>
                                                                <span style={{
                                                                    width: '22px', height: '22px', borderRadius: '50%',
                                                                    background: isMe ? '#38bdf8' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '9px', fontWeight: 700, color: 'white',
                                                                }}>{taggedUser?.avatar}</span>
                                                                <span style={{ fontWeight: 600 }}>{isMe ? 'You' : taggedUser?.name}</span>
                                                                <span style={{ fontSize: '10px', color: st.color, textTransform: 'capitalize' }}>
                                                                    {s.status === 'pending' ? '⏳ Pending' : s.status === 'confirmed' ? '✓ Confirmed' : '✕ Declined'}
                                                                </span>
                                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatCurrency(s.shareAmount)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{
                                    padding: '14px 24px', background: 'rgba(15, 23, 42, 0.4)',
                                    borderTop: '1px solid var(--border-color)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                        ⏱️ Please confirm your share to proceed with the approval workflow
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn btn-danger btn-sm" onClick={() => { setDeclineModal(exp.id); setDeclineReason(''); }}>
                                            ✕ Decline
                                        </button>
                                        <button className="btn btn-success btn-sm" onClick={() => handleConfirm(exp.id)}>
                                            ✓ Confirm My Share ({formatCurrency(myShare?.shareAmount || 0)})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Decline Modal */}
            {declineModal && (
                <div className="modal-overlay" onClick={() => setDeclineModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">❌ Decline Share</div>
                            <button className="modal-close" onClick={() => setDeclineModal(null)}>✕</button>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                            Are you sure you want to decline your share in this group expense? The person who submitted it will be notified.
                        </p>
                        <div className="form-group">
                            <label className="form-label">Reason (optional)</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Explain why you're declining..."
                                value={declineReason}
                                onChange={e => setDeclineReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setDeclineModal(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={handleDecline}>Decline</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
