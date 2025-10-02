import { redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useState } from 'react';

interface Trader {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  user_role: 'trader' | 'admin';
  user_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Wallet {
  balance: string;
}

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  if (!user || user.user_role !== 'admin') {
    toast.warn('You must be an admin to view this page');
    return redirect('/dashboard');
  }

  const usersQuery = {
    queryKey: ['users', user.id],
    queryFn: async () => {
      const response = await customFetch.get('/users', {
        headers: {
          Authorization: user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const users = await queryClient.ensureQueryData(usersQuery);
    return { users };
  } catch (error: any) {
    console.error('Failed to load users:', error);
    toast.error('Failed to load traders list');
    return { users: [] };
  }
};

const TradersAdmin = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'current'>('pending');
  const [searchWord, setSearchWord] = useState('');

  const { users: initialUsers } = useLoaderData() as {
    users: Trader[];
  };
  const user = useSelector((state: RootState) => state.userState.user);
  const queryClient = useQueryClient();

  // Use React Query for live users data
  const { data: users = [] } = useQuery({
    queryKey: ['users', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/users', {
        headers: {
          Authorization: user?.token,
        },
      });
      return response.data;
    },
    initialData: initialUsers,
    refetchOnWindowFocus: false,
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await customFetch.patch(
        `/users/${userId}/approve`,
        {},
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('User approved successfully');
      queryClient.invalidateQueries({ queryKey: ['users', user?.id] });
    },
    onError: (error: any) => {
      console.error('Approve failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to approve user';
      toast.error(errorMessage);
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await customFetch.patch(
        `/users/${userId}/reject`,
        {},
        {
          headers: {
            Authorization: user?.token,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('User rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['users', user?.id] });
    },
    onError: (error: any) => {
      console.error('Reject failed:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to reject user';
      toast.error(errorMessage);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusButtonClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 text-black';
      case 'approved':
        return 'bg-green-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleApprove = (userId: number) => {
    approveMutation.mutate(userId);
  };

  const handleReject = (userId: number) => {
    rejectMutation.mutate(userId);
  };

  // Filter users based on active tab and search
  const filteredUsers = users
    .filter((trader: Trader) => {
      const matchesSearch =
        trader.email.toLowerCase().includes(searchWord.toLowerCase()) ||
        trader.first_name.toLowerCase().includes(searchWord.toLowerCase()) ||
        trader.last_name.toLowerCase().includes(searchWord.toLowerCase());
      
      if (activeTab === 'pending') {
        return matchesSearch && trader.user_status === 'pending';
      } else {
        return matchesSearch && (trader.user_status === 'approved' || trader.user_status === 'rejected');
      }
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'pending'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Pending Traders
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-4 px-2 font-semibold text-lg transition-colors ${
              activeTab === 'current'
                ? 'text-pink-500 border-b-2 border-pink-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Current Traders
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by Name or Date"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 pl-10 text-white placeholder-gray-400"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button className="p-3 bg-[#2a2740] border border-gray-600 rounded-lg hover:bg-[#353350] transition-colors">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Traders Table */}
        <div className="bg-[#1e1b2e] rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-300">Full Name</th>
                  <th className="text-left p-4 font-medium text-gray-300">
                    {activeTab === 'pending' ? 'Registration Date' : 'Date of Birth'}
                  </th>
                  <th className="text-left p-4 font-medium text-gray-300">
                    {activeTab === 'pending' ? 'Verification Details' : 'Pin Code'}
                  </th>
                  {activeTab === 'current' && (
                    <>
                      <th className="text-left p-4 font-medium text-gray-300">Country</th>
                      <th className="text-right p-4 font-medium text-gray-300">Balance</th>
                    </>
                  )}
                  <th className="text-right p-4 font-medium text-gray-300">Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((trader: Trader, index: number) => (
                    <tr
                      key={trader.id}
                      className={`border-b border-gray-800 hover:bg-[#2a2740] transition-colors ${
                        index % 2 === 0 ? 'bg-[#1e1b2e]' : 'bg-[#252238]'
                      }`}
                    >
                      <td className="p-4">
                        {trader.first_name} {trader.last_name}
                      </td>
                      <td className="p-4">{formatDate(trader.created_at)}</td>
                      <td className="p-4">
                        {activeTab === 'pending' ? 'ID / Passport' : '1546'}
                      </td>
                      {activeTab === 'current' && (
                        <>
                          <td className="p-4">PH</td>
                          <td className="p-4 text-right">$123.00</td>
                        </>
                      )}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleReject(trader.id)}
                                disabled={rejectMutation.isPending}
                                className="px-4 py-1 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:bg-gray-600 transition-colors"
                              >
                                Rejected
                              </button>
                              <button
                                onClick={() => handleApprove(trader.id)}
                                disabled={approveMutation.isPending}
                                className="px-4 py-1 rounded-full bg-yellow-500 text-black text-sm font-medium hover:bg-yellow-600 disabled:bg-gray-600 transition-colors"
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleApprove(trader.id)}
                                disabled={approveMutation.isPending}
                                className="px-4 py-1 rounded-full bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:bg-gray-600 transition-colors"
                              >
                                Approved
                              </button>
                            </>
                          ) : (
                            <button className="px-6 py-1 rounded text-sm font-medium hover:opacity-80 transition-opacity">
                              Transactions
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={activeTab === 'pending' ? 4 : 6}
                      className="p-8 text-center text-gray-400"
                    >
                      No {activeTab} traders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradersAdmin;