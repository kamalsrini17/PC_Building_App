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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Monitor className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
                PC Builder Pro
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setCurrentPage('myBuilds')}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                My Builds
              </button>
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">Components</a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">Guides</a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition-colors">Support</a>
            </nav>
            
            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              {isAuthenticated && (
                <button
                  onClick={() => setCurrentPage('cart')}
                  className="relative text-gray-300 hover:text-red-400 transition-colors"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              )}
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-red-900/20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/5 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-red-400/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-white/3 rounded-full blur-xl animate-bounce"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* App Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {/* My Builds App */}
            <div 
              onClick={() => setCurrentPage('myBuilds')}
              className="group relative bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-sm border border-red-500/30 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Package className="h-8 w-8 text-red-400 mx-auto mb-2 group-hover:text-red-300 transition-colors" />
                <span className="text-white text-sm font-medium group-hover:text-red-100 transition-colors">My Builds</span>
              </div>
            </div>

            {/* Prebuilts App */}
            <div className="group relative bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Monitor className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:text-blue-300 transition-colors" />
                <span className="text-white text-sm font-medium group-hover:text-blue-100 transition-colors">Prebuilts</span>
              </div>
            </div>

            {/* Guides App */}
            <div className="group relative bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm border border-green-500/30 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Shield className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:text-green-300 transition-colors" />
                <span className="text-white text-sm font-medium group-hover:text-green-100 transition-colors">Guides</span>
              </div>
            </div>

            {/* Cart App */}
            {isAuthenticated && (
              <div 
                onClick={() => setCurrentPage('cart')}
                className="group relative bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <div className="relative">
                    <ShoppingCart className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:text-purple-300 transition-colors" />
                    {cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </div>
                  <span className="text-white text-sm font-medium group-hover:text-purple-100 transition-colors">Cart</span>
                </div>
              </div>
            )}

            {/* College PCs App */}
            <div className="group relative bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/30 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 text-center">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2 group-hover:text-yellow-300 transition-colors" />
                <span className="text-white text-sm font-medium group-hover:text-yellow-100 transition-colors">College PCs</span>
              </div>
            </div>

            {/* Sign In/Sign Up App */}
            {!isAuthenticated && (
              <div 
                onClick={() => setShowAuthModal(true)}
                className="group relative bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 backdrop-blur-sm border border-indigo-500/30 rounded-3xl p-6 aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 text-center">
                  <User className="h-8 w-8 text-indigo-400 mx-auto mb-2 group-hover:text-indigo-300 transition-colors" />
                  <span className="text-white text-sm font-medium group-hover:text-indigo-100 transition-colors">Sign In</span>
                </div>
              </div>
            )}
          </div>

          {/* Center Split Triangle Button */}
          <div className="flex justify-center mb-16">
            <div className="relative w-80 h-80">
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
                  <div className="relative z-10 text-center transform -translate-x-8">
                    <Cpu className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-bold text-white mb-2">Classic</h3>
                    <h3 className="text-xl font-bold text-white">Configurator</h3>
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
                  <div className="relative z-10 text-center transform translate-x-8">
                    <MessageCircle className="h-12 w-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-bold text-white mb-2">PC AI</h3>
                    <h3 className="text-xl font-bold text-white">Assistant</h3>
                  </div>
                </div>
              </div>

              {/* Center Divider Line */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-white/30 transform -translate-x-px"></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
              PC Builder Pro
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Your ultimate destination for building the perfect PC
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Why Choose PC Builder Pro?
            </h3>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We make PC building accessible, reliable, and enjoyable for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-4 mx-auto">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Compatibility Guaranteed</h4>
              <p className="text-gray-400">
                Our system checks all components for compatibility issues before you buy.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-4 mx-auto">
                <Zap className="h-6 w-6 text-red-400" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Performance Optimized</h4>
              <p className="text-gray-400">
                Get the best performance for your budget with our optimization algorithms.
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gray-800/30 backdrop-blur-sm hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mb-4 mx-auto">
                <Trophy className="h-6 w-6 text-red-400" />
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Expert Support</h4>
              <p className="text-gray-400">
                Access to professional PC builders and technical support when you need it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-red-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 PC Builder Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>

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