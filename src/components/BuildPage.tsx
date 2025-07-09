import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Monitor,
  HardDrive,
  Usb,
  Zap,
  Fan,
  ArrowLeft,
  Save
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SaveBuildModal from './SaveBuildModal';

// Mock data for PC components
const mockComponents = {
  cpu: [
    {
      id: 'cpu-1',
      name: 'AMD Ryzen 9 7950X',
      price: 699.99,
      image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { cores: 16, threads: 32, baseClock: '4.5 GHz', socket: 'AM5' }
    },
    {
      id: 'cpu-2',
      name: 'Intel Core i9-13900K',
      price: 589.99,
      image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { cores: 24, threads: 32, baseClock: '3.0 GHz', socket: 'LGA1700' }
    },
    {
      id: 'cpu-3',
      name: 'AMD Ryzen 7 7700X',
      price: 399.99,
      image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { cores: 8, threads: 16, baseClock: '4.5 GHz', socket: 'AM5' }
    },
    {
      id: 'cpu-4',
      name: 'Intel Core i7-13700K',
      price: 409.99,
      image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { cores: 16, threads: 24, baseClock: '3.4 GHz', socket: 'LGA1700' }
    },
    {
      id: 'cpu-5',
      name: 'AMD Ryzen 5 7600X',
      price: 299.99,
      image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { cores: 6, threads: 12, baseClock: '4.7 GHz', socket: 'AM5' }
    },
    {
      id: 'cpu-6',
      name: 'Intel Core i5-13600K',
      price: 319.99,
      image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { cores: 14, threads: 20, baseClock: '3.5 GHz', socket: 'LGA1700' }
    }
  ],
  gpu: [
    {
      id: 'gpu-1',
      name: 'NVIDIA RTX 4090',
      price: 1599.99,
      image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { memory: '24GB GDDR6X', coreClock: '2230 MHz', powerConsumption: '450W' }
    },
    {
      id: 'gpu-2',
      name: 'NVIDIA RTX 4080',
      price: 1199.99,
      image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { memory: '16GB GDDR6X', coreClock: '2205 MHz', powerConsumption: '320W' }
    },
    {
      id: 'gpu-3',
      name: 'AMD RX 7900 XTX',
      price: 999.99,
      image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { memory: '24GB GDDR6', coreClock: '2300 MHz', powerConsumption: '355W' }
    },
    {
      id: 'gpu-4',
      name: 'NVIDIA RTX 4070',
      price: 599.99,
      image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { memory: '12GB GDDR6X', coreClock: '1920 MHz', powerConsumption: '200W' }
    },
    {
      id: 'gpu-5',
      name: 'AMD RX 7800 XT',
      price: 499.99,
      image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { memory: '16GB GDDR6', coreClock: '2124 MHz', powerConsumption: '263W' }
    },
    {
      id: 'gpu-6',
      name: 'NVIDIA RTX 4060 Ti',
      price: 399.99,
      image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { memory: '8GB GDDR6X', coreClock: '2310 MHz', powerConsumption: '160W' }
    }
  ],
  motherboard: [
    {
      id: 'mb-1',
      name: 'ASUS ROG Strix X670E-E',
      price: 499.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', memorySlots: 4 }
    },
    {
      id: 'mb-2',
      name: 'MSI MPG Z790 Carbon',
      price: 449.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', memorySlots: 4 }
    },
    {
      id: 'mb-3',
      name: 'GIGABYTE B650 AORUS Elite',
      price: 199.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', memorySlots: 4 }
    },
    {
      id: 'mb-4',
      name: 'ASRock B760M Pro RS',
      price: 129.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'Micro-ATX', memorySlots: 4 }
    }
  ],
  ram: [
    {
      id: 'ram-1',
      name: 'Corsair Vengeance DDR5-5600 32GB',
      price: 179.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { capacity: '32GB', speed: 'DDR5-5600', modules: '2x16GB', latency: 'CL36' }
    },
    {
      id: 'ram-2',
      name: 'G.Skill Trident Z5 DDR5-6000 16GB',
      price: 129.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { capacity: '16GB', speed: 'DDR5-6000', modules: '2x8GB', latency: 'CL30' }
    },
    {
      id: 'ram-3',
      name: 'Kingston Fury Beast DDR4-3200 32GB',
      price: 99.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { capacity: '32GB', speed: 'DDR4-3200', modules: '2x16GB', latency: 'CL16' }
    }
  ],
  pcstorage: [
    {
      id: 'storage-1',
      name: 'Samsung 980 PRO 2TB NVMe SSD',
      price: 199.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { capacity: '2TB', type: 'NVMe SSD', interface: 'PCIe 4.0', speed: '7000 MB/s' }
    },
    {
      id: 'storage-2',
      name: 'WD Black SN850X 1TB NVMe SSD',
      price: 129.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { capacity: '1TB', type: 'NVMe SSD', interface: 'PCIe 4.0', speed: '7300 MB/s' }
    },
    {
      id: 'storage-3',
      name: 'Seagate Barracuda 4TB HDD',
      price: 89.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { capacity: '4TB', type: 'HDD', interface: 'SATA III', speed: '5400 RPM' }
    }
  ],
  psu: [
    {
      id: 'psu-1',
      name: 'Corsair RM850x 850W 80+ Gold',
      price: 149.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { wattage: '850W', efficiency: '80+ Gold', modular: 'Fully Modular', warranty: '10 Years' }
    },
    {
      id: 'psu-2',
      name: 'EVGA SuperNOVA 750W 80+ Platinum',
      price: 129.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { wattage: '750W', efficiency: '80+ Platinum', modular: 'Fully Modular', warranty: '10 Years' }
    },
    {
      id: 'psu-3',
      name: 'Seasonic Focus GX-650 650W 80+ Gold',
      price: 99.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { wattage: '650W', efficiency: '80+ Gold', modular: 'Fully Modular', warranty: '10 Years' }
    }
  ],
  cpucooler: [
    {
      id: 'cooler-1',
      name: 'Noctua NH-D15 Air Cooler',
      price: 99.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { type: 'Air Cooler', height: '165mm', fans: '2x140mm', tdp: '250W' }
    },
    {
      id: 'cooler-2',
      name: 'Corsair H100i RGB Elite 240mm AIO',
      price: 149.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { type: 'AIO Liquid', radiator: '240mm', fans: '2x120mm', tdp: '300W' }
    },
    {
      id: 'cooler-3',
      name: 'be quiet! Dark Rock Pro 4',
      price: 89.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { type: 'Air Cooler', height: '163mm', fans: '2x120mm', tdp: '250W' }
    }
  ],
  casefans: [
    {
      id: 'fan-1',
      name: 'Noctua NF-A12x25 120mm Fan',
      price: 29.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { size: '120mm', speed: '2000 RPM', airflow: '60.1 CFM', noise: '22.6 dBA' }
    },
    {
      id: 'fan-2',
      name: 'Corsair LL120 RGB 3-Pack',
      price: 99.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { size: '120mm', speed: '1500 RPM', airflow: '43.25 CFM', features: 'RGB Lighting' }
    },
    {
      id: 'fan-3',
      name: 'be quiet! Silent Wings 3 140mm',
      price: 24.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { size: '140mm', speed: '1000 RPM', airflow: '59.5 CFM', noise: '15.5 dBA' }
    }
  ],
  pccase: [
    {
      id: 'case-1',
      name: 'Fractal Design Define 7 ATX',
      price: 169.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { formFactor: 'ATX', material: 'Steel', dimensions: '240x547x465mm', weight: '12.8kg' }
    },
    {
      id: 'case-2',
      name: 'NZXT H7 Flow Mid-Tower',
      price: 129.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { formFactor: 'ATX', material: 'Steel/Glass', dimensions: '230x494x460mm', weight: '8.2kg' }
    },
    {
      id: 'case-3',
      name: 'Corsair 4000D Airflow',
      price: 104.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { formFactor: 'ATX', material: 'Steel/Glass', dimensions: '230x466x453mm', weight: '7.2kg' }
    }
  ],
  pcaccessories: [
    {
      id: 'acc-1',
      name: 'Cable Management Kit',
      price: 19.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { includes: 'Cable ties, velcro straps, clips', material: 'Nylon', quantity: '50 pieces' }
    },
    {
      id: 'acc-2',
      name: 'Thermal Paste Arctic MX-4',
      price: 9.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { volume: '4g', conductivity: '8.5 W/mK', temperature: '-40°C to 180°C' }
    },
    {
      id: 'acc-3',
      name: 'Anti-Static Wrist Strap',
      price: 7.99,
      image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
      specs: { length: '6ft', resistance: '1 megohm', connector: 'Alligator clip' }
    }
  ]
};

