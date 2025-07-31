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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent">
              Build Your Dream PC
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create the perfect gaming rig, workstation, or home computer with our expert guidance and compatibility checking system.
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Start Your Build Card */}
            <div 
              onClick={handleStartBuild}
              className="group relative bg-gradient-to-br from-red-600 to-red-800 p-8 rounded-2xl shadow-2xl hover:shadow-red-500/20 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6 group-hover:bg-white/20 transition-colors">
                  <Cpu className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Start Your Build</h3>
                <p className="text-red-100 mb-6 leading-relaxed">
                  {isAuthenticated 
                    ? 'Configure your perfect PC with our intelligent component selector. Get real-time compatibility checks and performance estimates.'
                    : 'Sign in to start building your perfect PC with our intelligent component selector and compatibility checking system.'
                  }
                </p>
                <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>{isAuthenticated ? 'Begin Building' : 'Sign In to Build'}</span>
                  <Zap className="h-5 w-5 ml-2" />
                </div>
              </div>
            </div>

            {/* Talk to Expert Card */}
            <div className="group relative bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-red-500/20 hover:border-red-500/40">
              <div className="absolute inset-0 bg-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6 group-hover:bg-red-500/20 transition-colors">
                  <MessageCircle className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">Talk to an Expert</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Get personalized advice from our PC building specialists. Schedule a consultation or chat with us live for expert guidance.
                </p>
                <div className="flex items-center text-red-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                  <span>Get Expert Help</span>
                  <MessageCircle className="h-5 w-5 ml-2" />
                </div>
              </div>
            </div>
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