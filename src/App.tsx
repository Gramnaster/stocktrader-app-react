import {
  DashboardAdmin,
  DashboardUser,
  Home,
  Login,
  Receipts,
  Signup,
  Stocktrading,
  Traders,
  Wallet,
  Error
} from './pages/index';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path:'/',
    element: <Home />,
    error: <Error />,
  }
]);

function App() {
  return (
      <RouterProvider router={router} />
  );
}

export default App;
