import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubscribedOnly, setShowSubscribedOnly] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [showSubscribedOnly]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('neville_token');
      const response = await fetch(`/api/admin/users?type=${showSubscribedOnly ? 'subscribed' : 'all'}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserMessages = async (userId: number) => {
    try {
      const token = localStorage.getItem('neville_token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reset_messages', userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset messages');
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset messages');
    }
  };

  const resetAllMessages = async () => {
    if (!confirm('Are you sure you want to reset message counts for ALL users?')) {
      return;
    }

    try {
      const token = localStorage.getItem('neville_token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reset_messages' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset all messages');
      }

      // Refresh users list
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset all messages');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSubscriptionStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      case 'past_due': return 'text-yellow-400';
      case 'incomplete': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-amber-300 text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-amber-300">Admin Dashboard</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showSubscribedOnly}
                  onChange={(e) => setShowSubscribedOnly(e.target.checked)}
                  className="mr-2"
                />
                Show subscribed users only
              </label>
              <button
                onClick={resetAllMessages}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Reset All Message Counts
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-3 px-2">ID</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">Role</th>
                  <th className="text-left py-3 px-2">Subscription</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-left py-3 px-2">Messages Used</th>
                  <th className="text-left py-3 px-2">Created</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700">
                    <td className="py-3 px-2">{user.id}</td>
                    <td className="py-3 px-2">{user.email}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {user.subscriptionTier ? (
                        <span className="px-2 py-1 bg-green-600 rounded text-xs">
                          {user.subscriptionTier}
                        </span>
                      ) : (
                        <span className="text-gray-400">Free</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className={getSubscriptionStatusColor(user.subscriptionStatus)}>
                        {user.subscriptionStatus || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {user.messagesUsedThisMonth}
                    </td>
                    <td className="py-3 px-2">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => resetUserMessages(user.id)}
                        className="text-amber-400 hover:text-amber-300 text-xs"
                      >
                        Reset Messages
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Total users: {users.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;