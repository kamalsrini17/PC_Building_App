import React, { useState, useEffect } from 'react';
import {
  Cpu, HardDrive, Zap, Fan, Monitor, Usb, ArrowLeft, Save, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SaveBuildModal from './SaveBuildModal';

const componentCategories = [
  { key: 'cpu', name: 'CPU', icon: Cpu },
  { key: 'gpu', name: 'GPU', icon: Monitor },
  { key: 'motherboard', name: 'Motherboard', icon: HardDrive },
  { key: 'memory', name: 'Memory', icon: Usb },
  { key: 'storage', name: 'Storage', icon: HardDrive },
  { key: 'psu', name: 'Power Supply', icon: Zap },
  { key: 'cpuCooler', name: 'CPU Cooler', icon: Fan },
];

// Mock component data
const mockComponents: Record<string, any[]> = {
  cpu: [
    {
      id: "cpu-1",
      name: "Intel Core i9-13900K",
      price: 589.99,
      image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 1234,
      specs: ["24 cores", "5.8 GHz boost", "36MB cache"]
    },
    {
      id: "cpu-2", 
      name: "AMD Ryzen 9 7900X",
      price: 429.99,
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 892,
      specs: ["12 cores", "5.6 GHz boost", "76MB cache"]
    },
    {
      id: "cpu-3",
      name: "Intel Core i7-13700K",
      price: 409.99,
      image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 2156,
      specs: ["16 cores", "5.4 GHz boost", "30MB cache"]
    },
    {
      id: "cpu-4",
      name: "AMD Ryzen 7 7700X",
      price: 349.99,
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 1567,
      specs: ["8 cores", "5.4 GHz boost", "40MB cache"]
    },
    {
      id: "cpu-5",
      name: "Intel Core i5-13600K",
      price: 319.99,
      image: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 3421,
      specs: ["14 cores", "5.1 GHz boost", "24MB cache"]
    },
    {
      id: "cpu-6",
      name: "AMD Ryzen 5 7600X",
      price: 249.99,
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 2890,
      specs: ["6 cores", "5.3 GHz boost", "38MB cache"]
    }
  ],
  gpu: [
    {
      id: "gpu-1",
      name: "NVIDIA GeForce RTX 4090",
      price: 1599.99,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 567,
      specs: ["24GB GDDR6X", "16384 CUDA cores", "450W TDP"]
    },
    {
      id: "gpu-2",
      name: "AMD Radeon RX 7900 XTX",
      price: 999.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 423,
      specs: ["24GB GDDR6", "6144 stream processors", "355W TDP"]
    },
    {
      id: "gpu-3",
      name: "NVIDIA GeForce RTX 4080",
      price: 1199.99,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 789,
      specs: ["16GB GDDR6X", "9728 CUDA cores", "320W TDP"]
    },
    {
      id: "gpu-4",
      name: "AMD Radeon RX 7800 XT",
      price: 499.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 1234,
      specs: ["16GB GDDR6", "3840 stream processors", "263W TDP"]
    },
    {
      id: "gpu-5",
      name: "NVIDIA GeForce RTX 4070",
      price: 599.99,
      image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 2156,
      specs: ["12GB GDDR6X", "5888 CUDA cores", "200W TDP"]
    },
    {
      id: "gpu-6",
      name: "AMD Radeon RX 7600",
      price: 269.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.2,
      reviews: 1890,
      specs: ["8GB GDDR6", "2048 stream processors", "165W TDP"]
    }
  ],
  motherboard: [
    {
      id: "mb-1",
      name: "ASUS ROG STRIX X670E-E Gaming WiFi",
      price: 499.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 234,
      specs: ["ATX", "AM5 socket", "WiFi 6E", "PCIe 5.0"]
    },
    {
      id: "mb-2",
      name: "MSI MAG B650 TOMAHAWK WiFi",
      price: 229.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 456,
      specs: ["ATX", "AM5 socket", "WiFi 6", "PCIe 4.0"]
    },
    {
      id: "mb-3",
      name: "ASUS PRIME Z790-A WiFi",
      price: 279.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.3,
      reviews: 789,
      specs: ["ATX", "LGA1700", "WiFi 6", "PCIe 5.0"]
    },
    {
      id: "mb-4",
      name: "MSI PRO B760M-A WiFi",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.2,
      reviews: 567,
      specs: ["Micro ATX", "LGA1700", "WiFi 6", "PCIe 4.0"]
    }
  ],
  memory: [
    {
      id: "ram-1",
      name: "Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 3456,
      specs: ["32GB kit", "DDR4-3200", "CL16", "1.35V"]
    },
    {
      id: "ram-2",
      name: "G.Skill Trident Z5 32GB (2x16GB) DDR5 5600MHz",
      price: 159.99,
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 1234,
      specs: ["32GB kit", "DDR5-5600", "CL36", "1.25V"]
    },
    {
      id: "ram-3",
      name: "Kingston Fury Beast 16GB (2x8GB) DDR4 3200MHz",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 2890,
      specs: ["16GB kit", "DDR4-3200", "CL16", "1.35V"]
    },
    {
      id: "ram-4",
      name: "Corsair Dominator Platinum RGB 64GB (2x32GB) DDR5 5200MHz",
      price: 399.99,
      image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 567,
      specs: ["64GB kit", "DDR5-5200", "CL40", "RGB lighting"]
    }
  ],
  storage: [
    {
      id: "ssd-1",
      name: "Samsung 980 PRO 2TB PCIe 4.0 NVMe M.2 SSD",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 5678,
      specs: ["2TB capacity", "PCIe 4.0", "7000 MB/s read", "M.2 2280"]
    },
    {
      id: "ssd-2",
      name: "WD Black SN850X 1TB PCIe Gen4 NVMe M.2 SSD",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 2345,
      specs: ["1TB capacity", "PCIe 4.0", "7300 MB/s read", "M.2 2280"]
    },
    {
      id: "ssd-3",
      name: "Crucial P5 Plus 500GB PCIe 4.0 NVMe M.2 SSD",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 1890,
      specs: ["500GB capacity", "PCIe 4.0", "6600 MB/s read", "M.2 2280"]
    },
    {
      id: "ssd-4",
      name: "Seagate FireCuda 530 4TB PCIe Gen4 NVMe M.2 SSD",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 1234,
      specs: ["4TB capacity", "PCIe 4.0", "7300 MB/s read", "M.2 2280"]
    }
  ],
  psu: [
    {
      id: "psu-1",
      name: "Corsair RM1000x 1000W 80+ Gold Fully Modular PSU",
      price: 179.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.8,
      reviews: 1567,
      specs: ["1000W", "80+ Gold", "Fully modular", "10 year warranty"]
    },
    {
      id: "psu-2",
      name: "EVGA SuperNOVA 850 G6 850W 80+ Gold Modular PSU",
      price: 139.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.6,
      reviews: 987,
      specs: ["850W", "80+ Gold", "Fully modular", "10 year warranty"]
    },
    {
      id: "psu-3",
      name: "Seasonic Focus GX-750 750W 80+ Gold Modular PSU",
      price: 119.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 2345,
      specs: ["750W", "80+ Gold", "Fully modular", "10 year warranty"]
    },
    {
      id: "psu-4",
      name: "be quiet! Straight Power 11 650W 80+ Gold PSU",
      price: 99.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 1678,
      specs: ["650W", "80+ Gold", "Semi-modular", "5 year warranty"]
    }
  ],
  cpuCooler: [
    {
      id: "cooler-1",
      name: "Noctua NH-D15 Premium CPU Cooler",
      price: 109.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.9,
      reviews: 2345,
      specs: ["Dual tower", "140mm fans", "165mm height", "6 year warranty"]
    },
    {
      id: "cooler-2",
      name: "Corsair H100i RGB PLATINUM 240mm Liquid CPU Cooler",
      price: 159.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.5,
      reviews: 1789,
      specs: ["240mm radiator", "RGB lighting", "Liquid cooling", "5 year warranty"]
    },
    {
      id: "cooler-3",
      name: "be quiet! Dark Rock Pro 4 CPU Cooler",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.7,
      reviews: 1456,
      specs: ["Dual tower", "Silent operation", "163mm height", "3 year warranty"]
    },
    {
      id: "cooler-4",
      name: "NZXT Kraken X63 280mm Liquid CPU Cooler",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
      rating: 4.4,
      reviews: 987,
      specs: ["280mm radiator", "RGB lighting", "CAM software", "6 year warranty"]
    }
  ]
};

export default function BuildPage({ onBackToHome }: { onBackToHome: () => void }) {
  const [activeTab, setActiveTab] = useState('cpu');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [build, setBuild] = useState<Record<string, any>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const { user } = useAuth();

  const currentCategory = componentCategories.find(cat => cat.key === activeTab);

  useEffect(() => {
    loadComponents();
  }, [activeTab]);

  useEffect(() => {
    filterComponents();
  }, [items, searchQuery]);

  const loadComponents = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      const categoryItems = mockComponents[activeTab] || [];
      setItems(categoryItems);
      setLoading(false);
    }, 300);
  };

  const filterComponents = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specs.some((spec: string) => spec.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredItems(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterComponents();
  };

  const handleSelect = (component: any) => {
    setBuild(prev => ({ ...prev, [activeTab]: component }));
  };

  const handleSaveBuild = async (buildName: string, description: string) => {
    if (!user) return;
    
    const totalPrice = Object.values(build).reduce((sum, part: any) => {
      return sum + (part?.price || 0);
    }, 0);

    const buildData = {
      name: buildName,
      description: description || null,
      user_id: user.id,
      components: build,
      total_price: totalPrice,
    };

    const { error } = await supabase.from("builds").insert([buildData]);
    if (!error) {
      alert('Build saved successfully!');
    } else {
      console.error("Error saving build:", error);
      alert('Failed to save build. Please try again.');
    }
    setShowSaveModal(false);
  };

  const handleCategoryChange = (newCategory: string) => {
    setActiveTab(newCategory);
    setSearchQuery('');
  };

  const getTotalPrice = () => {
    return Object.values(build).reduce((sum, part: any) => {
      return sum + (part?.price || 0);
    }, 0);
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
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">
                Total: <span className="text-green-400 font-bold">${getTotalPrice().toFixed(2)}</span>
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
              {build[cat.key] && (
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${currentCategory?.name} components...`}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Selected Component Summary */}
        {Object.keys(build).length > 0 && (
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Current Build</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {componentCategories.map((cat) => (
                <div key={cat.key} className="flex items-center space-x-3">
                  <cat.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{cat.name}:</span>
                  {build[cat.key] ? (
                    <span className="text-sm text-green-400 font-medium truncate">
                      {build[cat.key].name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">Not selected</span>
                  )}
                </div>
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

        {/* Components Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden cursor-pointer transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 ${
                  build[activeTab]?.id === item.id ? 'ring-2 ring-red-500 border-red-500' : ''
                }`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white text-sm font-semibold mb-2 line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-green-400 font-bold text-lg mb-2">
                    ${item.price.toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <span>★ {item.rating}</span>
                    <span>{item.reviews.toLocaleString()} reviews</span>
                  </div>
                  <div className="space-y-1">
                    {item.specs.slice(0, 2).map((spec: string, index: number) => (
                      <div key={index} className="text-xs text-gray-400">
                        • {spec}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-24 h-24 bg-gray-800/50 rounded-full mb-6 mx-auto">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Components Found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms to find more components.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Clear Search
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