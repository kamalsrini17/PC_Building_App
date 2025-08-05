import React from 'react';
import { useState } from 'react';
import { Monitor, MessageCircle, Cpu, Zap, Shield, Trophy, LogOut, User, Package, ShoppingCart } from 'lucide-react';
import BuildPage from './components/BuildPage';
import AuthModal from './components/AuthModal';
import MyBuildsPage from './pages/MyBuildsPage';
import CartPage from './pages/CartPage';
import { useAuth } from './hooks/useAuth';

interface CartItem {
  id: string;
  name: string;
  description: string | null;
  components: any;
  total_price: number;
  created_at: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'build' | 'myBuilds' | 'cart'>('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user, loading, signOut, isAuthenticated } = useAuth();

  const handleStartBuild = () => {
    if (isAuthenticated) {
      setCurrentPage('build');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setCurrentPage('build');
  };

  const handleAddToCart = (build: CartItem) => {
    // Check if build is already in cart
    if (cartItems.find(item => item.id === build.id)) {
      alert('This build is already in your cart!');
      return;
    }
    
    setCartItems(prev => [...prev, build]);
    alert('Build added to cart!');
  };

  const handleRemoveFromCart = (buildId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== buildId));
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'build') {
    return <BuildPage onBackToHome={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'myBuilds') {
    return (
      <MyBuildsPage 
        onBackToHome={() => setCurrentPage('home')}
        onAddToCart={handleAddToCart}
      />
    );
  }

  if (currentPage === 'cart') {
    return (
      <CartPage 
        onBackToHome={() => setCurrentPage('home')}
        cartItems={cartItems}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900/20 text-white overflow-hidden">
      {/* Phone Home Screen Layout */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-red-400/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/3 rounded-full blur-xl animate-bounce"></div>
        </div>

        <div className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Center Split Triangle Button */}
          <div className="flex justify-center mb-12">
            <div className="relative w-64 h-64">
              {/* Classic Configurator - Left Triangle */}
              <div 
                onClick={handleStartBuild}
                className="group absolute inset-0 cursor-pointer"
                style={{
                  clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-2xl group-hover:shadow-red-500/30">
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-center transform -translate-x-6">
                    <Cpu className="h-8 w-8 text-white mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-sm font-bold text-white mb-1">Classic</h3>
                    <h3 className="text-sm font-bold text-white">Configurator</h3>
                  </div>
                </div>
              </div>

              {/* PC AI - Right Triangle */}
              <div 
                className="group absolute inset-0 cursor-pointer"
                style={{
                  clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
                }}
              >
                <div className="w-full h-full bg-gradient-to-bl from-gray-700 to-gray-900 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1 group-hover:shadow-2xl group-hover:shadow-gray-500/30">
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 text-center transform translate-x-6">
                    <MessageCircle className="h-8 w-8 text-white mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-sm font-bold text-white mb-1">PC AI</h3>
                    <h3 className="text-sm font-bold text-white">Assistant</h3>
                  </div>
                </div>
              </div>

              {/* Center Divider Line */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/30 transform -translate-x-px"></div>
            </div>
          </div>

          {/* App Icons Grid - Surrounding the center button */}
          <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {/* My Builds App */}
            <div 
              onClick={() => setCurrentPage('myBuilds')}
              className="group relative bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Package className="h-6 w-6 text-red-400 mx-auto mb-1 group-hover:text-red-300 transition-colors" />
                <span className="text-white text-xs font-medium group-hover:text-red-100 transition-colors">My Builds</span>
              </div>
            </div>

            {/* Prebuilts App */}
            <div className="group relative bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Monitor className="h-6 w-6 text-blue-400 mx-auto mb-1 group-hover:text-blue-300 transition-colors" />
                <span className="text-white text-xs font-medium group-hover:text-blue-100 transition-colors">Prebuilts</span>
              </div>
            </div>

            {/* Guides App */}
            <div className="group relative bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Shield className="h-6 w-6 text-green-400 mx-auto mb-1 group-hover:text-green-300 transition-colors" />
                <span className="text-white text-xs font-medium group-hover:text-green-100 transition-colors">Guides</span>
              </div>
            </div>

            {/* Cart App */}
            {isAuthenticated && (
              <div 
                onClick={() => setCurrentPage('cart')}
                className="group relative bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6 text-purple-400 mx-auto mb-1 group-hover:text-purple-300 transition-colors" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                  <span className="text-white text-xs font-medium group-hover:text-purple-100 transition-colors">Cart</span>
                </div>
              </div>
            )}

            {/* College PCs App */}
            <div className="group relative bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-1 group-hover:text-yellow-300 transition-colors" />
                <span className="text-white text-xs font-medium group-hover:text-yellow-100 transition-colors">College PCs</span>
              </div>
            </div>

            {/* Auth App - Sign In/Sign Out */}
            {isAuthenticated ? (
              <div 
                onClick={signOut}
                className="group relative bg-gradient-to-br from-gray-600/20 to-gray-800/20 backdrop-blur-sm border border-gray-500/30 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-gray-400/50 hover:shadow-lg hover:shadow-gray-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <LogOut className="h-6 w-6 text-gray-400 mx-auto mb-1 group-hover:text-gray-300 transition-colors" />
                  <span className="text-white text-xs font-medium group-hover:text-gray-100 transition-colors">Sign Out</span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setShowAuthModal(true)}
                className="group relative bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-3 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <User className="h-6 w-6 text-indigo-400 mx-auto mb-1 group-hover:text-indigo-300 transition-colors" />
                  <span className="text-white text-xs font-medium group-hover:text-indigo-100 transition-colors">Sign In</span>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="text-center mt-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
              PC Builder Pro
            </h2>
            <p className="text-sm text-gray-300 max-w-md mx-auto">
              Your ultimate destination for building the perfect PC
            </p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;