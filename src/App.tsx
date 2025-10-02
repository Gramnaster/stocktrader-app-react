import { ErrorElement } from './components';
import {
  Companies,
  DashboardAdmin,
  DashboardUser,
  ReceiptsAdmin,
  TradersAdmin,
  Home,
  Login,
  Receipts,
  Signup,
  Stocktrading,
  Wallet,
  Error,
  About,

  // NotFound
} from './pages/index';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { Provider } from 'react-redux';

// Loaders
import Landing from './pages/Home/Landing';
import { action as registerAction } from './pages/Signup/Signup';
import { action as loginAction } from './pages/Login/Login';
import { store } from './store';
import { walletAction, loader as walletLoader } from './pages/Wallet/Wallet';
import { loader as receiptsLoader } from './pages/Receipts/Receipts';
import { loader as stocktradingLoader } from './pages/Stocktrading/Stocktrading';
import { loader as adminLoader } from './pages/DashboardAdmin/DashboardAdmin';
import { loader as adminReceiptsLoader } from './pages/DashboardAdmin/ReceiptsAdmin';
import { loader as traderReceiptsLoader } from './pages/DashboardAdmin/TradersAdmin';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Landing />,
        errorElement: <ErrorElement />,
        // loader: landingLoader,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'companies',
        element: <Companies />,
      },
      {
        path: 'dashboard',
        element: <DashboardUser />,
        errorElement: <ErrorElement />,
        // loader: landingLoader,
        children: [
          {
            path: 'wallet',
            element: <Wallet />,
            loader: walletLoader(queryClient, store),
            action: walletAction(store),
          },
          {
            path: 'stocktrading',
            element: <Stocktrading />,
            loader: stocktradingLoader(queryClient, store),
          },
          {
            path: 'transactions',
            element: <Receipts />,
            loader: receiptsLoader(queryClient, store),
          },
        ],
      },
      {
        path: 'admin',
        element: <DashboardAdmin />,
        loader: adminLoader(queryClient, store),
        children: [
          {
            index: true,
            element: <TradersAdmin />,
            loader: traderReceiptsLoader(queryClient, store),
          },
          {
            path: 'transactions',
            element: <ReceiptsAdmin />,
            loader: adminReceiptsLoader(queryClient, store),
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <Error />,
    action: loginAction(store),
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <Error />,
    action: registerAction,
  },
  {
    path: '*',
    element: <Error />,
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
