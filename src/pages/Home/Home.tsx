import { Outlet } from "react-router-dom"


const Home = () => {
  return (
    <>
      <nav>
        <span className='text-4x1 text-primary'>Orbital Finances</span>
        <p> Hello, can you see this better? </p>
      </nav>
      <Outlet />
    </>
  );
}
export default Home