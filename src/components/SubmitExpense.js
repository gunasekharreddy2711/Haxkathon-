// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function SubmitExpense({ onNavigate }) {
    const { currentUser, categories, getPolicyLimit, addExpense } = useApp();
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        vendor: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        receiptName: null,
        receiptData: null,
        receiptType: null,
    });
    const [policyWarning, setPolicyWarning] = useState(null);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: null }));

        // Policy check on amount/category change
        if (field === 'amount' || field === 'categoryId') {
            const catId = field === 'categoryId' ? parseInt(value) : parseInt(formData.categoryId);
            const amt = field === 'amount' ? parseFloat(value) : parseFloat(formData.amount);

            if (catId && amt && currentUser) {
                const policy = getPolicyLimit(currentUser.grade, catId);
                if (policy && amt > policy.limit) {
                    const cat = categories.find(c => c.id === catId);
                    setPolicyWarning(`⚠️ Amount ₹${amt} exceeds the policy limit of ₹${policy.limit} (${policy.period.replace('_', ' ')}) for Grade ${currentUser.grade} - ${cat?.name}. This may be flagged for extra review.`);
                } else {
                    setPolicyWarning(null);
                }
            }
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, receipt: 'File size must be under 10MB' }));
                return;
            }

            setIsUploading(true);
            const uploadData = new FormData();
            uploadData.append('userId', currentUser?.id?.toString() || 'unknown');
            uploadData.append('userName', currentUser?.name || 'unknown');
            uploadData.append('receipt', file);

            try {
                const res = await fetch('http://localhost:3001/api/upload', {
                    method: 'POST',
                    body: uploadData,
                });
                const result = await res.json();

                if (res.ok) {
                    setFormData(prev => ({
                        ...prev,
                        receiptName: file.name,
                        receiptData: result.fileUrl,
                        receiptType: file.type,
                    }));
                    if (result.extractedText && !formData.description) {
                        // Fill description with a snippet of OCR text if empty
                        setFormData(prev => ({
                            ...prev,
                            description: `OCR snippet: ${result.extractedText.substring(0, 50)}...`
                        }));
                    }
                    setErrors(prev => ({ ...prev, receipt: null }));
                } else {
                    setErrors(prev => ({ ...prev, receipt: result.error || 'Failed to upload' }));
                }
            } catch (err) {
                console.error("Upload error:", err);
                setErrors(prev => ({ ...prev, receipt: 'Server error uploading file (is the backend running?)' }));

                // Fallback to local preview if server is unreachable
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({
                        ...prev,
                        receiptName: file.name,
                        receiptData: reader.result,
                        receiptType: file.type,
                    }));
                };
                reader.readAsDataURL(file);
            } finally {
                setIsUploading(false);
            }
        }
    };

    const removeReceipt = () => {
        setFormData(prev => ({ ...prev, receiptName: null, receiptData: null, receiptType: null }));
    };

    const validate = () => {
        const errs = {};
        if (!formData.categoryId) errs.categoryId = 'Please select a category';
        if (!formData.amount || parseFloat(formData.amount) <= 0) errs.amount = 'Enter a valid amount';
        if (!formData.description.trim()) errs.description = 'Add a description';
        if (!formData.date) errs.date = 'Select a date';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        addExpense({
            categoryId: parseInt(formData.categoryId),
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date,
            receiptName: formData.receiptName,
            receiptData: formData.receiptData,
            receiptType: formData.receiptType,
        });

        // Reset
        setFormData({ categoryId: '', amount: '', vendor: '', description: '', date: new Date().toISOString().split('T')[0], receiptName: null, receiptData: null, receiptType: null });
        setPolicyWarning(null);

        setTimeout(() => onNavigate('my-expenses'), 500);
    };

    const selectedPolicy = formData.categoryId ? getPolicyLimit(currentUser?.grade, parseInt(formData.categoryId)) : null;

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Submit New Expense</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Fill in expense details below. Your claim will be routed for approval automatically.
                </p>
            </div>

            <div className="grid-2">
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        {/* Category */}
                        <div className="form-group">
                            <label className="form-label">Expense Category *</label>
                            <select
                                className="form-select"
                                value={formData.categoryId}
                                onChange={e => handleChange('categoryId', e.target.value)}
                            >
                                <option value="">Select category...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                            {errors.categoryId && <div className="form-error">{errors.categoryId}</div>}
                            {selectedPolicy && (
                                <div className="form-hint">
                                    Policy limit: ₹{selectedPolicy.limit} {selectedPolicy.period.replace('_', ' ')} for Grade {currentUser?.grade}
                                </div>
                            )}
                        </div>

                        {/* Amount and Date */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Amount (₹) *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={e => handleChange('amount', e.target.value)}
                                    min="1"
                                    step="0.01"
                                />
                                {errors.amount && <div className="form-error">{errors.amount}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.date}
                                    onChange={e => handleChange('date', e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                />
                                {errors.date && <div className="form-error">{errors.date}</div>}
                            </div>
                        </div>

                        {/* Vendor */}
                        <div className="form-group">
                            <label className="form-label">Vendor / Merchant</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., Uber, Zomato, Amazon, Taj Hotels..."
                                value={formData.vendor}
                                onChange={e => handleChange('vendor', e.target.value)}
                            />
                            <div className="form-hint">Name of the merchant or service provider</div>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">Description *</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe the purpose of this expense..."
                                value={formData.description}
                                onChange={e => handleChange('description', e.target.value)}
                                rows={3}
                            />
                            {errors.description && <div className="form-error">{errors.description}</div>}
                        </div>

                        {/* Receipt Upload */}
                        <div className="form-group">
                            <label className="form-label">Upload Receipt</label>
                            <label className="file-upload">
                                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileChange} disabled={isUploading} />
                                {isUploading ? (
                                    <>
                                        <div className="file-upload-icon spinner">⏳</div>
                                        <div className="file-upload-text">Uploading & Extracting text...</div>
                                        <div className="file-upload-hint">Please wait</div>
                                    </>
                                ) : formData.receiptName ? (
                                    <>
                                        <div className="file-upload-icon">📄</div>
                                        <div className="file-upload-text">{formData.receiptName}</div>
                                        <div className="file-upload-hint">Click to change file</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="file-upload-icon">📤</div>
                                        <div className="file-upload-text">Click to upload receipt</div>
                                        <div className="file-upload-hint">Supports JPEG, PNG, PDF (Max 10MB)</div>
                                    </>
                                )}
                            </label>
                            {errors.receipt && <div className="form-error">{errors.receipt}</div>}
                        </div>

                        {/* Receipt Preview */}
                        {formData.receiptData && (
                            <div className="form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Receipt Preview</label>
                                    <a
                                        href={formData.receiptData}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline btn-sm"
                                        style={{ fontSize: '11px', padding: '4px 8px' }}
                                    >
                                        🔍 Open Full Size
                                    </a>
                                </div>
                                <div style={{
                                    position: 'relative',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                    background: 'var(--bg-tertiary)',
                                }}>
                                    {(formData.receiptType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(formData.receiptName || '')) ? (
                                        <img
                                            src={formData.receiptData}
                                            alt="Receipt preview"
                                            style={{
                                                width: '100%',
                                                maxHeight: '300px',
                                                objectFit: 'contain',
                                                display: 'block',
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            padding: '24px',
                                            textAlign: 'center',
                                            color: 'var(--text-muted)',
                                            fontSize: '13px',
                                        }}>
                                            📄 PDF file attached: {formData.receiptName}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); removeReceipt(); }}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: 'rgba(239, 68, 68, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px',
                                            fontWeight: 700,
                                        }}
                                        title="Remove receipt"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Policy Warning */}
                        {policyWarning && (
                            <div style={{
                                padding: '14px 16px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '13px',
                                color: 'var(--warning-400)',
                                marginBottom: '20px',
                                lineHeight: 1.5,
                            }}>
                                {policyWarning}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-outline" onClick={() => onNavigate('dashboard')}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                📤 Submit Expense
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Panel */}
                <div>
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <div className="card-title" style={{ marginBottom: '16px' }}>📋 Approval Workflow</div>
                        <div className="progress-tracker">
                            <div className="progress-step completed">
                                <div className="progress-step-dot">1</div>
                                <div className="progress-step-label">Submit</div>
                            </div>
                            <div className="progress-step">
                                <div className="progress-step-dot">2</div>
                                <div className="progress-step-label">Manager</div>
                            </div>
                            <div className="progress-step">
                                <div className="progress-step-dot">3</div>
                                <div className="progress-step-label">HOD</div>
                            </div>
                            <div className="progress-step">
                                <div className="progress-step-dot">4</div>
                                <div className="progress-step-label">Finance</div>
                            </div>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'center' }}>
                            Your claim flows through 3 approval levels before settlement
                        </p>
                    </div>

                    <div className="card">
                        <div className="card-title" style={{ marginBottom: '16px' }}>💡 Quick Tips</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { icon: '📸', text: 'Always attach clear receipt photos for faster approval' },
                                { icon: '📝', text: 'Add detailed descriptions to avoid back-and-forth' },
                                { icon: '⚡', text: 'Claims within policy limits are approved faster' },
                                { icon: '📅', text: 'Submit claims within 7 days of the expense date' },
                            ].map((tip, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: '10px', padding: '10px', background: 'rgba(15, 23, 42, 0.4)',
                                    borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)',
                                }}>
                                    <span>{tip.icon}</span> {tip.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
