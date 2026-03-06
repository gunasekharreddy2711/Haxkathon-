import './globals.css';

export const metadata = {
  title: 'ExpensifyPro - Corporate Expense Management',
  description: 'Streamlined expense reporting, approval workflows, and financial settlements for modern enterprises. Submit, track, and manage employee reimbursements efficiently.',
  keywords: ['expense management', 'reimbursement', 'corporate expenses', 'approval workflow'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💳</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
