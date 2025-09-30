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
  NotFound
} from './pages/index';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <DashboardUser />,
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
            element: <Traders />
          }
        ]
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
    element: <Error />
  }
]);

function App() {
  return (
      <RouterProvider router={router} />
  );
}

export default App;
