// Owner: Manideep Reddy Eevuri
// GitHub: https://github.com/Maniredii
// LinkedIn: https://www.linkedin.com/in/manideep-reddy-eevuri-661659268/

'use client';
import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ToastContainer from '@/components/ToastContainer';
import LoginPage from '@/components/LoginPage';
import Dashboard from '@/components/Dashboard';
import SubmitExpense from '@/components/SubmitExpense';
import MyExpenses from '@/components/MyExpenses';
import ApprovalQueue from '@/components/ApprovalQueue';
import FinanceCenter from '@/components/FinanceCenter';
import Policies from '@/components/Policies';
import Reports from '@/components/Reports';
import Notifications from '@/components/Notifications';

const PAGE_TITLES = {
  'dashboard': 'Dashboard',
  'submit': 'Submit Expense',
  'my-expenses': 'My Expenses',
  'approvals': 'Approval Queue',
  'finance': 'Finance Command Centre',
  'policies': 'Policy & Limits',
  'reports': 'Reports & Analytics',
  'notifications': 'Notifications',
};

function AppContent() {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState('dashboard');

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'submit': return <SubmitExpense onNavigate={setActivePage} />;
      case 'my-expenses': return <MyExpenses />;
      case 'approvals': return <ApprovalQueue />;
      case 'finance': return <FinanceCenter />;
      case 'policies': return <Policies />;
      case 'reports': return <Reports />;
      case 'notifications': return <Notifications />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <Header title={PAGE_TITLES[activePage] || 'Dashboard'} onNavigate={setActivePage} />
        {renderPage()}
      </div>
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
