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

// Loaders
import Landing, { loader as landingLoader } from './pages/Home/Landing';

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
      },
      {
        path: 'dashboard',
        element: <DashboardUser />,
        errorElement: <ErrorElement />,
        loader: landingLoader,
        children: [
          {
            path: 'about',
            element: <About />,
          },
          {
            path: 'companies',
            element: <Companies />,
          },
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
  },
  {
    path: '/signup',
    element: <Signup />,
    errorElement: <Error />,
  },
  {
    path: '*',
    element: <Error />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
