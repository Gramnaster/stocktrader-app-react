import { Outlet, useNavigation, redirect } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Loading } from '../../components';

export const loader = (_queryClient: any, store: any) => async () => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  if (!user || user.user_role !== 'admin') {
    toast.warn('You must be an admin to access this page');
    return redirect('/dashboard');
  }

  return {};
};

const DashboardAdmin = () => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';

  return (
    <div>
      {isPageLoading ? (
        <Loading />
      ) : (
        <Outlet />
      )}
    </div>
  );
};
export default DashboardAdmin;
