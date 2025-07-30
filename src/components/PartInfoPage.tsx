import React from 'react';
import { ArrowLeft, Plus } from 'lucide-react';

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
  socket?: string;
  ramType?: string;
  pcieVersion?: string;
  estimatedWattage?: number;
  wattage?: number;
  formFactor?: string;
  ramSlots?: number;
  maxRamCapacity?: number;
  chipset?: string;
  coolerHeight?: number;
  gpuLength?: number;
  caseMaxGpuLength?: number;
  caseMaxCoolerHeight?: number;
}

interface PartInfoPageProps {
  part: Product;
  onAddToBuild: (part: Product) => void;
  onBack: () => void;
  isSelected: boolean;
}

export default function PartInfoPage({ part, onAddToBuild, onBack, isSelected }: PartInfoPageProps) {
  const getSpecs = () => {
    const specs: { label: string; value: string }[] = [];
    
    if (part.socket) specs.push({ label: 'Socket', value: part.socket });
    if (part.ramType) specs.push({ label: 'Memory Type', value: part.ramType });
    if (part.pcieVersion) specs.push({ label: 'PCIe Version', value: part.pcieVersion });
    if (part.estimatedWattage) specs.push({ label: 'Power Consumption', value: `${part.estimatedWattage}W` });
    if (part.wattage) specs.push({ label: 'Power Output', value: `${part.wattage}W` });
    if (part.formFactor) specs.push({ label: 'Form Factor', value: part.formFactor });
    if (part.ramSlots) specs.push({ label: 'RAM Slots', value: part.ramSlots.toString() });
    if (part.maxRamCapacity) specs.push({ label: 'Max RAM', value: `${part.maxRamCapacity}GB` });
    if (part.chipset) specs.push({ label: 'Chipset', value: part.chipset });
    if (part.coolerHeight) specs.push({ label: 'Height', value: `${part.coolerHeight}mm` });
    if (part.gpuLength) specs.push({ label: 'Length', value: `${part.gpuLength}mm` });
    if (part.caseMaxGpuLength) specs.push({ label: 'Max GPU Length', value: `${part.caseMaxGpuLength}mm` });
    if (part.caseMaxCoolerHeight) specs.push({ label: 'Max Cooler Height', value: `${part.caseMaxCoolerHeight}mm` });
    
    return specs;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-red-900/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
              Part Details
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-700/30 rounded-lg overflow-hidden">
              <img
                src={part.image}
                alt={part.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {part.title}
                </h2>
                {isSelected && (
                  <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400 text-sm font-medium">Currently Selected</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <p className="text-3xl font-bold text-green-400">
                  ${part.price?.value?.toFixed(2) || 'N/A'}
                </p>
              </div>

              {/* Rating */}
              <div>
                <p className="text-gray-400 text-sm">No ratings yet</p>
              </div>

              {/* Specifications */}
              {getSpecs().length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                  <div className="space-y-3">
                    {getSpecs().map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400">{spec.label}</span>
                        <span className="text-white font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-700/50 p-6">
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => onAddToBuild(part)}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>{isSelected ? 'Replace in Build' : 'Add to Build'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}