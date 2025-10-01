import { ErrorElement } from './components';
import {
  Companies,
  DashboardAdmin,
  DashboardUser,
  Home,
  Login,
  Receipts,
  Signup,
  Stocktrading,
  Traders,
  Wallet,
  Error,
  About,
  // NotFound
} from './pages/index';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Loaders
import Landing from './pages/Home/Landing';
import {action as registerAction} from './pages/Signup/Signup';
import {action as loginAction} from './pages/Login/Login';

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
            path: 'wallet/:id',
            element: <Wallet />,
          },
          {
            path: 'stocktrading/:id',
            element: <Stocktrading />,
          },
          {
            path: 'transactions/:id',
            element: <Receipts />,
          },
          {
            path: 'admin',
            element: <DashboardAdmin />,
            children: [
              {
                index: true,
                element: <Traders />,
              },
              {
                path: 'transactions',
                element: <Receipts />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <Error />,
    action: loginAction
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <Error />,
    action: registerAction
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
