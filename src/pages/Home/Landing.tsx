import { StocksList } from '../../components';
// import { customFetch } from '../../utils';
import Detail from './Detail';
import Hero from './Hero';

// const url = '/stocks'

// export const loader = async () => {
//   const response = await customFetch.get(url);
//   const stocks = response.data;
//   return stocks;
// };

const Landing = () => {
  return (
    <div className='text-center pb-10'>
      <Hero />
      <div className='align-element pt-4 pb-10'>
        <Detail />
        <StocksList />
      </div>
    </div>
  );
};
export default Landing;
