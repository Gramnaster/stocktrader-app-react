import { redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { StocksList } from '../../components';
// import type { AppDispatch } from "../../store";

const url = '/wallets/my_wallet';

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

const Wallet = () => {
  console.log(wallet);
  return (
    <div>
      <div>
        <h2>Your Wallet</h2>
        <p>Available Stocks for Trading</p>
      </div>
      <div>
        <StocksList />
      </div>
    </div>
  );
};
export default Wallet;
