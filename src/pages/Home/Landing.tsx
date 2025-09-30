import { customFetch } from '../../utils';
import Hero from './Hero';

const url = '/stocks'

export const loader = async () => {
  const response = await customFetch.get(url);
  const stocks = response.data.data;
  return stocks;
};

const Landing = () => {
  return (
    <div>
      <Hero />
    </div>
  );
};
export default Landing;
