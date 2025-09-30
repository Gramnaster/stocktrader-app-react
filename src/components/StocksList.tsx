import { useEffect, useState } from 'react';
import { customFetch } from '../utils';

interface StocksType {
  id: number;
  name: string;
  ticker: string;
  exchange: string;
  web_url: string;
  logo_url: string;
  market_cap: number;
  current_price: number;
  daily_change: number;
  percent_daily_change: number;
  updated_at: Date;
}

const StocksList = () => {
  const [stocks, setStocks] = useState<StocksType[]>([]);

  const fetchStocks = async () => {
    try {
      const response = await customFetch.get('/stocks');
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  useEffect(() => {
    const getStocks = async () => {
      const data = await fetchStocks();
      setStocks(data);
    };
    getStocks();
  }, []);

  const sortedStocks = [...stocks].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="overflow-x-auto max-h-[1000px] overflow-y-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th className="text-right">Current Price</th>
            <th className="text-right">Daily Change</th>
            <th className="text-right">Previous Close</th>
            <th className="text-right">Market Cap</th>
          </tr>
        </thead>
        <tbody>
          {sortedStocks.map((stock) => {
            // Calculate Previous Close: current_price - daily_change
            const prevClose =
              Number(stock.current_price) - Number(stock.daily_change);
            return (
              <tr key={stock.id}>
                <td>{stock.name}</td>
                <td className="text-right">{stock.current_price}</td>
                <td className="text-right">{stock.daily_change}</td>
                <td className="text-right">{prevClose.toFixed(2)}</td>
                <td className="text-right">
                  {Number(stock.market_cap).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default StocksList;
