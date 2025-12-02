import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { reportsService } from '../services/reportsService';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await reportsService.getDashboardSummary();
      setSummary(data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ARTHA Finance</h1>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <a
                  href="/dashboard"
                  className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/ledger"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Ledger
                </a>
                <a
                  href="/invoices"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Invoices
                </a>
                <a
                  href="/expenses"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Expenses
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {summary && (
          <div>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Total Assets"
                value={formatCurrency(summary.balanceSheet.assets)}
                icon="💰"
                color="blue"
              />
              <KPICard
                title="Total Income"
                value={formatCurrency(summary.profitLoss.income)}
                icon="📈"
                color="green"
              />
              <KPICard
                title="Total Expenses"
                value={formatCurrency(summary.profitLoss.expenses)}
                icon="📉"
                color="red"
              />
              <KPICard
                title="Net Income"
                value={formatCurrency(summary.profitLoss.netIncome)}
                icon="💵"
                color={parseFloat(summary.profitLoss.netIncome) >= 0 ? 'green' : 'red'}
              />
            </div>

            {/* Balance Sheet Summary */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Balance Sheet Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Assets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.balanceSheet.assets)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Liabilities</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.balanceSheet.liabilities)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Equity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.balanceSheet.equity)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                {summary.balanceSheet.isBalanced ? (
                  <div className="flex items-center text-green-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">Balance sheet is balanced</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">Balance sheet is unbalanced</span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(summary.invoices).map(([status, data]) => (
                  <div key={status} className="border border-gray-200 rounded-lg p-4">
                    <p className="text-xs text-gray-600 uppercase">{status}</p>
                    <p className="text-lg font-bold text-gray-900">{data.count}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(data.totalDue)} due
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Expenses by Category */}
            {summary.expenses && summary.expenses.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Expenses (Current Month)
                </h2>
                <div className="space-y-3">
                  {summary.expenses.slice(0, 5).map((expense, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {expense._id.charAt(0).toUpperCase() + expense._id.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500">{expense.count} transactions</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(expense.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Journal Entries */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Journal Entries
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Entry #
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Posted By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {summary.recentEntries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {entry.entryNumber}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {entry.description}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {entry.postedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KPICard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}