import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components';
import Landing from './Landing';

const Home = () => {
  return (
    <>
      {/* <Header /> */}
      <Navbar />
      <section className="align-element py-20">
        <Outlet />
      </section>
    </>
  );
};
export default Home;
