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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SaveBuildModal from './SaveBuildModal';
import PartInfoPage from './PartInfoPage';

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
  // Technical specifications for compatibility checking
  socket?: string;
  ramType?: string;
  pcieVersion?: string;
  estimatedWattage?: number;
  wattage?: number; // For PSU
  formFactor?: string;
  ramSlots?: number;
  maxRamCapacity?: number;
  chipset?: string;
  coolerHeight?: number; // in mm
  gpuLength?: number; // in mm
  caseMaxGpuLength?: number; // in mm
  caseMaxCoolerHeight?: number; // in mm
}

interface CompatibilityIssue {
  component1Key: string;
  component2Key: string;
  message: string;
  severity: 'error' | 'warning';
}

export default function BuildPage({ onBackToHome }: BuildPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('cpu');
  const [items, setItems] = useState<Product[]>([]);
  const [build, setBuild] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [compatibilityIssues, setCompatibilityIssues] = useState<CompatibilityIssue[]>([]);
  const [showPartInfo, setShowPartInfo] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<Product | null>(null);

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
          link: '#',
          socket: 'AM5',
          estimatedWattage: 170,
          chipset: 'X670E'
        },
        {
          asin: 'cpu-2',
          title: 'Intel Core i9-13900K Gaming Desktop Processor 24 cores',
          price: { value: 589.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.4,
          ratings_total: 890,
          link: '#',
          socket: 'LGA1700',
          estimatedWattage: 125,
          chipset: 'Z790'
        },
        {
          asin: 'cpu-3',
          title: 'AMD Ryzen 7 7700X 8-Core, 16-Thread Unlocked Desktop Processor',
          price: { value: 399.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.6,
          ratings_total: 756,
          link: '#',
          socket: 'AM5',
          estimatedWattage: 105,
          chipset: 'X670E'
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
          link: '#',
          pcieVersion: 'PCIe 4.0',
          estimatedWattage: 450,
          gpuLength: 336
        },
        {
          asin: 'gpu-2',
          title: 'NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card',
          price: { value: 1199.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.5,
          ratings_total: 298,
          link: '#',
          pcieVersion: 'PCIe 4.0',
          estimatedWattage: 320,
          gpuLength: 310
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
          link: '#',
          socket: 'AM5',
          ramType: 'DDR5',
          pcieVersion: 'PCIe 5.0',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamCapacity: 128,
          chipset: 'X670E',
          estimatedWattage: 25
        },
        {
          asin: 'mb-2',
          title: 'MSI MAG Z790 TOMAHAWK WiFi Intel LGA1700 ATX Motherboard',
          price: { value: 279.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.4,
          ratings_total: 234,
          link: '#',
          socket: 'LGA1700',
          ramType: 'DDR5',
          pcieVersion: 'PCIe 5.0',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamCapacity: 128,
          chipset: 'Z790',
          estimatedWattage: 25
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
          link: '#',
          ramType: 'DDR4',
          estimatedWattage: 10
        },
        {
          asin: 'ram-2',
          title: 'G.Skill Trident Z5 32GB (2x16GB) DDR5-6000 CL36',
          price: { value: 249.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.7,
          ratings_total: 1456,
          link: '#',
          ramType: 'DDR5',
          estimatedWattage: 12
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
          link: '#',
          pcieVersion: 'PCIe 4.0',
          estimatedWattage: 8
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
          link: '#',
          wattage: 850,
          estimatedWattage: 0
        },
        {
          asin: 'psu-2',
          title: 'EVGA SuperNOVA 750 G6 750W 80 Plus Gold Fully Modular',
          price: { value: 119.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.6,
          ratings_total: 567,
          link: '#',
          wattage: 750,
          estimatedWattage: 0
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
          link: '#',
          coolerHeight: 165,
          estimatedWattage: 5
        },
        {
          asin: 'cooler-2',
          title: 'Corsair H100i RGB PLATINUM 240mm Liquid CPU Cooler',
          price: { value: 159.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.5,
          ratings_total: 789,
          link: '#',
          coolerHeight: 27,
          estimatedWattage: 15
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
          link: '#',
          formFactor: 'ATX',
          caseMaxGpuLength: 440,
          caseMaxCoolerHeight: 185,
          estimatedWattage: 0
        },
        {
          asin: 'case-2',
          title: 'NZXT H7 Flow RGB ATX Mid Tower Case',
          price: { value: 139.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.3,
          ratings_total: 456,
          link: '#',
          formFactor: 'ATX',
          caseMaxGpuLength: 381,
          caseMaxCoolerHeight: 165,
          estimatedWattage: 0
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
          link: '#',
          estimatedWattage: 3
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
          link: '#',
          estimatedWattage: 0
        }
      ]
    };

    return mockProducts[category] || [];
  };

  // Compatibility checking function
  const checkCompatibility = async (currentBuild: Record<string, Product>): Promise<CompatibilityIssue[]> => {
    const issues: CompatibilityIssue[] = [];
    
    const cpu = currentBuild.cpu;
    const motherboard = currentBuild.motherboard;
    const ram = currentBuild.ram;
    const gpu = currentBuild.gpu;
    const psu = currentBuild.psu;
    const cooler = currentBuild.cooler;
    const pcCase = currentBuild.case;

    // CPU and Motherboard socket compatibility
    if (cpu && motherboard) {
      if (cpu.socket && motherboard.socket && cpu.socket !== motherboard.socket) {
        issues.push({
          component1Key: 'cpu',
          component2Key: 'motherboard',
          message: `CPU socket (${cpu.socket}) is not compatible with motherboard socket (${motherboard.socket})`,
          severity: 'error'
        });
      }
    }

    // Motherboard and RAM type compatibility
    if (motherboard && ram) {
      if (motherboard.ramType && ram.ramType && motherboard.ramType !== ram.ramType) {
        issues.push({
          component1Key: 'motherboard',
          component2Key: 'ram',
          message: `Motherboard supports ${motherboard.ramType} but selected RAM is ${ram.ramType}`,
          severity: 'error'
        });
      }
    }

    // Case and Motherboard form factor compatibility
    if (pcCase && motherboard) {
      if (pcCase.formFactor && motherboard.formFactor) {
        // Simplified check - in reality, cases support multiple form factors
        const caseSupportsMotherboard = pcCase.formFactor === 'ATX' && 
          ['ATX', 'mATX', 'Mini-ITX'].includes(motherboard.formFactor);
        
        if (!caseSupportsMotherboard && pcCase.formFactor !== motherboard.formFactor) {
          issues.push({
            component1Key: 'case',
            component2Key: 'motherboard',
            message: `Case form factor (${pcCase.formFactor}) may not support motherboard form factor (${motherboard.formFactor})`,
            severity: 'warning'
          });
        }
      }
    }

    // GPU length compatibility with case
    if (gpu && pcCase) {
      if (gpu.gpuLength && pcCase.caseMaxGpuLength) {
        if (gpu.gpuLength > pcCase.caseMaxGpuLength) {
          issues.push({
            component1Key: 'gpu',
            component2Key: 'case',
            message: `GPU length (${gpu.gpuLength}mm) exceeds case maximum GPU length (${pcCase.caseMaxGpuLength}mm)`,
            severity: 'error'
          });
        }
      }
    }

    // CPU cooler height compatibility with case
    if (cooler && pcCase) {
      if (cooler.coolerHeight && pcCase.caseMaxCoolerHeight) {
        if (cooler.coolerHeight > pcCase.caseMaxCoolerHeight) {
          issues.push({
            component1Key: 'cooler',
            component2Key: 'case',
            message: `CPU cooler height (${cooler.coolerHeight}mm) exceeds case maximum cooler height (${pcCase.caseMaxCoolerHeight}mm)`,
            severity: 'error'
          });
        }
      }
    }

    // Power supply wattage check
    if (psu) {
      const totalWattage = Object.values(currentBuild).reduce((sum, component) => {
        return sum + (component?.estimatedWattage || 0);
      }, 0);

      if (psu.wattage && totalWattage > 0) {
        const recommendedWattage = totalWattage * 1.2; // 20% headroom
        
        if (psu.wattage < totalWattage) {
          issues.push({
            component1Key: 'psu',
            component2Key: 'system',
            message: `PSU wattage (${psu.wattage}W) is insufficient for system requirements (${totalWattage}W)`,
            severity: 'error'
          });
        } else if (psu.wattage < recommendedWattage) {
          issues.push({
            component1Key: 'psu',
            component2Key: 'system',
            message: `PSU wattage (${psu.wattage}W) is below recommended (${Math.ceil(recommendedWattage)}W) for optimal efficiency`,
            severity: 'warning'
          });
        }
      }
    }

    // Missing essential components check
    if (Object.keys(currentBuild).length > 0) {
      const essentialComponents = ['cpu', 'motherboard', 'ram', 'storage', 'psu'];
      const missingComponents = essentialComponents.filter(comp => !currentBuild[comp]);
      
      if (missingComponents.length > 0) {
        issues.push({
          component1Key: 'system',
          component2Key: 'system',
          message: `Missing essential components: ${missingComponents.join(', ')}`,
          severity: 'warning'
        });
      }
    }

    return issues;
  };
  // Load products when tab changes
  useEffect(() => {
    searchProducts(activeTab).then(setItems);
  }, [activeTab]);

  // Check compatibility when build changes
  useEffect(() => {
    checkCompatibility(build).then(setCompatibilityIssues);
  }, [build]);

  // Handle component selection
  const handleAddToBuild = (item: Product) => {
    setBuild(prev => ({ ...prev, [activeTab]: item }));
    setShowPartInfo(false);
  };

  // Handle part card click
  const handlePartClick = (item: Product) => {
    setSelectedPart(item);
    setShowPartInfo(true);
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

  // Show PartInfoPage if a part is selected
  if (showPartInfo && selectedPart) {
    return (
      <PartInfoPage
        part={selectedPart}
        onAddToBuild={handleAddToBuild}
        onBack={() => setShowPartInfo(false)}
        isSelected={build[activeTab]?.asin === selectedPart.asin}
      />
    );
  }

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
        <div className="flex gap-8">
          {/* Component Tabs - Vertical Left Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-2">
              {componentCategories.map(category => {
                const isSelected = build[category.key];
                return (
                  <button
                    key={category.key}
                    onClick={() => setActiveTab(category.key)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 text-left ${
                      activeTab === category.key
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    } ${isSelected ? 'ring-2 ring-green-400/50' : ''}`}
                  >
                    <category.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{category.name}</span>
                    {isSelected && (
                      <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
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

            {/* Compatibility Issues */}
            {compatibilityIssues.length > 0 && (
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <span>Compatibility Check</span>
                </h3>
                <div className="space-y-3">
                  {compatibilityIssues.map((issue, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-4 rounded-lg border ${
                        issue.severity === 'error'
                          ? 'bg-red-500/10 border-red-500/20 text-red-300'
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300'
                      }`}
                    >
                      <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        issue.severity === 'error' ? 'text-red-400' : 'text-yellow-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            issue.severity === 'error'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {issue.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {issue.component1Key} ↔ {issue.component2Key}
                          </span>
                        </div>
                        <p className="text-sm">{issue.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Compatibility Summary */}
                <div className="mt-4 pt-4 border-t border-gray-600/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {compatibilityIssues.filter(i => i.severity === 'error').length} errors, {' '}
                      {compatibilityIssues.filter(i => i.severity === 'warning').length} warnings
                    </span>
                    <span className={`font-medium ${
                      compatibilityIssues.some(i => i.severity === 'error')
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                      {compatibilityIssues.some(i => i.severity === 'error')
                        ? 'Build has compatibility issues'
                        : 'Build has minor warnings'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Compatibility Status - Show when no issues */}
            {Object.keys(build).length > 0 && compatibilityIssues.length === 0 && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-1">
                      All Components Compatible
                    </h3>
                    <p className="text-green-400/80 text-sm">
                      Your selected components are compatible with each other. Great job!
                    </p>
                  </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {items.map(item => (
                  <div
                    key={item.asin}
                    onClick={() => handlePartClick(item)}
                    className={`bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden cursor-pointer transition-all duration-300 hover:border-red-500/50 hover:scale-105 group aspect-square ${
                      build[activeTab]?.asin === item.asin ? 'ring-2 ring-red-500 border-red-500' : ''
                    }`}
                  >
                    {/* Product Image */}
                    <div className="h-3/4 overflow-hidden bg-gray-700/30">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="h-1/4 p-2 flex items-center">
                      <h3 className="font-medium text-white text-xs line-clamp-2 group-hover:text-red-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    
                    {/* Selected Indicator */}
                    {build[activeTab]?.asin === item.asin && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-400 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && items.length === 0 && (
              <div className="text-center py-16">
                <div className="flex items-center justify-center w-24 h-24 bg-gray-800/50 rounded-full mb-6 mx-auto">
                  <div className="h-12 w-12 text-gray-400">📦</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Products Available</h3>
                <p className="text-gray-400 mb-6">
                  {apiError ? 'API is not available. Using mock data.' : 'No products found for this category.'}
                </p>
              </div>
            )}
          </div>
        </div>
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