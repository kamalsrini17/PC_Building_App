import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Monitor,
  HardDrive,
  Usb,
  Zap,
  Fan,
  ArrowLeft,
  Save,
  Search,
  Filter,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SaveBuildModal from './SaveBuildModal';

// Component categories configuration
const componentCategories = [
  { key: 'cpu', name: 'CPU', icon: Cpu, searchTerms: ['AMD Ryzen 7 7700X processor', 'Intel Core i7 13700K processor', 'desktop processor CPU'] },
  { key: 'gpu', name: 'GPU', icon: Monitor, searchTerms: ['NVIDIA RTX 4070 graphics card', 'AMD RX 7800 XT graphics card', 'gaming graphics card'] },
  { key: 'motherboard', name: 'Motherboard', icon: HardDrive, searchTerms: ['ASUS ROG motherboard ATX', 'MSI gaming motherboard', 'AMD AM5 motherboard'] },
  { key: 'ram', name: 'Memory', icon: Usb, searchTerms: ['Corsair Vengeance DDR5 32GB', 'G.Skill Trident Z5 DDR5', 'desktop memory RAM'] },
  { key: 'storage', name: 'Storage', icon: HardDrive, searchTerms: ['Samsung 980 PRO NVMe SSD', 'WD Black SN850X SSD', 'M.2 NVMe SSD 1TB'] },
  { key: 'psu', name: 'Power Supply', icon: Zap, searchTerms: ['Corsair RM850x power supply', 'EVGA SuperNOVA 750W PSU', 'modular power supply 80+ Gold'] },
  { key: 'cooler', name: 'CPU Cooler', icon: Fan, searchTerms: ['Noctua NH-D15 CPU cooler', 'Corsair H100i AIO cooler', 'CPU air cooler tower'] },
  { key: 'case', name: 'PC Case', icon: Monitor, searchTerms: ['Fractal Design Define 7 case', 'NZXT H7 Flow case', 'ATX mid tower case'] },
  { key: 'fans', name: 'Case Fans', icon: Fan, searchTerms: ['Noctua NF-A12x25 120mm fan', 'Corsair LL120 RGB fan', 'PC case cooling fan'] },
  { key: 'accessories', name: 'Accessories', icon: Usb, searchTerms: ['PC cable management kit', 'Arctic MX-4 thermal paste', 'computer building tools'] }
];

interface BuildPageProps {
  onBackToHome: () => void;
}

interface Product {
  asin: string;
  title: string;
  price?: {
    value: number;
    currency: string;
  };
  image: string;
  rating?: number;
  ratings_total?: number;
  link: string;
}

