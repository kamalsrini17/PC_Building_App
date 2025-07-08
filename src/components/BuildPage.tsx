import { useEffect, useState } from "react";

import { 
  Cpu, 
  HardDrive, 
  Zap, 
  Fan, 
  Monitor, 
  Usb, 
  CheckCircle, 
  AlertTriangle,
  ShoppingCart,
  Calculator,
  ArrowLeft,
  Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import SaveBuildModal from './SaveBuildModal';

interface Component {
  id: string;
  name: string;
  brand: string;
  price: number;
  image?: string;
  specs: Record<string, string>;
  rating: number;
  reviews: number;
}

interface BuildState {
  motherboard: Component | null;
  cpu: Component | null;
  memory: Component | null;
  cpuCooler: Component | null;
  storage: Component | null;
  case: Component | null;
  caseFans: Component | null;
  gpu: Component | null;
  psu: Component | null;
  accessories: Component | null;
}

const componentCategories = [
  { key: 'motherboard', name: 'Motherboard', icon: Cpu, color: 'red' },
  { key: 'cpu', name: 'CPU', icon: Cpu, color: 'orange' },
  { key: 'memory', name: 'Memory', icon: HardDrive, color: 'blue' },
  { key: 'cpuCooler', name: 'CPU Cooler', icon: Fan, color: 'cyan' },
  { key: 'storage', name: 'Storage', icon: HardDrive, color: 'green' },
  { key: 'case', name: 'Case', icon: Monitor, color: 'gray' },
  { key: 'caseFans', name: 'Case Fans', icon: Fan, color: 'teal' },
  { key: 'gpu', name: 'Graphics Card', icon: Monitor, color: 'purple' },
  { key: 'psu', name: 'Power Supply', icon: Zap, color: 'yellow' },
  { key: 'accessories', name: 'Accessories', icon: Usb, color: 'indigo' }
];

const sampleComponents: Record<string, Component[]> = {
  motherboard: [
    { 
      id: 'mb1', 
      name: 'ASUS ROG Strix B550-F Gaming', 
      brand: 'ASUS', 
      price: 189.99, 
      rating: 4.5,
      reviews: 1247,
      specs: { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memorySlots: '4', maxMemory: '128GB' } 
    },
    { 
      id: 'mb2', 
      name: 'MSI MAG B550 Tomahawk', 
      brand: 'MSI', 
      price: 179.99, 
      rating: 4.3,
      reviews: 892,
      specs: { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memorySlots: '4', maxMemory: '128GB' } 
    },
    { 
      id: 'mb3', 
      name: 'Gigabyte B550 AORUS Elite', 
      brand: 'Gigabyte', 
      price: 159.99, 
      rating: 4.2,
      reviews: 634,
      specs: { socket: 'AM4', chipset: 'B550', formFactor: 'ATX', memorySlots: '4', maxMemory: '128GB' } 
    }
  ],
  cpu: [
    { 
      id: 'cpu1', 
      name: 'AMD Ryzen 5 5600X', 
      brand: 'AMD', 
      price: 199.99, 
      rating: 4.7,
      reviews: 2156,
      specs: { socket: 'AM4', cores: '6', threads: '12', baseClock: '3.7GHz', boostClock: '4.6GHz', tdp: '65W' } 
    },
    { 
      id: 'cpu2', 
      name: 'Intel Core i5-12600K', 
      brand: 'Intel', 
      price: 279.99, 
      rating: 4.6,
      reviews: 1834,
      specs: { socket: 'LGA1700', cores: '10', threads: '16', baseClock: '3.7GHz', boostClock: '4.9GHz', tdp: '125W' } 
    },
    { 
      id: 'cpu3', 
      name: 'AMD Ryzen 7 5800X', 
      brand: 'AMD', 
      price: 329.99, 
      rating: 4.5,
      reviews: 1456,
      specs: { socket: 'AM4', cores: '8', threads: '16', baseClock: '3.8GHz', boostClock: '4.7GHz', tdp: '105W' } 
    }
  ],
  memory: [
    { 
      id: 'ram1', 
      name: 'Corsair Vengeance LPX 16GB DDR4-3200', 
      brand: 'Corsair', 
      price: 79.99, 
      rating: 4.4,
      reviews: 3421,
      specs: { type: 'DDR4', speed: '3200MHz', capacity: '16GB', modules: '2x8GB', latency: 'CL16' } 
    },
    { 
      id: 'ram2', 
      name: 'G.Skill Trident Z RGB 32GB DDR4-3600', 
      brand: 'G.Skill', 
      price: 159.99, 
      rating: 4.6,
      reviews: 1876,
      specs: { type: 'DDR4', speed: '3600MHz', capacity: '32GB', modules: '2x16GB', latency: 'CL18' } 
    }
  ],
  gpu: [
    { 
      id: 'gpu1', 
      name: 'NVIDIA RTX 4070 Super', 
      brand: 'NVIDIA', 
      price: 599.99, 
      rating: 4.8,
      reviews: 2341,
      specs: { memory: '12GB GDDR6X', baseClock: '1980MHz', boostClock: '2475MHz', powerConsumption: '220W' } 
    },
    { 
      id: 'gpu2', 
      name: 'AMD Radeon RX 7800 XT', 
      brand: 'AMD', 
      price: 549.99, 
      rating: 4.5,
      reviews: 1567,
      specs: { memory: '16GB GDDR6', baseClock: '1295MHz', boostClock: '2430MHz', powerConsumption: '263W' } 
    }
  ]
};

interface BuildPageProps {
  onBackToHome: () => void;
}

export default function BuildPage({ onBackToHome }: BuildPageProps) {
  const { user } = useAuth();
  const [build, setBuild] = useState<BuildState>({
    motherboard: null,
    cpu: null,
    memory: null,
    cpuCooler: null,
    storage: null,
    case: null,
    caseFans: null,
    gpu: null,
    psu: null,
    accessories: null
  });

  const [activeTab, setActiveTab] = useState('motherboard');
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const checkCompatibility = () => {
    const issues: string[] = [];
    
    // Check CPU and Motherboard socket compatibility
    if (build.cpu && build.motherboard) {
      if (build.cpu.specs.socket !== build.motherboard.specs.socket) {
        issues.push(`CPU socket (${build.cpu.specs.socket}) doesn't match motherboard socket (${build.motherboard.specs.socket})`);
      }
    }

    // Check memory type compatibility
    if (build.memory && build.motherboard) {
      if (build.memory.specs.type === 'DDR5' && build.motherboard.specs.chipset === 'B550') {
        issues.push('DDR5 memory is not compatible with B550 chipset motherboards');
      }
    }

    setCompatibilityIssues(issues);
  };

  React.useEffect(() => {
    checkCompatibility();
  }, [build]);

  const selectComponent = (component: Component) => {
    setBuild(prev => ({ ...prev, [activeTab]: component }));
  };

  const removeComponent = () => {
    setBuild(prev => ({ ...prev, [activeTab]: null }));
  };

  const getTotalPrice = () => {
    return Object.values(build).reduce((total, component) => {
      return total + (component?.price || 0);
    }, 0);
  };

  const getSelectedCount = () => {
    return Object.values(build).filter(component => component !== null).length;
  };

  const isAllComponentsSelected = () => {
    return getSelectedCount() === 10;
  };

  const canSaveBuild = () => {
    return getSelectedCount() > 0 && compatibilityIssues.length === 0;
  };

  const handleSaveBuild = async (name: string, description: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('builds')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        components: build,
        total_price: getTotalPrice()
      });

    if (error) throw error;
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentCategory = componentCategories.find(cat => cat.key === activeTab);
  const currentComponent = build[activeTab as keyof BuildState];
  const availableComponents = sampleComponents[activeTab] || [];

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
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-300">
                <span className="text-red-400 font-semibold">{getSelectedCount()}</span> / 10 components
              </div>
              <div className="text-lg font-bold text-white">
                ${getTotalPrice().toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Component Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-700/50">
                <h2 className="text-lg font-semibold text-white">Components</h2>
              </div>
              <div className="space-y-1 p-2">
                {componentCategories.map((category) => {
                  const IconComponent = category.icon;
                  const isActive = activeTab === category.key;
                  const hasComponent = build[category.key as keyof BuildState] !== null;
                  
                  return (
                    <button
                      key={category.key}
                      onClick={() => setActiveTab(category.key)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-red-600 text-white shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm font-medium flex-1 text-left">{category.name}</span>
                      {hasComponent && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              {/* Category Header */}
              <div className="flex items-center space-x-3 mb-6">
                {currentCategory && (
                  <>
                    <div className={`p-3 rounded-lg bg-gradient-to-r from-${currentCategory.color}-500 to-${currentCategory.color}-600`}>
                      <currentCategory.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentCategory.name}</h2>
                      <p className="text-gray-400">Choose the perfect {currentCategory.name.toLowerCase()} for your build</p>
                    </div>
                  </>
                )}
              </div>

              {/* Current Selection */}
              {currentComponent && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-green-400 font-medium">Selected</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{currentComponent.name}</h3>
                      <p className="text-gray-400 mb-3">{currentComponent.brand}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(currentComponent.specs).map(([key, value]) => (
                          <span key={key} className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-300">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-green-400 mb-2">${currentComponent.price}</p>
                      <button
                        onClick={removeComponent}
                        className="text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Components */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  {currentComponent ? 'Other Options' : 'Available Components'}
                </h3>
                
                {availableComponents.length > 0 ? (
                  <div className="grid gap-4">
                    {availableComponents.map((component) => (
                      <div
                        key={component.id}
                        onClick={() => selectComponent(component)}
                        className={`bg-gray-700/30 rounded-lg p-4 border cursor-pointer transition-all duration-300 hover:bg-gray-700/50 ${
                          currentComponent?.id === component.id 
                            ? 'border-green-500/50 bg-green-500/5' 
                            : 'border-gray-600/50 hover:border-red-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{component.name}</h4>
                            <p className="text-sm text-gray-400 mb-2">{component.brand}</p>
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={`text-xs ${i < Math.floor(component.rating) ? 'text-yellow-400' : 'text-gray-600'}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-xs text-gray-400">
                                {component.rating} ({component.reviews} reviews)
                              </span>
                            </div>

                            {/* Specs */}
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(component.specs).slice(0, 4).map(([key, value]) => (
                                <span key={key} className="text-xs bg-gray-600/50 px-2 py-1 rounded text-gray-300">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-green-400">${component.price}</p>
                            {currentComponent?.id === component.id && (
                              <span className="text-xs text-green-400 mt-1 block">Selected</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No components available for this category yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Compatibility Check */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                {compatibilityIssues.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                )}
                Compatibility
              </h3>
              
              {compatibilityIssues.length === 0 ? (
                <p className="text-green-400 text-sm">All components are compatible!</p>
              ) : (
                <div className="space-y-2">
                  {compatibilityIssues.map((issue, index) => (
                    <div key={index} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-yellow-400 text-sm">{issue}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Build Summary */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="h-5 w-5 text-red-400 mr-2" />
                Build Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Components</span>
                  <span className="text-white">{getSelectedCount()} / 10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Est. Wattage</span>
                  <span className="text-white">450W</span>
                </div>
                <div className="border-t border-gray-600 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total Price</span>
                    <span className="font-bold text-xl text-red-400">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>

              {/* Save Build Button */}
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!canSaveBuild()}
                className="w-full mt-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Build</span>
              </button>

              {/* Save Success Message */}
              {saveSuccess && (
                <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <p className="text-green-400 text-sm">Build saved successfully!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Build Modal */}
      <SaveBuildModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBuild}
      />
    </div>
  );
}
