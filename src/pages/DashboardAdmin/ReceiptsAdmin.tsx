import { redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import type { Transaction } from '../Receipts/Receipts';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useState } from 'react';

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  if (!user || user.user_role !== 'admin') {
    toast.warn('There must be an error in this page');
    return redirect('/dashboard');
  }

  const receiptsQuery = {
    queryKey: ['allReceipts', user.id],
    queryFn: async () => {
      const response = await customFetch.get('/receipts', {
        headers: {
          Authorization: user.token,
        },
      });
      return response.data;
    },
  };

  try {
    const receipts = await queryClient.ensureQueryData(receiptsQuery);
    return { receipts };
  } catch (error: any) {
    console.error('Failed to load receipts:', error);
    toast.error('Failed to load transaction history');
    return { receipts: [] };
  }
};

const ReceiptsAdmin = () => {
  const [searchWord, setSearchWord] = useState('');

  const { receipts: initialReceipts } = useLoaderData() as {
    receipts: Transaction[];
  };
  const user = useSelector((state: RootState) => state.userState.user);

  // Use React Query for live transaction data
  const { data: receipts = [] } = useQuery({
    queryKey: ['allReceipts', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/receipts', {
        headers: {
          Authorization: user?.token,
        },
      });
      return response.data;
    },
    initialData: initialReceipts,
    refetchOnWindowFocus: false,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Buy';
      case 'sell':
        return 'Sell';
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdraw';
      default:
        return type;
    }
  };

  const getCompanyDisplay = (transaction: Transaction) => {
    if (transaction.stock) {
      return (
        <div className="flex items-center justify-center gap-2">
          {transaction.stock.logo_url ? (
            <img
              src={transaction.stock.logo_url}
              alt={transaction.stock.ticker}
              className="w-6 h-6 rounded object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs">
              {transaction.stock.ticker.charAt(0)}
            </div>
          )}
          <span>{transaction.stock.ticker}</span>
        </div>
      );
    }
    return '-';
  };

  // Filter and sort transactions
  const filteredReceipts = receipts
    .filter((receipt: Transaction) => {
      const searchLower = searchWord.toLowerCase();
      const matchesEmail = receipt.user.email.toLowerCase().includes(searchLower);
      const matchesType = getTransactionTypeDisplay(receipt.transaction_type)
        .toLowerCase()
        .includes(searchLower);
      const matchesTicker = receipt.stock?.ticker.toLowerCase().includes(searchLower) || false;
      
      return matchesEmail || matchesType || matchesTicker;
    })
    .sort(
      (a: Transaction, b: Transaction) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="text-gray-400 text-sm">
            Search company name or Trader name
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by Email, Type, or Ticker"
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

        {/* Transactions Table */}
        <div className="bg-[#1e1b2e] rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-xs font-extralight text-gray-300">
                    Email
                  </th>
                  <th className="text-center p-4 text-xs font-extralight text-gray-300">
                    Type
                  </th>
                  <th className="text-center p-4 text-xs font-extralight text-gray-300">
                    Company
                  </th>
                  <th className="text-right p-4 text-xs font-extralight text-gray-300">
                    Quantity
                  </th>
                  <th className="text-right p-4 text-xs font-extralight text-gray-300">
                    Price per Share
                  </th>
                  <th className="text-right p-4 text-xs font-extralight text-gray-300">
                    Total Amount
                  </th>
                  <th className="text-right p-4 text-xs font-extralight text-gray-300">
                    Date (Local Time)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((transaction: Transaction, index: number) => (
                    <tr
                      key={transaction.id}
                      className={`border-b border-gray-800 hover:bg-[#2a2740] transition-colors ${
                        index % 2 === 0 ? 'bg-[#1e1b2e]' : 'bg-[#252238]'
                      }`}
                    >
                      <td className="p-4 text-xs text-left">
                        {transaction.user.email}
                      </td>
                      <td className="p-4 text-xs text-center">
                        {getTransactionTypeDisplay(transaction.transaction_type)}
                      </td>
                      <td className="p-4 text-xs text-center">
                        {getCompanyDisplay(transaction)}
                      </td>
                      <td className="p-4 text-xs text-right">
                        {transaction.quantity
                          ? parseFloat(transaction.quantity).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : '-'}
                      </td>
                      <td className="p-4 text-xs text-right">
                        {transaction.price_per_share
                          ? parseFloat(transaction.price_per_share).toFixed(2)
                          : '-'}
                      </td>
                      <td className="p-4 text-xs text-right">
                        {parseFloat(transaction.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-xs text-right">
                        {formatDate(transaction.created_at)} - {formatTime(transaction.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400">
                      No transactions found
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

export default ReceiptsAdmin;
