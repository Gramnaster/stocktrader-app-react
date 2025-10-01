import { redirect, useLoaderData, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../../utils';
import { StocksList, Portfolio } from '../../components';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

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

interface WalletData {
  balance: string;
}

export const loader = (queryClient: any, store: any) => async ({ params }: any) => {
  const storeState = store.getState();
  const user = storeState.userState?.user;

  if (!user) {
    toast.warn('You must be logged in to trade stocks');
    return redirect('/login');
  }

  const stockId = params.id;

  // Load wallet, portfolio, and selected stock data
  const walletQuery = {
    queryKey: ['wallet', user.id],
    queryFn: async () => {
      const response = await customFetch.get('/wallets/my_wallet', {
        headers: { 'Authorization': user.token },
      });
      return response.data;
    },
  };

  const portfolioQuery = {
    queryKey: ['portfolio', user.id],
    queryFn: async () => {
      const response = await customFetch.get('/portfolios/my_portfolios', {
        headers: { 'Authorization': user.token },
      });
      return response.data;
    },
  };

  const stockQuery = {
    queryKey: ['stock', stockId],
    queryFn: async () => {
      const response = await customFetch.get(`/stocks/${stockId}`, {
        headers: { 'Authorization': user.token },
      });
      return response.data;
    },
  };

  const allStocksQuery = {
    queryKey: ['allStocks'],
    queryFn: async () => {
      const response = await customFetch.get('/stocks', {
        headers: { 'Authorization': user.token },
      });
      return response.data;
    },
  };

  try {
    const [wallet, portfolio, allStocks] = await Promise.all([
      queryClient.ensureQueryData(walletQuery),
      queryClient.ensureQueryData(portfolioQuery),
      queryClient.ensureQueryData(allStocksQuery),
    ]);

    let stock = {};
    if (stockId && !isNaN(parseInt(stockId))) {
      try {
        stock = await queryClient.ensureQueryData(stockQuery);
      } catch (stockError) {
        console.warn(`Failed to load specific stock ${stockId}:`, stockError);
      }
    }

    return { wallet, portfolio, stock, allStocks };
  } catch (error: any) {
    console.error('Failed to load trading data:', error);
    toast.error('Failed to load trading data');
    return { wallet: {}, portfolio: [], stock: {}, allStocks: [] };
  }
};

const Stocktrading = () => {
  const { wallet: initialWallet, portfolio: initialPortfolio, stock: initialStock, allStocks: initialAllStocks } = useLoaderData() as {
    wallet: WalletData;
    portfolio: PortfolioItem[];
    stock: Stock;
    allStocks: Stock[];
  };
  const { id: stockId } = useParams();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  
  // Initialize selectedStockId: use URL param, or first stock from allStocks, or 0
  const [selectedStockId, setSelectedStockId] = useState<number>(() => {
    if (stockId && !isNaN(parseInt(stockId))) {
      return parseInt(stockId);
    }
    // If no stockId in URL, default to first available stock
    if (initialAllStocks && initialAllStocks.length > 0) {
      return initialAllStocks[0].id;
    }
    return 0;
  });
  
  const queryClient = useQueryClient();
  const user = useSelector((state: RootState) => state.userState.user);

  // Live wallet data
  const { data: wallet } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/wallets/my_wallet', {
        headers: { 'Authorization': user?.token },
      });
      return response.data;
    },
    initialData: initialWallet,
    refetchOnWindowFocus: false,
  });

  // Live portfolio data
  const { data: portfolio = [] } = useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: async () => {
      const response = await customFetch.get('/portfolios/my_portfolios', {
        headers: { 'Authorization': user?.token },
      });
      return response.data;
    },
    initialData: initialPortfolio,
    refetchOnWindowFocus: false,
  });

  // Live stock data (only query if stockId exists and is valid)
  const { data: stock } = useQuery({
    queryKey: ['stock', stockId],
    queryFn: async () => {
      const response = await customFetch.get(`/stocks/${stockId}`, {
        headers: { 'Authorization': user?.token },
      });
      return response.data;
    },
    initialData: initialStock,
    refetchOnWindowFocus: false,
    enabled: Boolean(stockId && !isNaN(parseInt(stockId))), // Only run query if stockId is valid
  });

  // Live all stocks data
  const { data: allStocks = [] } = useQuery({
    queryKey: ['allStocks'],
    queryFn: async () => {
      const response = await customFetch.get('/stocks', {
        headers: { 'Authorization': user?.token },
      });
      return response.data;
    },
    initialData: initialAllStocks,
    refetchOnWindowFocus: false,
    select: (data) => {
      // Sort stocks alphabetically by ticker
      return [...(data || [])].sort((a, b) => {
        return a.ticker.localeCompare(b.ticker);
      });
    },
  });

  // Get selected stock for trading (can be different from URL stock)
  const selectedStock = allStocks.find((s: Stock) => s.id === selectedStockId) || stock || null;
  const selectedStockInPortfolio = portfolio.find((item: PortfolioItem) => item.stock.id === selectedStockId);

  // Update selectedStockId if current selection is invalid and allStocks are available
  useEffect(() => {
    if (allStocks && allStocks.length > 0) {
      // If current selectedStockId is 0 or doesn't exist in allStocks, select the first one
      if (selectedStockId === 0 || !allStocks.find(s => s.id === selectedStockId)) {
        setSelectedStockId(allStocks[0].id);
      }
    }
  }, [allStocks, selectedStockId]);

  // Handle stock selection change
  const handleStockSelection = (stockId: string) => {
    const newStockId = parseInt(stockId);
    if (!isNaN(newStockId)) {
      setSelectedStockId(newStockId);
    }
  };

  // Helper function to reset total displays
  const resetTotalDisplays = () => {
    const totalCostElement = document.getElementById('total-buying-cost');
    const totalRevenueElement = document.getElementById('total-revenue');
    if (totalCostElement) totalCostElement.textContent = '$0.00';
    if (totalRevenueElement) totalRevenueElement.textContent = '$0.00';
  };

  // Reset displays when tab changes or stock selection changes
  useEffect(() => {
    resetTotalDisplays();
    // Also reset any quantity inputs
    const quantityInputs = document.querySelectorAll('input[name="quantity"]');
    quantityInputs.forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.value = '';
      }
    });
  }, [activeTab, selectedStockId]);

  // Buy Stock Mutation
  const buyMutation = useMutation({
    mutationFn: async ({ ticker, quantity }: { ticker: string; quantity: number }) => {
      const response = await customFetch.post('/portfolios/buy', 
        { ticker, quantity }, 
        {
          headers: {
            'Authorization': user?.token,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    },
    onMutate: async ({ quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['wallet', user?.id] });
      await queryClient.cancelQueries({ queryKey: ['portfolio', user?.id] });

      const previousWallet = queryClient.getQueryData(['wallet', user?.id]);
      const previousPortfolio = queryClient.getQueryData(['portfolio', user?.id]);

      // Optimistically update wallet balance
      const price = typeof selectedStock?.current_price === 'string' 
        ? parseFloat(selectedStock.current_price) 
        : selectedStock?.current_price || 0;
      const totalCost = quantity * price;
      queryClient.setQueryData(['wallet', user?.id], (old: any) => ({
        ...old,
        balance: (parseFloat(old?.balance || '0') - totalCost).toFixed(2)
      }));

      return { previousWallet, previousPortfolio };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData(['wallet', user?.id], context?.previousWallet);
      queryClient.setQueryData(['portfolio', user?.id], context?.previousPortfolio);
      console.error('Buy failed:', err);
      const errorMessage = (err as any).response?.data?.message || 'Buy order failed. Please try again.';
      toast.error(errorMessage);
    },
    onSuccess: (_data, variables) => {
      toast.success(`Successfully bought ${variables.quantity} shares of ${variables.ticker}`);
      resetTotalDisplays();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
    },
  });

  // Sell Stock Mutation
  const sellMutation = useMutation({
    mutationFn: async ({ ticker, quantity }: { ticker: string; quantity: number }) => {
      const response = await customFetch.post('/portfolios/sell', 
        { ticker, quantity }, 
        {
          headers: {
            'Authorization': user?.token,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    },
    onMutate: async ({ quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['wallet', user?.id] });
      await queryClient.cancelQueries({ queryKey: ['portfolio', user?.id] });

      const previousWallet = queryClient.getQueryData(['wallet', user?.id]);
      const previousPortfolio = queryClient.getQueryData(['portfolio', user?.id]);

      // Optimistically update wallet balance
      const price = typeof selectedStock?.current_price === 'string' 
        ? parseFloat(selectedStock.current_price) 
        : selectedStock?.current_price || 0;
      const totalRevenue = quantity * price;
      queryClient.setQueryData(['wallet', user?.id], (old: any) => ({
        ...old,
        balance: (parseFloat(old?.balance || '0') + totalRevenue).toFixed(2)
      }));

      return { previousWallet, previousPortfolio };
    },
    onError: (err, _variables, context) => {
      queryClient.setQueryData(['wallet', user?.id], context?.previousWallet);
      queryClient.setQueryData(['portfolio', user?.id], context?.previousPortfolio);
      console.error('Sell failed:', err);
      const errorMessage = (err as any).response?.data?.message || 'Sell order failed. Please try again.';
      toast.error(errorMessage);
    },
    onSuccess: (_data, variables) => {
      toast.success(`Successfully sold ${variables.quantity} shares of ${variables.ticker}`);
      resetTotalDisplays();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', user?.id] });
    },
  });

  const handleBuy = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedStock || !selectedStock.current_price || !selectedStock.ticker) {
      toast.error('Please select a valid stock');
      return;
    }

    const price = typeof selectedStock.current_price === 'string' 
      ? parseFloat(selectedStock.current_price) 
      : selectedStock.current_price;
    
    if (isNaN(price) || price <= 0) {
      toast.error('Invalid stock price');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const quantity = parseInt(formData.get('quantity') as string);
    const totalCost = quantity * price;
    
    if (quantity > 0 && totalCost <= parseFloat(wallet?.balance || '0')) {
      buyMutation.mutate({ ticker: selectedStock.ticker, quantity });
      e.currentTarget.reset();
    } else if (totalCost > parseFloat(wallet?.balance || '0')) {
      toast.error('Insufficient funds');
    }
  };

  const handleSell = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedStock || !selectedStock.current_price || !selectedStock.ticker) {
      toast.error('Please select a valid stock');
      return;
    }

    const price = typeof selectedStock.current_price === 'string' 
      ? parseFloat(selectedStock.current_price) 
      : selectedStock.current_price;
    
    if (isNaN(price) || price <= 0) {
      toast.error('Invalid stock price');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const quantity = parseInt(formData.get('quantity') as string);
    const availableShares = parseInt(selectedStockInPortfolio?.quantity || '0');
    
    if (quantity > 0 && quantity <= availableShares) {
      sellMutation.mutate({ ticker: selectedStock.ticker, quantity });
      e.currentTarget.reset();
    } else if (quantity > availableShares) {
      toast.error('Not enough shares to sell');
    }
  };

  const calculateTotalCost = (quantity: number) => {
    if (!selectedStock || !selectedStock.current_price) return 0;
    const price = typeof selectedStock.current_price === 'string' 
      ? parseFloat(selectedStock.current_price) 
      : selectedStock.current_price;
    return isNaN(price) ? 0 : quantity * price;
  };

  const calculateTotalRevenue = (quantity: number) => {
    if (!selectedStock || !selectedStock.current_price) return 0;
    const price = typeof selectedStock.current_price === 'string' 
      ? parseFloat(selectedStock.current_price) 
      : selectedStock.current_price;
    return isNaN(price) ? 0 : quantity * price;
  };

  return (
    <div className="min-h-screen bg-[#161420] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Trading Interface */}
          <div className="lg:col-span-1">
            {/* Tab Buttons */}
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab('buy')}
                className={`px-6 py-2 rounded-l-lg font-semibold transition-colors ${
                  activeTab === 'buy'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`px-6 py-2 rounded-r-lg font-semibold transition-colors ${
                  activeTab === 'sell'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Trading Form */}
            <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {activeTab === 'buy' ? 'Buying from' : 'Selling from'}
              </h3>
              
              {/* Stock Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {activeTab === 'buy' ? 'Select Stock to Buy' : 'Select Stock to Sell'}
                </label>
                <div className="relative">
                  <select 
                    value={selectedStockId}
                    onChange={(e) => handleStockSelection(e.target.value)}
                    className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white appearance-none cursor-pointer"
                  >
                    {activeTab === 'buy' ? (
                      // For buying: show all available stocks
                      allStocks && allStocks.length > 0 ? (
                        allStocks.map((stockOption: Stock) => (
                          <option key={stockOption.id} value={stockOption.id}>
                            {stockOption.ticker} - {stockOption.company_name || stockOption.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Loading stocks...</option>
                      )
                    ) : (
                      // For selling: show only stocks in portfolio
                      portfolio && portfolio.length > 0 ? (
                        portfolio.map((portfolioItem: PortfolioItem) => (
                          <option key={portfolioItem.stock.id} value={portfolioItem.stock.id}>
                            {portfolioItem.stock.ticker} - {portfolioItem.stock.company_name || portfolioItem.stock.name}
                          </option>
                        ))
                      ) : (
                        <option value="">No stocks in portfolio</option>
                      )
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Display selected stock with logo */}
                {selectedStock && (
                  <div className="mt-3 p-3 bg-[#1e1b2e] rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-3">
                      {selectedStock.logo_url ? (
                        <img 
                          src={selectedStock.logo_url} 
                          alt={`${selectedStock.ticker} logo`}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-gray-300">
                            {selectedStock.ticker?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-lg">{selectedStock.ticker}</div>
                        <div className="text-sm text-gray-400">{selectedStock.company_name || selectedStock.name}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Current Price per Stock (USD)</label>
                <div className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white text-right text-xl">
                  ${(() => {
                    if (!selectedStock || !selectedStock.current_price) return '0.00';
                    const price = typeof selectedStock.current_price === 'string' 
                      ? parseFloat(selectedStock.current_price) 
                      : selectedStock.current_price;
                    return isNaN(price) ? '0.00' : price.toFixed(2);
                  })()}
                </div>
              </div>

              {/* Trading Form */}
              {activeTab === 'buy' ? (
                <form onSubmit={handleBuy} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount of Stocks</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      placeholder="10,500"
                      className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white"
                      required
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        const totalCost = calculateTotalCost(quantity);
                        const totalCostElement = document.getElementById('total-buying-cost');
                        if (totalCostElement) {
                          totalCostElement.textContent = totalCost.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Total Buying Cost (USD)</label>
                    <div id="total-buying-cost" className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white text-right text-xl">
                      $0.00
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={buyMutation.isPending}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {buyMutation.isPending ? 'Processing...' : 'Buy Stocks'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSell} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount of Stocks</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      max={parseInt(selectedStockInPortfolio?.quantity || '0')}
                      placeholder="10,500"
                      className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white"
                      required
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        const totalRevenue = calculateTotalRevenue(quantity);
                        const totalRevenueElement = document.getElementById('total-revenue');
                        if (totalRevenueElement) {
                          totalRevenueElement.textContent = totalRevenue.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          });
                        }
                      }}
                    />
                    {selectedStockInPortfolio && (
                      <p className="text-sm text-gray-400 mt-1">
                        Available: {parseInt(selectedStockInPortfolio.quantity).toLocaleString()} shares
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Receiving Total (USD)</label>
                    <div id="total-revenue" className="w-full bg-[#2a2740] border border-gray-600 rounded-lg p-3 text-white text-right text-xl">
                      $0.00
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sellMutation.isPending || !selectedStockInPortfolio}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {sellMutation.isPending ? 'Processing...' : 'Sell Stocks'}
                  </button>

                  {!selectedStockInPortfolio && (
                    <p className="text-sm text-gray-400 text-center">
                      You don't own any shares of this stock
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Current Balance */}
            <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Current Balance</h3>
              <div className="text-3xl font-bold mb-2">
                $ {wallet?.balance || '0.00'}<span className="text-sm font-normal text-gray-400">USD</span>
              </div>
              <div className="text-sm text-gray-400 mb-4">
                = ₱ 0.00PHP
              </div>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Deposit
              </button>
            </div>
          </div>

          {/* Right Side - Portfolio & Available Stocks */}
          <div className="lg:col-span-2">
            {/* Portfolio Section */}
            <Portfolio portfolio={portfolio} />

            {/* Available Stocks */}
            <div className="bg-[#1e1b2e] rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">Available Stocks</h2>
              <StocksList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stocktrading;