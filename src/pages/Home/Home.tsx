import { Outlet } from 'react-router-dom';
import { Header } from '../../components';

const Home = () => {
  return (
    <>
      <Header />
      <section className="align-element py-20">
        <Outlet />
      </section>
    </>
  );
};
export default Home;
