// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

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

    const monthlyTrends = useMemo(() => {
        const trends = {};
        expenses.forEach(exp => {
            const date = new Date(exp.date);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            if (!trends[monthYear]) trends[monthYear] = { month: monthYear, total: 0 };
            trends[monthYear].total += exp.amount;
        });

        // Sort chronologically (assuming sorting string 'Mon YYYY' doesn't strictly work, better to sort by actual date)
        return Object.values(trends).sort((a, b) => new Date('1 ' + a.month) - new Date('1 ' + b.month)).slice(-6); // last 6 months
    }, [expenses]);

    // ========== EXPORT FUNCTIONS ==========

    const exportCSV = () => {
        const headers = ['Expense ID', 'Employee', 'Department', 'Grade', 'Category', 'Description', 'Amount', 'Date', 'Status', 'Manager Approval', 'HOD Approval', 'Finance Approval', 'Receipt'];
        const rows = expenses.map(exp => {
            const user = getUser(exp.userId);
            const cat = categories.find(c => c.id === exp.categoryId);
            const managerApproval = exp.approvals.find(a => a.level === 'manager');
            const hodApproval = exp.approvals.find(a => a.level === 'hod');
            const financeApproval = exp.approvals.find(a => a.level === 'finance');
            return [
                exp.id,
                user?.name || 'N/A',
                user?.department || 'N/A',
                user?.grade || 'N/A',
                cat?.name || 'N/A',
                '"' + exp.description.replace(/"/g, '""') + '"',
                exp.amount,
                exp.date,
                exp.status.toUpperCase(),
                managerApproval?.status || 'pending',
                hodApproval?.status || 'pending',
                financeApproval?.status || 'pending',
                exp.receiptName || 'No receipt',
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'ExpensifyPro_Report_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        const printWindow = window.open('', '_blank');
        const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

        const expenseRows = expenses.map(exp => {
            const user = getUser(exp.userId);
            const cat = categories.find(c => c.id === exp.categoryId);
            const statusColor = exp.status === 'settled' ? '#10b981' : exp.status === 'approved' ? '#34d399' : exp.status === 'rejected' ? '#ef4444' : '#f59e0b';
            return '<tr>' +
                '<td style="font-family:monospace;font-size:11px;">' + exp.id + '</td>' +
                '<td>' + (user?.name || 'N/A') + '</td>' +
                '<td>' + (user?.department || 'N/A') + '</td>' +
                '<td>' + (cat?.name || 'N/A') + '</td>' +
                '<td style="font-weight:600;">₹' + exp.amount.toLocaleString('en-IN') + '</td>' +
                '<td>' + exp.date + '</td>' +
                '<td><span style="color:' + statusColor + ';font-weight:600;text-transform:uppercase;">' + exp.status + '</span></td>' +
                '<td>' + (exp.receiptName || '—') + '</td>' +
                '</tr>';
        }).join('');

        const categoryRowsHTML = categoryStats.map(cat =>
            '<tr><td>' + cat.name + '</td><td>' + cat.count + '</td><td>' + cat.approved + '</td><td>' + cat.rejected + '</td><td style="font-weight:700;">₹' + cat.total.toLocaleString('en-IN') + '</td></tr>'
        ).join('');

        const deptRowsHTML = departmentStats.map(dept =>
            '<tr><td>' + dept.name + '</td><td>' + dept.employees + '</td><td>' + dept.count + '</td><td style="font-weight:700;">₹' + dept.total.toLocaleString('en-IN') + '</td></tr>'
        ).join('');

        const html = '<!DOCTYPE html><html><head><title>ExpensifyPro Report - ' + today + '</title>' +
            '<style>' +
            '* { margin: 0; padding: 0; box-sizing: border-box; }' +
            'body { font-family: "Segoe UI", Arial, sans-serif; color: #1e293b; padding: 40px; font-size: 13px; }' +
            '.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }' +
            '.header h1 { font-size: 24px; color: #4f46e5; }' +
            '.summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }' +
            '.summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }' +
            '.summary-card .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }' +
            '.summary-card .value { font-size: 22px; font-weight: 700; color: #1e293b; }' +
            'h2 { font-size: 16px; color: #334155; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }' +
            'table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }' +
            'th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 2px solid #e2e8f0; }' +
            'td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }' +
            'tr:hover td { background: #f8fafc; }' +
            '.footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }' +
            '@media print { body { padding: 20px; } .no-print { display: none; } }' +
            '</style></head><body>' +
            '<div class="header"><div><h1>ExpensifyPro</h1><div style="color:#64748b;margin-top:4px;">Expense Management Report</div></div><div style="color:#64748b;font-size:13px;">Generated: ' + today + '</div></div>' +
            '<div class="summary-grid">' +
            '<div class="summary-card"><div class="label">Total Claims</div><div class="value">' + formatCurrency(stats.total) + '</div><div style="font-size:11px;color:#64748b;margin-top:4px;">' + stats.count + ' claims</div></div>' +
            '<div class="summary-card"><div class="label">Settled</div><div class="value" style="color:#10b981;">' + formatCurrency(stats.settled) + '</div></div>' +
            '<div class="summary-card"><div class="label">Pending</div><div class="value" style="color:#f59e0b;">' + formatCurrency(stats.pending) + '</div></div>' +
            '<div class="summary-card"><div class="label">Rejected</div><div class="value" style="color:#ef4444;">' + formatCurrency(stats.rejected) + '</div></div>' +
            '</div>' +
            '<h2>All Expense Claims</h2>' +
            '<table><thead><tr><th>ID</th><th>Employee</th><th>Dept</th><th>Category</th><th>Amount</th><th>Date</th><th>Status</th><th>Receipt</th></tr></thead>' +
            '<tbody>' + expenseRows + '</tbody></table>' +
            '<h2>Category Breakdown</h2>' +
            '<table><thead><tr><th>Category</th><th>Claims</th><th>Approved</th><th>Rejected</th><th>Total</th></tr></thead>' +
            '<tbody>' + categoryRowsHTML + '</tbody></table>' +
            '<h2>Department Summary</h2>' +
            '<table><thead><tr><th>Department</th><th>Employees</th><th>Claims</th><th>Total</th></tr></thead>' +
            '<tbody>' + deptRowsHTML + '</tbody></table>' +
            '<div class="footer">ExpensifyPro Expense Management System | Confidential Report | ' + today + '</div>' +
            '<div class="no-print" style="text-align:center;margin-top:24px;"><button onclick="window.print()" style="padding:10px 24px;background:#4f46e5;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:600;">Print / Save as PDF</button></div>' +
            '</body></html>';

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>📈 Reports & Analytics</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        Insights and trends across expense claims
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline btn-sm" onClick={exportCSV} title="Download CSV spreadsheet">
                        📥 Export CSV
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={exportPDF} title="Generate printable PDF report">
                        📄 Export PDF
                    </button>
                </div>
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

                {/* Monthly Trend Analysis */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header">
                        <div>
                            <div className="card-title">Monthly Trend Analysis</div>
                            <div className="card-subtitle">Historical claims over the last 6 months</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '20px', padding: '10px 0' }}>
                        {monthlyTrends.map((trend, i) => {
                            const maxTrend = Math.max(...monthlyTrends.map(t => t.total)) || 1;
                            const heightPct = Math.max((trend.total / maxTrend) * 100, 5); // min 5% height
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', padding: '0 10%' }}>
                                        <div style={{
                                            width: '100%', height: `${heightPct}%`,
                                            background: 'linear-gradient(0deg, var(--primary-400), var(--primary-300))',
                                            borderRadius: '6px 6px 0 0',
                                            transition: 'height 1s ease',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: '-25px', width: '100%', textAlign: 'center',
                                                fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)'
                                            }}>
                                                {formatCurrency(trend.total)}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        {trend.month}
                                    </div>
                                </div>
                            );
                        })}
                        {monthlyTrends.length === 0 && (
                            <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>No historical data available</div>
                        )}
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
