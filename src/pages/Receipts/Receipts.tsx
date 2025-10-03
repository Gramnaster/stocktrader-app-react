import { redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

export interface Transaction {
  id: number;
  user_id: number;
  stock_id: number | null;
  transaction_type: 'withdraw' | 'deposit' | 'buy' | 'sell';
  quantity: string;
  price_per_share: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  stock: {
    id: number;
    ticker: string;
    company_name?: string;
    name?: string;  // Fallback
    logo_url?: string;
  } | null;
}

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  if (!user) {
    toast.warn('You must be logged in to view transactions');
    return redirect('/login');
  }

  const receiptsQuery = {
    queryKey: ['receipts', user.id],
    queryFn: async () => {
      const response = await customFetch.get('/receipts/my_receipts', {
        headers: {
          'Authorization': user.token,
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

const Receipts = () => {
  const { receipts: initialReceipts } = useLoaderData() as { receipts: Transaction[] };
  const user = useSelector((state: RootState) => state.userState.user);

  // Use React Query for live transaction data
  const { data: receipts = [] } = useQuery({
    queryKey: ['receipts', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/receipts/my_receipts', {
        headers: {
          'Authorization': user?.token,
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
      const companyName = transaction.stock.company_name || transaction.stock.name || 'Unknown Company';
      return `[${transaction.stock.ticker}] ${companyName}`;
    }
    return '-';
  };

  return (
    <div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#1e1b2e] rounded-lg border border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Transactions</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Company Name or Ticker ID"
                    className="bg-[#2a2740] border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 w-100"
                  />
                  <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-300">Type</th>
                  <th className="text-left p-4 font-medium text-gray-300">Company</th>
                  <th className="text-right p-4 font-medium text-gray-300">Quantity</th>
                  <th className="text-right p-4 font-medium text-gray-300">Price per Share</th>
                  <th className="text-right p-4 font-medium text-gray-300">Total Amount</th>
                  <th className="text-right p-4 font-medium text-gray-300">Date (Stock Time)</th>
                </tr>
              </thead>
              <tbody>
                {receipts.length > 0 ? (
                  receipts.map((transaction: Transaction, index: number) => (
                    <tr 
                      key={transaction.id} 
                      className={`border-b border-gray-800 hover:bg-[#2a2740] transition-colors ${
                        index % 2 === 0 ? 'bg-[#1e1b2e]' : 'bg-[#252238]'
                      }`}
                    >
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                          transaction.transaction_type === 'buy' ? 'bg-green-600 text-white' :
                          transaction.transaction_type === 'sell' ? 'bg-red-600 text-white' :
                          transaction.transaction_type === 'deposit' ? 'bg-blue-600 text-white' :
                          'bg-purple-600 text-white'
                        }`}>
                          {getTransactionTypeDisplay(transaction.transaction_type)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          {transaction.stock?.logo_url ? (
                            <img 
                              src={transaction.stock.logo_url} 
                              alt={`${transaction.stock.ticker} logo`}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-gray-300">
                                {transaction.stock?.ticker?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          <span className="text-white">
                            {getCompanyDisplay(transaction)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-white">
                        {transaction.quantity && transaction.quantity !== '0.0' 
                          ? parseFloat(transaction.quantity).toLocaleString()
                          : '-'
                        }
                      </td>
                      <td className="p-4 text-right text-white">
                        {transaction.price_per_share && transaction.price_per_share !== '0.0'
                          ? `$${parseFloat(transaction.price_per_share).toFixed(2)}`
                          : '-'
                        }
                      </td>
                      <td className="p-4 text-right text-white font-medium">
                        ${parseFloat(transaction.total_amount).toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-gray-300">
                        <div className="text-right">
                          <div>{formatDate(transaction.created_at)}</div>
                          <div className="text-sm text-gray-400">
                            {formatTime(transaction.created_at)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {receipts.length > 0 && (
            <div className="p-4 border-t border-gray-700 text-center text-gray-400 text-sm">
              Orbital Finances 2025. © Copyright. All Rights Reserved. Last updated {formatDate(new Date().toISOString())}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Receipts;