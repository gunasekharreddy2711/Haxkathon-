// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
    const { login, users, switchUser } = useApp();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [showQuickLogin, setShowQuickLogin] = useState(true);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!login(email)) {
            setError('Invalid email. Use one of the demo accounts.');
        }
    };

    const quickLogin = (userId) => {
        switchUser(userId);
    };

    const roleColors = {
        employee: 'var(--primary-400)',
        manager: 'var(--success-400)',
        hod: 'var(--warning-400)',
        finance: 'var(--danger-400)',
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <div className="login-brand-icon">💳</div>
                    <h1>ExpensifyPro</h1>
                    <p>Corporate Expense Management Portal</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setError(''); }}
                        />
                        {error && <div className="form-error">{error}</div>}
                    </div>
                    <button type="submit" className="btn btn-primary login-btn">
                        Sign In
                    </button>
                </form>

                <div style={{ marginTop: '28px' }}>
                    <button
                        className="btn btn-ghost"
                        style={{ width: '100%', marginBottom: '12px' }}
                        onClick={() => setShowQuickLogin(!showQuickLogin)}
                    >
                        {showQuickLogin ? '▼' : '▶'} Quick Demo Login
                    </button>

                    {showQuickLogin && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {users.map(user => (
                                <button
                                    key={user.id}
                                    className="btn btn-outline btn-sm"
                                    style={{
                                        textAlign: 'left',
                                        padding: '10px 12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        justifyContent: 'flex-start',
                                    }}
                                    onClick={() => quickLogin(user.id)}
                                >
                                    <span style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${roleColors[user.role]}, var(--bg-tertiary))`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}>
                                        {user.avatar}
                                    </span>
                                    <span style={{ overflow: 'hidden' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {user.name}
                                        </span>
                                        <span style={{ fontSize: '10px', color: roleColors[user.role], textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                                            {user.role}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="login-footer">
                    <p>Orientbell Ltd. © 2026</p>
                </div>
            </div>
        </div>
    );
}
