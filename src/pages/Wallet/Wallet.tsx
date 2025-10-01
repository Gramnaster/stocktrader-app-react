import { redirect, useLoaderData } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { StocksList } from '../../components';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
// import type { AppDispatch } from "../../store";

console.log('Wallet.tsx should be loading');

export const loader = (queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  console.log('Full store state:', storeState);

  const user = storeState.userState?.user;
  console.log('Store state:', store.getState());
  console.log(
    'User from store (correct path):',
    store.getState().userState?.user
  );

  if (!user) {
    console.log('No user found, redirecting to login');
    toast.warn('You must be logged in to checkout');
    return redirect('/login');
  }

  console.log('User found:', user);
  console.log('User token:', user.token);

  // await queryClient.removeQueries(['wallet-stocks', user.id]);

  const walletQuery = {
    queryKey: ['wallet', user.id],
    queryFn: async () => {
      console.log('Making GET request with Authorization header via Vite proxy');
      console.log('Token from user object:', user.token);
      
      return customFetch.get('/wallets/my_wallet', {
        headers: {
          'Authorization': user.token,
        },
      });
    },
  };

  console.log('Wallet.tsx wallet:', walletQuery);

  try {
    const response = await queryClient.ensureQueryData(walletQuery);
    const wallet = response.data;
    console.log('Wallet.tsx wallet:', wallet);
    return { wallet };
  } catch (error: any) {
    console.error('Failed to load wallet data:', error);
    console.error('Error details:', error.response?.data);
    toast.error('Failed to load wallet data');
    return { wallet: {} };
  }
};

// Unified Wallet Action
export const walletAction = (store: any) => async ({ request }: any) => {
  const storeState = store.getState();
  const user = storeState.userState?.user;
  
  if (!user) {
    toast.error('You must be logged in');
    return redirect('/login');
  }

  const formData = await request.formData();
  const action = formData.get('action');
  const amount = formData.get('amount');

  try {
    const endpoint = action === 'deposit' ? '/wallets/deposit' : '/wallets/withdraw';
    
    await customFetch.post(endpoint, 
      { amount: parseFloat(amount as string) }, // Send as JSON object
      {
        headers: {
          'Authorization': user.token,
          'Content-Type': 'application/json'
        },
      }
    );

    const actionText = action === 'deposit' ? 'deposited' : 'withdrew';
    toast.success(`Successfully ${actionText} $${amount}`);
    return { success: true };
  } catch (error: any) {
    console.error(`${action} failed:`, error);
    const errorMessage = error.response?.data?.message || `${action} failed. Please try again.`;
    toast.error(errorMessage);
    return { error: errorMessage };
  }
};

