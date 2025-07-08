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

// ─────────── Rainforest API ───────────
const RF_API_URL = 'https://api.rainforestapi.com/request';
const RF_API_KEY = '1D099C83FD6D43B4AF1FCE622F015C71';

// ─── Amazon browse_node IDs per category ───
const browseNodes: Record<string, string> = {
  cpu: '2335752011',
  gpu: '284822',
  motherboard: '194322',
  ram: '17923671011',
  pcstorage: '17923671011',
  psu: '2231242011',
  cpucooler: '17923683011',
  casefans: '17923689011',
  pccase: '572238',
  pcaccessories: '17923656011'
};

// ─── Tabs ───
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
  { key: 'pcaccessories', name: 'PC Accessories', icon: Usb }
];

export default function BuildPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('cpu');
  const [items, setItems] = useState<any[]>([]);
  const [build, setBuild] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // 1) Populate grid via type=search + browse_node
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const term = encodeURIComponent(activeTab);
        const nodeId = browseNodes[activeTab];
        const params = new URLSearchParams({
          api_key: RF_API_KEY,
          type: 'search',
          amazon_domain: 'amazon.com',
          search_term: term,
          page: currentPage.toString()
        });
        if (nodeId) params.set('browse_node', nodeId);

        const url = `${RF_API_URL}?${params.toString()}`;
        const res = await fetch(url);
        const json = await res.json();
        console.log('Search response:', json);

        setItems(json.search_results || []);
        const total = json.pagination?.total_pages || 1;
        setTotalPages(Math.min(total, 10));
      } catch (err) {
        console.error(err);
        setError('Failed to load products.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [activeTab, currentPage]);

  // 2) On select, fetch full product specs via type=product
  const handleSelect = async (item: any) => {
    // store shallow
    setBuild(prev => ({ ...prev, [activeTab]: item }));
    try {
      const url = `${RF_API_URL}`
        + `?api_key=${RF_API_KEY}`
        + `&type=product`
        + `&amazon_domain=amazon.com`
        + `&asin=${item.asin}`;
      const res = await fetch(url);
      const detailJson = await res.json();
      console.log('Product detail:', detailJson);

      setBuild(prev => ({
        ...prev,
        [activeTab]: {
          ...item,
          details: detailJson.product || detailJson
        }
      }));
    } catch (err) {
      console.error('Detail fetch error:', err);
    }
  };

  // 3) Save build to Supabase
  const handleSaveBuild = async (name: string) => {
    if (!user) return;
    const totalPrice = Object.values(build).reduce((sum, part: any) => {
      const raw = part.buybox_price?.raw || part.price?.raw || '$0';
      const num = parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
      return sum + num;
    }, 0);

    const { error: saveErr } = await supabase
      .from('builds')
      .insert([{ name, user_id: user.id, components: build, total_price: totalPrice }]);

    if (!saveErr) setSaveSuccess(true);
    else console.error(saveErr);
    setShowSaveModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center text-gray-400 hover:text-red-400"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="ml-6 text-2xl font-bold">Build Your PC</h1>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          className="flex items-center bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          <Save className="h-5 w-5 mr-2" /> Save Build
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        {componentCategories.map(cat => (
          <button
            key={cat.key}
            onClick={() => { setActiveTab(cat.key); setCurrentPage(1); }}
            className={`flex items-center px-4 py-2 rounded ${
              activeTab === cat.key
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            <cat.icon className="h-4 w-4 mr-1" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Error & Loading */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.asin}
              onClick={() => handleSelect(item)}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer shadow hover:shadow-lg transition ${
                build[activeTab]?.asin === item.asin ? 'ring-2 ring-red-500' : ''
              }`}
            >
              <div className="aspect-square overflow-hidden mb-2">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-white font-semibold mb-1 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-green-400 font-bold mb-1">
                {item.buybox_price?.raw || item.price?.raw || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Save Build Modal */}
      <SaveBuildModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveBuild}
        success={saveSuccess}
      />

      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded">
          Build saved successfully!
        </div>
      )}
    </div>
  );
}
