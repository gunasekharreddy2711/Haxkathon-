'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

// ========== MOCK DATA ==========

const USERS = [
  { id: 1, name: 'Rahul Sharma', email: 'rahul@orientbell.com', role: 'employee', grade: 'A', department: 'Sales', managerId: 3, avatar: 'RS' },
  { id: 2, name: 'Priya Patel', email: 'priya@orientbell.com', role: 'employee', grade: 'B', department: 'Marketing', managerId: 3, avatar: 'PP' },
  { id: 3, name: 'Amit Kumar', email: 'amit@orientbell.com', role: 'manager', grade: 'A', department: 'Sales', managerId: 5, avatar: 'AK' },
  { id: 4, name: 'Sneha Gupta', email: 'sneha@orientbell.com', role: 'employee', grade: 'C', department: 'Engineering', managerId: 5, avatar: 'SG' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@orientbell.com', role: 'hod', grade: 'A', department: 'Sales', managerId: null, avatar: 'VS' },
  { id: 6, name: 'Anita Desai', email: 'anita@orientbell.com', role: 'finance', grade: 'A', department: 'Finance', managerId: null, avatar: 'AD' },
  { id: 7, name: 'Rajesh Verma', email: 'rajesh@orientbell.com', role: 'manager', grade: 'B', department: 'Engineering', managerId: 5, avatar: 'RV' },
  { id: 8, name: 'Meera Nair', email: 'meera@orientbell.com', role: 'employee', grade: 'B', department: 'Sales', managerId: 3, avatar: 'MN' },
];

const CATEGORIES = [
  { id: 1, name: 'Local Travel', icon: '🚗', description: 'Within city travel expenses' },
  { id: 2, name: 'Outstation Travel', icon: '✈️', description: 'Inter-city travel and accommodation' },
  { id: 3, name: 'Food & Meals', icon: '🍽️', description: 'Business meals and refreshments' },
  { id: 4, name: 'Office Supplies', icon: '📎', description: 'Stationery and office materials' },
  { id: 5, name: 'Client Entertainment', icon: '🎭', description: 'Client meetings and hospitality' },
  { id: 6, name: 'Communication', icon: '📱', description: 'Phone, internet, and communication' },
  { id: 7, name: 'Training & Development', icon: '📚', description: 'Courses, certifications, conferences' },
  { id: 8, name: 'Miscellaneous', icon: '📦', description: 'Other approved expenses' },
];

const POLICY_LIMITS = [
  { grade: 'A', categoryId: 1, limit: 500, period: 'per_day' },
  { grade: 'A', categoryId: 2, limit: 5000, period: 'per_trip' },
  { grade: 'A', categoryId: 3, limit: 300, period: 'per_day' },
  { grade: 'A', categoryId: 4, limit: 2000, period: 'per_month' },
  { grade: 'A', categoryId: 5, limit: 5000, period: 'per_event' },
  { grade: 'A', categoryId: 6, limit: 1500, period: 'per_month' },
  { grade: 'A', categoryId: 7, limit: 10000, period: 'per_quarter' },
  { grade: 'A', categoryId: 8, limit: 1000, period: 'per_month' },
  { grade: 'B', categoryId: 1, limit: 300, period: 'per_day' },
  { grade: 'B', categoryId: 2, limit: 3000, period: 'per_trip' },
  { grade: 'B', categoryId: 3, limit: 200, period: 'per_day' },
  { grade: 'B', categoryId: 4, limit: 1000, period: 'per_month' },
  { grade: 'B', categoryId: 5, limit: 3000, period: 'per_event' },
  { grade: 'B', categoryId: 6, limit: 1000, period: 'per_month' },
  { grade: 'B', categoryId: 7, limit: 5000, period: 'per_quarter' },
  { grade: 'B', categoryId: 8, limit: 500, period: 'per_month' },
  { grade: 'C', categoryId: 1, limit: 200, period: 'per_day' },
  { grade: 'C', categoryId: 2, limit: 2000, period: 'per_trip' },
  { grade: 'C', categoryId: 3, limit: 100, period: 'per_day' },
  { grade: 'C', categoryId: 4, limit: 500, period: 'per_month' },
  { grade: 'C', categoryId: 5, limit: 1500, period: 'per_event' },
  { grade: 'C', categoryId: 6, limit: 500, period: 'per_month' },
  { grade: 'C', categoryId: 7, limit: 3000, period: 'per_quarter' },
  { grade: 'C', categoryId: 8, limit: 300, period: 'per_month' },
];

let expenseCounter = 1000;
const generateExpenseId = () => 'EXP-' + String(++expenseCounter);

const INITIAL_EXPENSES = [
  {
    id: 'EXP-001', userId: 1, categoryId: 3, amount: 250, description: 'Team lunch at client office',
    date: '2026-03-01', status: 'approved', receiptName: 'lunch_receipt.jpg',
    receiptData: null, receiptType: null,
    isGroupExpense: false, sharedWith: [],
    approvals: [
      { level: 'manager', userId: 3, status: 'approved', date: '2026-03-02', comment: 'Approved - client meeting lunch' },
      { level: 'hod', userId: 5, status: 'approved', date: '2026-03-03', comment: 'Looks good' },
      { level: 'finance', userId: 6, status: 'pending', date: null, comment: null },
    ],
    createdAt: '2026-03-01T10:30:00',
  },
  {
    id: 'EXP-002', userId: 1, categoryId: 1, amount: 450, description: 'Cab to client site for product demo',
    date: '2026-02-28', status: 'settled', receiptName: 'cab_receipt.pdf',
    receiptData: null, receiptType: null,
    isGroupExpense: false, sharedWith: [],
    approvals: [
      { level: 'manager', userId: 3, status: 'approved', date: '2026-02-28', comment: 'OK' },
      { level: 'hod', userId: 5, status: 'approved', date: '2026-03-01', comment: 'Approved' },
      { level: 'finance', userId: 6, status: 'approved', date: '2026-03-02', comment: 'Settled via bank transfer' },
    ],
    createdAt: '2026-02-28T09:15:00',
  },
  {
    id: 'EXP-003', userId: 2, categoryId: 2, amount: 3500, description: 'Flight to Mumbai for trade show',
    date: '2026-02-25', status: 'pending', receiptName: 'flight_ticket.pdf',
    receiptData: null, receiptType: null,
    isGroupExpense: false, sharedWith: [],
    approvals: [
      { level: 'manager', userId: 3, status: 'pending', date: null, comment: null },
      { level: 'hod', userId: 5, status: 'pending', date: null, comment: null },
      { level: 'finance', userId: 6, status: 'pending', date: null, comment: null },
    ],
    createdAt: '2026-02-25T14:20:00',
  },
  {
    id: 'EXP-004', userId: 4, categoryId: 4, amount: 800, description: 'Ergonomic keyboard and mouse',
    date: '2026-02-20', status: 'rejected', receiptName: 'amazon_invoice.pdf',
    receiptData: null, receiptType: null,
    isGroupExpense: false, sharedWith: [],
    approvals: [
      { level: 'manager', userId: 7, status: 'approved', date: '2026-02-21', comment: 'Needed for work' },
      { level: 'hod', userId: 5, status: 'rejected', date: '2026-02-22', comment: 'Exceeds limit for Grade C. Max ₹500/month' },
      { level: 'finance', userId: 6, status: 'pending', date: null, comment: null },
    ],
    createdAt: '2026-02-20T11:00:00',
  },
  {
    id: 'EXP-005', userId: 8, categoryId: 5, amount: 2800, description: 'Client dinner at Taj Hotel',
    date: '2026-03-03', status: 'pending', receiptName: 'hotel_bill.jpg',
    receiptData: null, receiptType: null,
    isGroupExpense: false, sharedWith: [],
    approvals: [
      { level: 'manager', userId: 3, status: 'approved', date: '2026-03-04', comment: 'Important client' },
      { level: 'hod', userId: 5, status: 'pending', date: null, comment: null },
      { level: 'finance', userId: 6, status: 'pending', date: null, comment: null },
    ],
    createdAt: '2026-03-03T22:00:00',
  },
  // === GROUP / SHARED EXPENSE ===
  {
    id: 'EXP-GRP001', userId: 3, categoryId: 3, amount: 1500, description: 'Sales team dinner at Mainland China - celebrating Q4 targets',
    date: '2026-03-05', status: 'awaiting_confirmation', receiptName: 'dinner_bill.jpg',
    receiptData: null, receiptType: null,
    isGroupExpense: true,
    splitType: 'equal',
    sharedWith: [
      { userId: 1, shareAmount: 375, status: 'pending', confirmedAt: null },
      { userId: 8, shareAmount: 375, status: 'confirmed', confirmedAt: '2026-03-05T21:00:00' },
      { userId: 2, shareAmount: 375, status: 'pending', confirmedAt: null },
    ],
    approvals: [
      { level: 'manager', userId: 3, status: 'pending', date: null, comment: null },
      { level: 'hod', userId: 5, status: 'pending', date: null, comment: null },
      { level: 'finance', userId: 6, status: 'pending', date: null, comment: null },
    ],
    createdAt: '2026-03-05T20:30:00',
  },
];

const NOTIFICATIONS_INITIAL = [
  { id: 1, userId: 1, message: 'Your expense EXP-001 has been approved by Amit Kumar', type: 'success', read: false, date: '2026-03-05T14:30:00', channels: ['app', 'email'] },
  { id: 2, userId: 3, message: 'New expense submitted by Priya Patel needs your review', type: 'info', read: false, date: '2026-03-04T15:00:00', channels: ['app', 'email', 'sms'] },
  { id: 3, userId: 6, message: '3 expenses are ready for final settlement', type: 'warning', read: false, date: '2026-03-05T09:00:00', channels: ['app', 'email'] },
  { id: 4, userId: 1, message: 'Your expense for Cab Travel has been settled. Ref: NEFT20260302', type: 'success', read: true, date: '2026-03-02T16:00:00', channels: ['app', 'email', 'sms'] },
  { id: 5, userId: 5, message: 'Client dinner expense from Meera Nair requires HOD approval', type: 'info', read: false, date: '2026-03-04T10:00:00', channels: ['app', 'email'] },
];

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [notifications, setNotifications] = useState(NOTIFICATIONS_INITIAL);
  const [toasts, setToasts] = useState([]);

  const login = useCallback((email) => {
    const user = USERS.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const switchUser = useCallback((userId) => {
    const user = USERS.find(u => u.id === userId);
    if (user) setCurrentUser(user);
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const addExpense = useCallback((expense) => {
    const user = currentUser;
    if (!user) return;

    const manager = USERS.find(u => u.id === user.managerId);
    const hod = USERS.find(u => u.role === 'hod');
    const finance = USERS.find(u => u.role === 'finance');

    const isGroup = expense.isGroupExpense && expense.sharedWith && expense.sharedWith.length > 0;

    const newExpense = {
      ...expense,
      id: generateExpenseId(),
      userId: user.id,
      status: isGroup ? 'awaiting_confirmation' : 'pending',
      isGroupExpense: isGroup,
      sharedWith: isGroup ? expense.sharedWith.map(s => ({
        userId: s.userId,
        shareAmount: s.shareAmount,
        status: 'pending',
        confirmedAt: null,
      })) : [],
      splitType: expense.splitType || 'equal',
      createdAt: new Date().toISOString(),
      approvals: [
        { level: 'manager', userId: manager?.id || 3, status: 'pending', date: null, comment: null },
        { level: 'hod', userId: hod?.id || 5, status: 'pending', date: null, comment: null },
        { level: 'finance', userId: finance?.id || 6, status: 'pending', date: null, comment: null },
      ],
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Policy check
    const policy = POLICY_LIMITS.find(p => p.grade === user.grade && p.categoryId === expense.categoryId);
    if (policy && expense.amount > policy.limit) {
      addToast(`⚠️ Warning: Amount ₹${expense.amount} exceeds policy limit of ₹${policy.limit} for your grade`, 'warning');
      setNotifications(prev => [
        { id: Date.now(), userId: user.id, message: `Policy violation: Your ${CATEGORIES.find(c => c.id === expense.categoryId)?.name} expense of ₹${expense.amount} exceeds the limit of ₹${policy.limit} for Grade ${user.grade}`, type: 'warning', read: false, date: new Date().toISOString(), channels: ['app', 'email', 'sms'] },
        ...prev,
      ]);
    } else {
      addToast(isGroup ? '👥 Group expense submitted! Waiting for team confirmations.' : '✅ Expense submitted successfully!', 'success');
    }

    // Notify tagged employees for group expenses
    if (isGroup) {
      newExpense.sharedWith.forEach(s => {
        const taggedUser = USERS.find(u => u.id === s.userId);
        if (taggedUser) {
          setNotifications(prev => [
            { id: Date.now() + s.userId, userId: s.userId, message: `👥 ${user.name} tagged you in a group expense of ₹${expense.amount} (${CATEGORIES.find(c => c.id === expense.categoryId)?.name}). Your share: ₹${s.shareAmount}. Please confirm.`, type: 'info', read: false, date: new Date().toISOString() },
            ...prev,
          ]);
        }
      });
    }

    // Notify manager (only for non-group or if not awaiting)
    if (!isGroup && manager) {
      setNotifications(prev => [
        { id: Date.now() + 1, userId: manager.id, message: `New expense of ₹${expense.amount} submitted by ${user.name}`, type: 'info', read: false, date: new Date().toISOString(), channels: ['app', 'email'] },
        ...prev,
      ]);
    }

    return newExpense;
  }, [currentUser, addToast]);

  const approveExpense = useCallback((expenseId, level, comment = '') => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp;
      const updated = {
        ...exp, approvals: exp.approvals.map(a => {
          if (a.level !== level) return a;
          return { ...a, status: 'approved', date: new Date().toISOString().split('T')[0], comment: comment || 'Approved' };
        })
      };

      // Check if all approved
      const allApproved = updated.approvals.every(a => a.status === 'approved');
      if (allApproved) updated.status = 'approved';
      else {
        // Update status based on progress
        const lastApproved = updated.approvals.filter(a => a.status === 'approved').length;
        if (lastApproved > 0 && lastApproved < 3) updated.status = 'pending';
      }

      return updated;
    }));

    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      const employee = USERS.find(u => u.id === expense.userId);
      setNotifications(prev => [
        { id: Date.now(), userId: expense.userId, message: `Your expense ${expenseId} has been approved at ${level} level`, type: 'success', read: false, date: new Date().toISOString(), channels: ['app', 'email'] },
        ...prev,
      ]);
    }

    addToast('✅ Expense approved successfully!', 'success');
  }, [expenses, addToast]);

  const rejectExpense = useCallback((expenseId, level, comment = 'Rejected') => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp;
      return {
        ...exp,
        status: 'rejected',
        approvals: exp.approvals.map(a => {
          if (a.level !== level) return a;
          return { ...a, status: 'rejected', date: new Date().toISOString().split('T')[0], comment };
        }),
      };
    }));

    addToast('❌ Expense rejected', 'error');
  }, [addToast]);

  const settleExpense = useCallback((expenseId, paymentMode = 'NEFT') => {
    const txnRef = paymentMode.toUpperCase() + Date.now().toString().slice(-8);
    const settlementDate = new Date().toISOString();

    setExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp;
      return {
        ...exp,
        status: 'settled',
        settlement: {
          txnRef,
          paymentMode,
          settlementDate,
          settledBy: currentUser?.id || 6,
        },
        approvals: exp.approvals.map(a => {
          if (a.level !== 'finance') return a;
          return { ...a, status: 'approved', date: settlementDate.split('T')[0], comment: `Settled via ${paymentMode} | Ref: ${txnRef}` };
        }),
      };
    }));

    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      const employee = USERS.find(u => u.id === expense.userId);
      // In-app notification
      setNotifications(prev => [
        { id: Date.now(), userId: expense.userId, message: `💰 Your expense ${expenseId} of ₹${expense.amount} has been settled via ${paymentMode}! Ref: ${txnRef}`, type: 'success', read: false, date: settlementDate, channels: ['app', 'email', 'sms'] },
        ...prev,
      ]);
      // Simulated Email notification
      setNotifications(prev => [
        { id: Date.now() + 1, userId: expense.userId, message: `📧 Email sent to ${employee?.email}: Payment of ₹${expense.amount} credited. Reference: ${txnRef}`, type: 'info', read: false, date: settlementDate, channels: ['email'] },
        ...prev,
      ]);
    }

    addToast(`💰 Expense settled via ${paymentMode}! Ref: ${txnRef}`, 'success');
  }, [expenses, currentUser, addToast]);

  const markNotificationRead = useCallback((notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  }, []);

  // ========== GROUP EXPENSE FUNCTIONS ==========

  const confirmShareExpense = useCallback((expenseId, userId) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp;
      const updatedShared = exp.sharedWith.map(s => {
        if (s.userId !== userId) return s;
        return { ...s, status: 'confirmed', confirmedAt: new Date().toISOString() };
      });
      const allConfirmed = updatedShared.every(s => s.status === 'confirmed');
      return {
        ...exp,
        sharedWith: updatedShared,
        status: allConfirmed ? 'pending' : 'awaiting_confirmation',
      };
    }));

    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      const confirmer = USERS.find(u => u.id === userId);
      // Notify the expense owner
      setNotifications(prev => [
        { id: Date.now(), userId: expense.userId, message: `✅ ${confirmer?.name} confirmed their share of ₹${expense.sharedWith.find(s => s.userId === userId)?.shareAmount} for "${expense.description}"`, type: 'success', read: false, date: new Date().toISOString() },
        ...prev,
      ]);
      // Check if all confirmed
      const updatedShared = expense.sharedWith.map(s => s.userId === userId ? { ...s, status: 'confirmed' } : s);
      if (updatedShared.every(s => s.status === 'confirmed')) {
        const manager = USERS.find(u => u.id === USERS.find(u2 => u2.id === expense.userId)?.managerId);
        if (manager) {
          setNotifications(prev => [
            { id: Date.now() + 1, userId: manager.id, message: `Group expense of ₹${expense.amount} by ${USERS.find(u => u.id === expense.userId)?.name} is now confirmed by all participants. Needs your review.`, type: 'info', read: false, date: new Date().toISOString() },
            ...prev,
          ]);
        }
        setNotifications(prev => [
          { id: Date.now() + 2, userId: expense.userId, message: `🎉 All participants confirmed! Your group expense "${expense.description}" is now queued for manager approval.`, type: 'success', read: false, date: new Date().toISOString() },
          ...prev,
        ]);
      }
    }
    addToast('✅ You confirmed your share in the group expense!', 'success');
  }, [expenses, addToast]);

  const declineShareExpense = useCallback((expenseId, userId, reason = '') => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id !== expenseId) return exp;
      return {
        ...exp,
        sharedWith: exp.sharedWith.map(s => {
          if (s.userId !== userId) return s;
          return { ...s, status: 'declined', confirmedAt: new Date().toISOString() };
        }),
      };
    }));

    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      const decliner = USERS.find(u => u.id === userId);
      setNotifications(prev => [
        { id: Date.now(), userId: expense.userId, message: `❌ ${decliner?.name} declined their share in "${expense.description}"${reason ? ': ' + reason : ''}. Please review and update the expense.`, type: 'warning', read: false, date: new Date().toISOString() },
        ...prev,
      ]);
    }
    addToast('You declined the shared expense', 'error');
  }, [expenses, addToast]);

  const getSharedExpenseRequests = useCallback(() => {
    if (!currentUser) return [];
    return expenses.filter(exp => {
      if (!exp.isGroupExpense || !exp.sharedWith) return false;
      const myShare = exp.sharedWith.find(s => s.userId === currentUser.id);
      return myShare && myShare.status === 'pending';
    });
  }, [currentUser, expenses]);

  // ========== END GROUP EXPENSE FUNCTIONS ==========

  const getPolicyLimit = useCallback((grade, categoryId) => {
    return POLICY_LIMITS.find(p => p.grade === grade && p.categoryId === categoryId);
  }, []);

  const getUser = useCallback((userId) => {
    return USERS.find(u => u.id === userId);
  }, []);

  const getUserExpenses = useCallback(() => {
    if (!currentUser) return [];
    return expenses.filter(e => e.userId === currentUser.id);
  }, [currentUser, expenses]);

  const getPendingApprovals = useCallback(() => {
    if (!currentUser) return [];
    const role = currentUser.role;
    const level = role === 'manager' ? 'manager' : role === 'hod' ? 'hod' : role === 'finance' ? 'finance' : null;
    if (!level) return [];

    return expenses.filter(exp => {
      // Skip group expenses that are still awaiting confirmation
      if (exp.status === 'awaiting_confirmation') return false;

      const approval = exp.approvals.find(a => a.level === level);
      if (!approval || approval.status !== 'pending') return false;

      if (level === 'manager') {
        const employee = USERS.find(u => u.id === exp.userId);
        return employee && employee.managerId === currentUser.id;
      }
      if (level === 'hod') {
        const managerApproval = exp.approvals.find(a => a.level === 'manager');
        return managerApproval && managerApproval.status === 'approved';
      }
      if (level === 'finance') {
        const hodApproval = exp.approvals.find(a => a.level === 'hod');
        return hodApproval && hodApproval.status === 'approved';
      }
      return false;
    });
  }, [currentUser, expenses]);

  const value = {
    currentUser,
    users: USERS,
    categories: CATEGORIES,
    policyLimits: POLICY_LIMITS,
    expenses,
    notifications,
    toasts,
    login,
    logout,
    switchUser,
    addToast,
    addExpense,
    approveExpense,
    rejectExpense,
    settleExpense,
    markNotificationRead,
    confirmShareExpense,
    declineShareExpense,
    getSharedExpenseRequests,
    getPolicyLimit,
    getUser,
    getUserExpenses,
    getPendingApprovals,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
