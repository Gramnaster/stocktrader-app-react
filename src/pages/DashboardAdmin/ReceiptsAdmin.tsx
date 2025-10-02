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
    queryKey: ['receipts', user.id],
    queryFn: async () => {
      const response = await customFetch.get('/receipts/my_receipts', {
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
    queryKey: ['receipts', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/receipts/my_receipts', {
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
      const companyName =
        transaction.stock.company_name ||
        transaction.stock.name ||
        'Unknown Company';
      return `[${transaction.stock.ticker}] ${companyName}`;
    }
    return '-';
  };

  const filteredUsers = receipts
    .filter((receipt: Transaction) => receipt.user.email.toLowerCase().includes(searchWord.toLowerCase()))

  return <div>
    <input type='text' onChange={(e) => setSearchWord(e.target.value)} />
    <p>If you can see this, you're an admin</p>
  </div>;
};

export default ReceiptsAdmin;
