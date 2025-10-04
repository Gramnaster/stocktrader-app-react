import { Outlet, useNavigation } from 'react-router-dom';
import { Loading } from '../../components';

const DashboardUser = () => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';

  return (
    <div className='align-element'>
      {isPageLoading ? (
        <Loading />
      ) : (
        <Outlet />
      )}
    </div>
  );
};
export default DashboardUser;