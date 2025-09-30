import { Outlet } from "react-router-dom"


const Home = () => {
  return (
    <>
      <nav>
        <span className='text-4x1 text-primary'>Home</span>
      </nav>
      <Outlet />
    </>
  );
}
export default Home