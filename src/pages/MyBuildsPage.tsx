import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, ShoppingCart, Calendar, DollarSign, Cpu, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface SavedBuild {
  id: string;
  name: string;
  description: string | null;
  components: any;
  total_price: number;
  created_at: string;
}

interface MyBuildsPageProps {
  onBackToHome: () => void;
  onAddToCart: (build: SavedBuild) => void;
}

export default function MyBuildsPage({ onBackToHome, onAddToCart }: MyBuildsPageProps) {
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchBuilds();
  }, [user]);

  const fetchBuilds = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('builds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuilds(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBuild = async (buildId: string) => {
    if (!confirm('Are you sure you want to delete this build?')) return;

    try {
      const { error } = await supabase
        .from('builds')
        .delete()
        .eq('id', buildId);

      if (error) throw error;
      setBuilds(builds.filter(build => build.id !== buildId));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getComponentCount = (components: any) => {
    return Object.values(components).filter(component => component !== null).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your builds...</p>
        </div>
      </div>
    );
  }

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
                My Builds
              </h1>
            </div>
            <div className="text-sm text-gray-300">
              <span className="text-red-400 font-semibold">{builds.length}</span> saved builds
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {builds.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-24 h-24 bg-gray-800/50 rounded-full mb-6 mx-auto">
              <Cpu className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">No Builds Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              You haven't saved any PC builds yet. Start building your dream PC and save your configurations for later.
            </p>
            <button
              onClick={onBackToHome}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Build</span>
            </button>
          </div>
        ) : (
          /* Builds Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((build) => (
              <div
                key={build.id}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-red-500/30 transition-all duration-300 group"
              >
                {/* Build Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors">
                      {build.name}
                    </h3>
                    <button
                      onClick={() => deleteBuild(build.id)}
                      className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {build.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {build.description}
                    </p>
                  )}

                  {/* Build Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Cpu className="h-4 w-4" />
                        <span>Components</span>
                      </div>
                      <span className="text-white font-medium">
                        {getComponentCount(build.components)}/10
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <DollarSign className="h-4 w-4" />
                        <span>Total Price</span>
                      </div>
                      <span className="text-green-400 font-bold">
                        ${build.total_price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Created</span>
                      </div>
                      <span className="text-gray-300">
                        {formatDate(build.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Build Actions */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => onAddToCart(build)}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}