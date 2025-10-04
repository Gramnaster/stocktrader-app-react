import { Outlet, useNavigation } from 'react-router-dom';
import { Navbar, Loading } from '../../components';
import Copyright from './Copyright';
// import Landing from './Landing';

const Home = () => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';

  return (
    <section className=''>
      {/* <Header /> */}
      <Navbar />
      {isPageLoading ? (
        <Loading />
      ) : (
        <section className="">
          <Outlet />
        </section>
      )}
      <Copyright />
    </section>
  );
};
export default Home;
