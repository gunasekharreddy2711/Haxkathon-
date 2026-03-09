// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

'use client';
import { useApp } from '@/context/AppContext';

export default function ToastContainer() {
    const { toasts } = useApp();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    <span className="toast-message">{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
