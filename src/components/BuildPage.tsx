import React, { useState, useEffect } from 'react';
import {
  Cpu, HardDrive, Zap, Fan, Monitor, Usb, ArrowLeft, Save, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SaveBuildModal from './SaveBuildModal';
import { fetchAmazonProducts, searchAmazonProducts } from '../lib/rapidapi';

const componentCategories = [
  { key: 'cpu', name: 'CPU', icon: Cpu, searchTerms: ['Intel', 'AMD', 'processor', 'CPU', 'Core i3', 'Core i5', 'Core i7', 'Core i9', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9'] },
  { key: 'gpu', name: 'GPU', icon: Monitor, searchTerms: ['NVIDIA', 'AMD', 'RTX', 'GTX', 'Radeon', 'graphics card', 'GPU', 'GeForce', 'RX 6000', 'RX 7000'] },
  { key: 'motherboard', name: 'Motherboard', icon: HardDrive, searchTerms: ['motherboard', 'ATX', 'micro ATX', 'mini ITX', 'B550', 'B650', 'X570', 'Z690', 'Z790'] },
  { key: 'memory', name: 'Memory', icon: Usb, searchTerms: ['DDR4', 'DDR5', 'RAM', 'memory', '16GB', '32GB', '64GB', 'Corsair', 'G.Skill', 'Kingston'] },
  { key: 'storage', name: 'Storage', icon: HardDrive, searchTerms: ['SSD', 'NVMe', 'M.2', 'hard drive', 'Samsung', 'WD', 'Seagate', '1TB', '2TB', '4TB'] },
  { key: 'psu', name: 'Power Supply', icon: Zap, searchTerms: ['power supply', 'PSU', '80+', 'modular', '650W', '750W', '850W', '1000W', 'Corsair', 'EVGA'] },
  { key: 'cpuCooler', name: 'CPU Cooler', icon: Fan, searchTerms: ['CPU cooler', 'air cooler', 'liquid cooling', 'AIO', 'Noctua', 'Cooler Master', 'be quiet!'] },
];

export default function BuildPage({ onBackToHome }: { onBackToHome: () => void }) {
  const [activeTab, setActiveTab] = useState('cpu');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [build, setBuild] = useState<Record<string, any>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const currentCategory = componentCategories.find(cat => cat.key === activeTab);

  useEffect(() => {
    loadProducts();
  }, [activeTab, currentPage, sortBy]);

  const loadProducts = async (customQuery?: string) => {
    setLoading(true);
    setError('');
    try {
      console.log(`Loading products for category: ${activeTab}, page: ${currentPage}`);
      
      let products;
      if (customQuery || searchQuery) {
        // Use custom search query
        const query = customQuery || searchQuery;
        products = await searchAmazonProducts(query, currentPage, sortBy, priceRange);
      } else {
        // Load category-specific products with multiple search terms
        products = await fetchAmazonProducts(activeTab, currentPage, sortBy, priceRange);
      }
      
      console.log(`Loaded ${products.items?.length || 0} products`);
      setItems(products.items || []);
      setTotalPages(Math.min(products.totalPages || 1, 10)); // Limit to 10 pages for performance
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products. Please try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts(searchQuery);
  };

  const handleSelect = (component: any) => {
    setBuild(prev => ({ ...prev, [activeTab]: component }));
  };

  const handleSaveBuild = async (buildName: string, description: string) => {
    if (!user) return;
    const buildData = {
      name: buildName,
      description: description || null,
      user_id: user.id,
      components: build,
      total_price: Object.values(build).reduce((sum, part: any) => {
        const price = parseFloat((part?.product_price || '0').replace(/[^0-9.]/g, '')) || 0;
        return sum + price;
      }, 0),
    };

    const { error } = await supabase.from("builds").insert([buildData]);
    if (!error) {
      setSaveSuccess(true);
    } else {
      console.error("Error saving build:", error);
    }
    setShowSaveModal(false);
  };

  const handleCategoryChange = (newCategory: string) => {
    setActiveTab(newCategory);
    setCurrentPage(1);
    setSearchQuery('');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadProducts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSortBy('relevance');
    setCurrentPage(1);
    loadProducts();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-red-900/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
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
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              <Save className="h-5 w-5" />
              <span>Save Build</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {componentCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === cat.key 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <cat.icon className="h-4 w-4" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentCategory?.name} components...`}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-600/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_low_to_high">Price: Low to High</option>
                    <option value="price_high_to_low">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="customer_review">Customer Reviews</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-end space-x-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Search Suggestions */}
        {!searchQuery && currentCategory && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Popular {currentCategory.name} searches:</p>
            <div className="flex flex-wrap gap-2">
              {currentCategory.searchTerms.slice(0, 8).map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    setCurrentPage(1);
                    loadProducts(term);
                  }}
                  className="bg-gray-700/50 hover:bg-red-600/20 text-gray-300 hover:text-red-300 px-3 py-1 rounded-full text-sm transition-colors border border-gray-600/30 hover:border-red-500/30"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading {currentCategory?.name} components...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map((item, index) => (
                <div
                  key={item.asin || index}
                  onClick={() => handleSelect(item)}
                  className={`bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden cursor-pointer transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 ${
                    build[activeTab]?.asin === item.asin ? 'ring-2 ring-red-500 border-red-500' : ''
                  }`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.product_photo || 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop'}
                      alt={item.product_title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2 leading-tight">
                      {item.product_title}
                    </h3>
                    <p className="text-green-400 font-bold text-lg mb-2">
                      {item.product_price || 'Price not available'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.product_star_rating || 'No rating'}</span>
                      <span>{item.product_num_reviews || '0'} reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && items.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-24 h-24 bg-gray-800/50 rounded-full mb-6 mx-auto">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Products Found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filters to find more products.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setPriceRange({ min: '', max: '' });
                setSortBy('relevance');
                setCurrentPage(1);
                loadProducts();
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      <SaveBuildModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBuild}
      />
    </div>
  );
}