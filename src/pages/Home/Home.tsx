import { Outlet, useNavigation } from 'react-router-dom';
import { Navbar, Loading } from '../../components';
// import Landing from './Landing';

const Home = () => {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';

  return (
    <>
      {/* <Header /> */}
      <Navbar />
      {isPageLoading ? (
        <Loading />
      ) : (
        <section className="align-element py-20">
          <Outlet />
        </section>
      )}
    </>
  );
};
export default Home;