const Wallet = () => {
  const { wallet: initialWallet } = useLoaderData() as { wallet: any };
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.userState.user);

  // Use React Query for live wallet data
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/wallets/my_wallet', {
        headers: {
          'Authorization': user?.token,
        },
      });
      return response.data;
    },
    initialData: initialWallet,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always consider data stale for real-time updates
  });

  // Deposit Mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await customFetch.post('/wallets/deposit', 
        { amount }, 
        {
          headers: {
            'Authorization': user?.token,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    },
    onMutate: async (amount) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wallet', user?.id] });

      // Snapshot the previous value
      const previousWallet = queryClient.getQueryData(['wallet', user?.id]);

      // Optimistically update the balance
      queryClient.setQueryData(['wallet', user?.id], (old: any) => ({
        ...old,
        balance: (parseFloat(old?.balance || '0') + amount).toFixed(2)
      }));

      return { previousWallet };
    },
    onError: (err, amount, context) => {
      // Rollback on error
      queryClient.setQueryData(['wallet', user?.id], context?.previousWallet);
      console.error('Deposit failed:', err);
      const errorMessage = (err as any).response?.data?.message || 'Deposit failed. Please try again.';
      toast.error(errorMessage);
    },
    onSuccess: (data, amount) => {
      // Update with actual server response
      queryClient.setQueryData(['wallet', user?.id], data.receipt ? {
        ...wallet,
        balance: data.receipt.wallet_balance
      } : wallet);
      toast.success(`Successfully deposited $${amount}`);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
    },
  });

  // Withdraw Mutation  
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await customFetch.post('/wallets/withdraw', 
        { amount }, 
        {
          headers: {
            'Authorization': user?.token,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    },
    onMutate: async (amount) => {
      await queryClient.cancelQueries({ queryKey: ['wallet', user?.id] });
      const previousWallet = queryClient.getQueryData(['wallet', user?.id]);

      // Optimistically update the balance
      queryClient.setQueryData(['wallet', user?.id], (old: any) => ({
        ...old,
        balance: (parseFloat(old?.balance || '0') - amount).toFixed(2)
      }));

      return { previousWallet };
    },
    onError: (err, amount, context) => {
      queryClient.setQueryData(['wallet', user?.id], context?.previousWallet);
      console.error('Withdrawal failed:', err);
      const errorMessage = (err as any).response?.data?.message || 'Withdrawal failed. Please try again.';
      toast.error(errorMessage);
    },
    onSuccess: (data, amount) => {
      queryClient.setQueryData(['wallet', user?.id], data.receipt ? {
        ...wallet,
        balance: data.receipt.wallet_balance
      } : wallet);
      toast.success(`Successfully withdrew $${amount}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
    },
  });

  const handleDeposit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    if (amount > 0) {
      depositMutation.mutate(amount);
      e.currentTarget.reset();
    }
  };

  const handleWithdraw = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    if (amount > 0 && amount <= parseFloat(wallet?.balance || '0')) {
      withdrawMutation.mutate(amount);
      e.currentTarget.reset();
    } else if (amount > parseFloat(wallet?.balance || '0')) {
      toast.error('Insufficient funds');
    }
  };

  return (
    <div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - My Wallet */}
          <div className="lg:col-span-1">
            <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">My Wallet</h2>
              
              {/* Balance Display */}
              <div className="mb-8">
                <div className="text-4xl font-bold mb-2">
                  $ {wallet?.balance || '0.00'}<span className="text-sm font-normal text-gray-400">USD</span>
                </div>
                <div className="text-sm text-gray-400">
                  = ₱ 0.00PHP
                </div>
              </div>

              {/* Portfolio Summary */}
              <div className="mb-6">
                <div className="text-lg font-semibold mb-4">Current Portfolio Total:</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">$ 0.00 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">₱ 0.00 PHP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deposit/Withdraw Forms */}
            <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mt-6">
              {/* Tab Buttons */}
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className={`px-6 py-2 rounded-l-lg font-semibold transition-colors ${
                    activeTab === 'deposit'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`px-6 py-2 rounded-r-lg font-semibold transition-colors ${
                    activeTab === 'withdraw'
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              {/* Deposit Form */}
              {activeTab === 'deposit' && (
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Deposit from</label>
                    <select className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white">
                      <option>[MC] ****-****-****-0010</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white text-right text-2xl"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={depositMutation.isPending}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {depositMutation.isPending ? 'Processing...' : 'Deposit'}
                  </button>
                </form>
              )}

              {/* Withdraw Form */}
              {activeTab === 'withdraw' && (
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Withdraw into</label>
                    <select className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white">
                      <option>[MC] ****-****-****-0010</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                    <input
                      type="number"
                      name="amount"
                      step="0.01"
                      min="0"
                      max={wallet?.balance || 0}
                      placeholder="0.00"
                      className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white text-right text-2xl"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {withdrawMutation.isPending ? 'Processing...' : 'Withdraw'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Side - StocksList */}
          <div className="lg:col-span-2">
            <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">Available Stocks for Trading</h2>
              <StocksList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Wallet;
