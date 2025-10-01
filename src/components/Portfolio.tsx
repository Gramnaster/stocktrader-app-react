interface Stock {
  id: number;
  company_name?: string;
  name?: string;
  ticker: string;
  current_price: number | string;
  daily_change?: number;
  percent_daily_change?: number;
  market_cap: number | string;
  currency?: string;
  logo_url?: string;
}

interface PortfolioItem {
  id: [number, number];
  user_id: number;
  stock_id: number;
  quantity: string;
  current_market_value: string;
  created_at: string;
  updated_at: string;
  stock: Stock;
}

interface PortfolioProps {
  portfolio: PortfolioItem[];
}

const Portfolio = ({ portfolio }: PortfolioProps) => {
  return (
    <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
      <h2 className="text-xl font-bold mb-6">My Portfolio</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 font-medium text-gray-300">Stock</th>
              <th className="text-right p-4 font-medium text-gray-300">Quantity</th>
              <th className="text-right p-4 font-medium text-gray-300">Current Price</th>
              <th className="text-right p-4 font-medium text-gray-300">Portfolio Value</th>
              <th className="text-right p-4 font-medium text-gray-300">Gain/Loss</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.length > 0 ? (
              portfolio.map((item: PortfolioItem, index: number) => (
                <tr 
                  key={`${item.id[0]}-${item.id[1]}`} 
                  className={`border-b border-gray-800 hover:bg-[#2a2740] transition-colors ${
                    index % 2 === 0 ? 'bg-[#1e1b2e]' : 'bg-[#252238]'
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      {item.stock.logo_url ? (
                        <img 
                          src={item.stock.logo_url} 
                          alt={`${item.stock.ticker} logo`}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-300">
                            {item.stock.ticker?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.stock.ticker}</div>
                        <div className="text-sm text-gray-400">{item.stock.company_name || item.stock.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">{parseInt(item.quantity).toLocaleString()}</td>
                  <td className="p-4 text-right">
                    ${(() => {
                      const currentPrice = typeof item.stock.current_price === 'string' 
                        ? parseFloat(item.stock.current_price) 
                        : item.stock.current_price;
                      return isNaN(currentPrice) ? 'N/A' : currentPrice.toFixed(2);
                    })()}
                  </td>
                  <td className="p-4 text-right">
                    ${(() => {
                      // Calculate portfolio value as quantity * current_price
                      const quantity = parseFloat(item.quantity);
                      const currentPrice = typeof item.stock.current_price === 'string' 
                        ? parseFloat(item.stock.current_price) 
                        : item.stock.current_price;
                      if (isNaN(quantity) || isNaN(currentPrice)) {
                        // Fallback to current_market_value if calculation fails
                        return parseFloat(item.current_market_value).toFixed(2);
                      }
                      return (quantity * currentPrice).toFixed(2);
                    })()}
                  </td>
                  <td className="p-4 text-right font-medium text-gray-400">
                    N/A
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  No stocks in portfolio
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;