// Component categories configuration
const componentCategories = [
  { key: 'cpu', name: 'CPU', icon: Cpu },
  { key: 'gpu', name: 'GPU', icon: Monitor },
  { key: 'motherboard', name: 'Motherboard', icon: HardDrive },
  { key: 'ram', name: 'Memory', icon: Usb },
  { key: 'pcstorage', name: 'Storage', icon: HardDrive },
  { key: 'psu', name: 'Power Supply', icon: Zap },
  { key: 'cpucooler', name: 'CPU Cooler', icon: Fan },
  { key: 'casefans', name: 'Case Fans', icon: Fan },
  { key: 'pccase', name: 'PC Case', icon: Monitor },
  { key: 'pcaccessories', name: 'Accessories', icon: Usb }
];

interface BuildPageProps {
  onBackToHome: () => void;
}

export default function BuildPage({ onBackToHome }: BuildPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('cpu');
  const [items, setItems] = useState<any[]>([]);
  const [build, setBuild] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load mock data when tab changes
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setItems(mockComponents[activeTab as keyof typeof mockComponents] || []);
      setLoading(false);
    }, 300);
  }, [activeTab]);

  // Handle component selection
  const handleSelect = (item: any) => {
    setBuild(prev => ({ ...prev, [activeTab]: item }));
  };

  // Calculate total price
  const getTotalPrice = () => {
    return Object.values(build).reduce((sum, component: any) => {
      return sum + (component?.price || 0);
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

        {/* Selected Components Summary */}
        {Object.keys(build).length > 0 && (
          <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Selected Components</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(build).map(([category, component]: [string, any]) => {
                const categoryInfo = componentCategories.find(cat => cat.key === category);
                return (
                  <div key={category} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                    {categoryInfo && <categoryInfo.icon className="h-5 w-5 text-red-400" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{component.name}</p>
                      <p className="text-sm text-green-400">${component.price.toFixed(2)}</p>
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
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden cursor-pointer transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 group ${
                  build[activeTab]?.id === item.id ? 'ring-2 ring-red-500 border-red-500' : ''
                }`}
              >
                {/* Product Image */}
                <div className="aspect-square overflow-hidden bg-gray-700/30">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-300 transition-colors">
                    {item.name}
                  </h3>
                  
                  {/* Specs */}
                  <div className="space-y-1 mb-3">
                    {Object.entries(item.specs).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-gray-300">{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-green-400">
                      ${item.price.toFixed(2)}
                    </p>
                    {build[activeTab]?.id === item.id && (
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