export default function BuildPage({ onBackToHome }: BuildPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('cpu');
  const [items, setItems] = useState<Product[]>([]);
  const [build, setBuild] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Rainforest API configuration
  const RAINFOREST_API_KEY = import.meta.env.VITE_RAINFOREST_API_KEY;
  const RAINFOREST_API_URL = 'https://api.rainforestapi.com/request';
  const [apiError, setApiError] = useState<string>('');
  const [usingRealData, setUsingRealData] = useState<boolean>(false);

  // Search products using Rainforest API
  const searchProducts = async (category: string, query: string = '') => {
    setApiError('');
    setUsingRealData(false);
    
    if (!RAINFOREST_API_KEY || RAINFOREST_API_KEY === 'your_rainforest_api_key_here') {
      setApiError('Rainforest API key not configured. Using mock data.');
      return getMockData(category);
    }

    setLoading(true);
    try {
      const categoryInfo = componentCategories.find(cat => cat.key === category);
      const searchTerms = categoryInfo?.searchTerms || [category];
      const searchTerm = query || searchTerms[0];

      const params = new URLSearchParams({
        api_key: RAINFOREST_API_KEY,
        type: 'search',
        amazon_domain: 'amazon.com',
        search_term: searchTerm,
        sort_by: 'featured',
        max_page: '1',
        max_results: '16'
      });

      console.log('Making API request with params:', Object.fromEntries(params));
      const response = await fetch(`${RAINFOREST_API_URL}?${params}`);
      
      if (!response.ok) {
        const errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        console.error('API Error:', errorMessage);
        setApiError(errorMessage + '. Using mock data.');
        return getMockData(category);
      }
      
      const data = await response.json();
      console.log('API Response:', data);

      if (data.search_results && data.search_results.length > 0) {
        setUsingRealData(true);
        return data.search_results.map((product: any) => ({
          asin: product.asin,
          title: product.title,
          price: product.price,
          image: product.image,
          rating: product.rating,
          ratings_total: product.ratings_total,
          link: product.link
        }));
      } else {
        setApiError(`No products found for "${searchTerm}". Using mock data.`);
        return getMockData(category);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setApiError(`API Error: ${errorMessage}. Using mock data.`);
      return getMockData(category);
    } finally {
      setLoading(false);
    }
  };

  // Mock data fallback
  const getMockData = (category: string): Product[] => {
    const mockProducts: Record<string, Product[]> = {
      cpu: [
        {
          asin: 'cpu-1',
          title: 'AMD Ryzen 9 7950X 16-Core, 32-Thread Unlocked Desktop Processor',
          price: { value: 699.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.5,
          ratings_total: 1250,
          link: '#'
        },
        {
          asin: 'cpu-2',
          title: 'Intel Core i9-13900K Gaming Desktop Processor 24 cores',
          price: { value: 589.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.4,
          ratings_total: 890,
          link: '#'
        },
        {
          asin: 'cpu-3',
          title: 'AMD Ryzen 7 7700X 8-Core, 16-Thread Unlocked Desktop Processor',
          price: { value: 399.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.6,
          ratings_total: 756,
          link: '#'
        }
      ],
      gpu: [
        {
          asin: 'gpu-1',
          title: 'NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card',
          price: { value: 1599.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.7,
          ratings_total: 432,
          link: '#'
        },
        {
          asin: 'gpu-2',
          title: 'NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card',
          price: { value: 1199.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.5,
          ratings_total: 298,
          link: '#'
        }
      ],
      motherboard: [
        {
          asin: 'mb-1',
          title: 'ASUS ROG Strix X670E-E Gaming WiFi AMD AM5 ATX Motherboard',
          price: { value: 499.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.3,
          ratings_total: 167,
          link: '#'
        }
      ],
      ram: [
        {
          asin: 'ram-1',
          title: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz C16',
          price: { value: 179.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.6,
          ratings_total: 2341,
          link: '#'
        }
      ],
      storage: [
        {
          asin: 'storage-1',
          title: 'Samsung 980 PRO 2TB PCIe 4.0 NVMe M.2 Internal SSD',
          price: { value: 199.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.7,
          ratings_total: 1876,
          link: '#'
        }
      ],
      psu: [
        {
          asin: 'psu-1',
          title: 'Corsair RM850x 850W 80 PLUS Gold Fully Modular ATX Power Supply',
          price: { value: 149.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.8,
          ratings_total: 934,
          link: '#'
        }
      ],
      cooler: [
        {
          asin: 'cooler-1',
          title: 'Noctua NH-D15 Premium CPU Cooler with Dual NF-A15 140mm Fans',
          price: { value: 99.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.9,
          ratings_total: 567,
          link: '#'
        }
      ],
      case: [
        {
          asin: 'case-1',
          title: 'Fractal Design Define 7 ATX Mid Tower Computer Case',
          price: { value: 169.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.4,
          ratings_total: 234,
          link: '#'
        }
      ],
      fans: [
        {
          asin: 'fan-1',
          title: 'Noctua NF-A12x25 PWM Premium Quiet Fan 120mm',
          price: { value: 29.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.8,
          ratings_total: 1456,
          link: '#'
        }
      ],
      accessories: [
        {
          asin: 'acc-1',
          title: 'Cable Management Kit with Velcro Straps and Zip Ties',
          price: { value: 19.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.2,
          ratings_total: 789,
          link: '#'
        }
      ]
    };

    return mockProducts[category] || [];
  };
  // Load products when tab changes
  useEffect(() => {
    searchProducts(activeTab).then(setItems);
  }, [activeTab]);

  // Filter products based on search and price
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const price = item.price?.value || 0;
    const matchesPrice = price >= priceFilter.min && price <= priceFilter.max;
    
    return matchesSearch && matchesPrice;
  });

  // Handle component selection
  const handleSelect = (item: Product) => {
    setBuild(prev => ({ ...prev, [activeTab]: item }));
  };

  // Handle search
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchProducts(activeTab, searchQuery);
      setItems(results);
    } else {
      const results = await searchProducts(activeTab);
      setItems(results);
    }
  };

  // Calculate total price
  const getTotalPrice = () => {
    return Object.values(build).reduce((sum, component) => {
      return sum + (component?.price?.value || 0);
    }, 0);
  };

  // Save build to Supabase
  const handleSaveBuild = async (name: string, description: string = '') => {
    if (!user) return;
    
    const totalPrice = getTotalPrice();

    const { error: saveErr } = await supabase
      .from('builds')
      .insert([{ 
        name, 
        description: description || null,
        user_id: user.id, 
        components: build, 
        total_price: totalPrice 
      }]);

    if (!saveErr) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      console.error('Save error:', saveErr);
      throw new Error('Failed to save build');
    }
    setShowSaveModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-red-900/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToHome}
                className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                Build Your PC
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Price</p>
                <p className="text-xl font-bold text-green-400">
                  ${getTotalPrice().toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={Object.keys(build).length === 0}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
              >
                <Save className="h-5 w-5" />
                <span>Save Build</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Component Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {componentCategories.map(category => {
            const isSelected = build[category.key];
            return (
              <button
                key={category.key}
                onClick={() => setActiveTab(category.key)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === category.key
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                } ${isSelected ? 'ring-2 ring-green-400/50' : ''}`}
              >
                <category.icon className="h-5 w-5" />
                <span>{category.name}</span>
                {isSelected && (
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6 mb-8">
          {/* API Status */}
          <div className="mb-4">
            {usingRealData ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse"></div>
                <p className="text-green-400 text-sm">✓ Using live Amazon product data</p>
              </div>
            ) : apiError ? (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                <p className="text-yellow-400 text-sm">{apiError}</p>
              </div>
            ) : (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                <p className="text-blue-400 text-sm">Ready to search Amazon products</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
                  placeholder={`Search ${componentCategories.find(c => c.key === activeTab)?.name || 'components'}...`}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-600/50">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={priceFilter.min}
                        onChange={(e) => setPriceFilter(prev => ({ ...prev, min: Number(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
                        placeholder="Min"
                        min="0"
                      />
                    </div>
                    <span className="text-gray-400">to</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={priceFilter.max}
                        onChange={(e) => setPriceFilter(prev => ({ ...prev, max: Number(e.target.value) }))}
                        className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
                        placeholder="Max"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setPriceFilter({ min: 0, max: 10000 });
                      searchProducts(activeTab).then(setItems);
                    }}
                    className="bg-gray-600/50 hover:bg-gray-500/50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Components Summary */}
        {Object.keys(build).length > 0 && (
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Selected Components</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(build).map(([category, component]) => {
                const categoryInfo = componentCategories.find(cat => cat.key === category);
                return (
                  <div key={category} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                    {categoryInfo && <categoryInfo.icon className="h-5 w-5 text-red-400" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{component.title}</p>
                      <p className="text-sm text-green-400">
                        ${component.price?.value?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Component Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading components...</p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.asin}
                onClick={() => handleSelect(item)}
                className={`bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden cursor-pointer transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 group ${
                  build[activeTab]?.asin === item.asin ? 'ring-2 ring-red-500 border-red-500' : ''
                }`}
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-700/30">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-300 transition-colors text-sm">
                    {item.title}
                  </h3>
                  
                  {/* Rating */}
                  {item.rating && (
                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(item.rating || 0) ? 'text-yellow-400' : 'text-gray-600'
                            }`}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        ({item.ratings_total || 0})
                      </span>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-green-400">
                      ${item.price?.value?.toFixed(2) || 'N/A'}
                    </p>
                    {build[activeTab]?.asin === item.asin && (
                      <div className="flex items-center space-x-1 text-green-400 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-24 h-24 bg-gray-800/50 rounded-full mb-6 mx-auto">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
            <p className="text-gray-400 mb-6">
              {apiError ? 'API is not available. Please check your configuration.' : 'Try adjusting your search terms or filters to find more products.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPriceFilter({ min: 0, max: 10000 });
                searchProducts(activeTab).then(setItems);
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              {apiError ? 'Retry' : 'Clear Search'}
            </button>
          </div>
        )}
      </div>

      {/* Save Build Modal */}
      <SaveBuildModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBuild}
      />

      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>Build saved successfully!</span>
        </div>
      )}
    </div>
  );
}