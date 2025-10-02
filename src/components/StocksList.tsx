import { useEffect, useState } from 'react';
import { customFetch } from '../utils';
import { useNavigate } from 'react-router-dom';

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
  const [searchWord, setSearchWord] = useState('');
  const navigate = useNavigate();

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

  // Filter and sort stocks
  const filteredAndSortedStocks = stocks
    .filter((stock) => {
      const searchLower = searchWord.toLowerCase();
      const matchesName = stock.name.toLowerCase().includes(searchLower);
      const matchesTicker = stock.ticker.toLowerCase().includes(searchLower);
      const matchesExchange = stock.exchange.toLowerCase().includes(searchLower);
      
      return matchesName || matchesTicker || matchesExchange;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {/* Search Bar */}
      <div className="bg-[#1e1b2e] rounded-lg p-4 border border-gray-700 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by Name, Ticker, or Exchange"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 pl-10 text-white placeholder-gray-400"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="text-left p-4 text-xs font-extralight text-gray-300">Name</th>
              <th className="text-right p-4 text-xs font-extralight text-gray-300">Current Price</th>
              <th className="text-right p-4 text-xs font-extralight text-gray-300">Daily Change</th>
              <th className="text-right p-4 text-xs font-extralight text-gray-300">Previous Close</th>
              <th className="text-right p-4 text-xs font-extralight text-gray-300">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedStocks.length > 0 ? (
              filteredAndSortedStocks.map((stock) => {
                const prevClose = Number(stock.current_price) - Number(stock.daily_change);
                return (
                  <tr
                    key={stock.id}
                    onClick={() => navigate(`/dashboard/stocktrading/${stock.id}`)}
                    className="cursor-pointer hover:bg-gray-100 hover:bg-opacity-10 transition-colors"
                  >
                    <td className="hover:text-pink-400 transition-colors p-4 text-xs font-normal">
                      <div className="flex items-center gap-2">
                        {stock.logo_url ? (
                          <img
                            src={stock.logo_url}
                            alt={stock.ticker}
                            className="w-6 h-6 rounded object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs">
                            {stock.ticker.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold">[{stock.ticker}]</span>
                        <span className="text-gray-400">{stock.name}</span>
                      </div>
                    </td>
                    <td className="text-right p-4 text-xs font-normal">{stock.current_price}</td>
                    <td className="text-right p-4 text-xs font-normal">{stock.daily_change}</td>
                    <td className="text-right p-4 text-xs font-normal">{prevClose.toFixed(2)}</td>
                    <td className="text-right p-4 text-xs font-normal">
                      {(Number(stock.market_cap) / 1_000_000_000).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}B
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8 text-xs font-normal">
                  No stocks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StocksList;
