import React, { useState, useEffect } from 'react';
import {
  Cpu, HardDrive, Zap, Fan, Monitor, Usb, ArrowLeft, Save
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SaveBuildModal from './SaveBuildModal';
import { fetchAmazonProducts } from '../lib/rapidapi';

const componentCategories = [
  { key: 'cpu', name: 'CPU', icon: Cpu },
  { key: 'gpu', name: 'GPU', icon: Monitor },
  { key: 'motherboard', name: 'Motherboard', icon: HardDrive },
  { key: 'memory', name: 'Memory', icon: Usb },
  { key: 'storage', name: 'Storage', icon: HardDrive },
  { key: 'psu', name: 'Power Supply', icon: Zap },
  { key: 'cpuCooler', name: 'CPU Cooler', icon: Fan },
];

export default function BuildPage() {
  const [activeTab, setActiveTab] = useState('cpu');
  const [items, setItems] = useState<any[]>([]);
  const [build, setBuild] = useState<Record<string, any>>({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await fetchAmazonProducts(activeTab);
        setItems(products);
      } catch (error) {
        console.error('Failed to load products:', error);
        setItems([]);
      }
    };

    loadProducts();
  }, [activeTab]);

  const handleSelect = (component: any) => {
    setBuild(prev => ({ ...prev, [activeTab]: component }));
  };

  const handleSaveBuild = async (buildName: string) => {
    if (!user) return;
    const buildData = {
      name: buildName,
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            className="flex items-center text-gray-400 hover:text-red-400 transition"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </button>
          <h1 className="ml-6 text-2xl font-bold">Build Your PC</h1>
        </div>
        <button
          className="flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          onClick={() => setShowSaveModal(true)}
        >
          <Save className="h-5 w-5 mr-2" />
          Save Build
        </button>
      </div>

      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        {componentCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded ${
              activeTab === cat.key ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.asin}
            onClick={() => handleSelect(item)}
            className={`bg-gray-800 rounded-lg p-4 cursor-pointer shadow hover:shadow-lg transition-all ${
              build[activeTab]?.asin === item.asin ? 'ring-2 ring-red-500' : ''
            }`}
          >
            <img
              src={item.product_photo}
              alt={item.product_title}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h3 className="text-white text-sm font-semibold">{item.product_title}</h3>
            <p className="text-green-400 font-bold">{item.product_price}</p>
            <p className="text-gray-400 text-xs mt-1">
              {item.product_information?.["Product Dimensions"] || "Specs loading..."}
            </p>
          </div>
        ))}
      </div>

      <SaveBuildModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBuild}
        success={saveSuccess}
      />
    </div>
  );
}
