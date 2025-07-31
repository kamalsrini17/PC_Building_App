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
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/60 to-black/80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_50%)] animate-pulse"></div>
          <div className="absolute top-20 left-20 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-32 w-1 h-1 bg-red-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping delay-500"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Side - Welcome Section */}
            <div className="lg:col-span-5 space-y-8">
              {/* Welcome Header */}
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-2 animate-fade-in">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-red-300 text-sm font-medium">Welcome to PC Builder</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-red-200 to-red-400 bg-clip-text text-transparent animate-slide-up">
                  Build Your Dream PC
                </h1>
                <p className="text-lg text-gray-300 leading-relaxed animate-slide-up delay-200">
                  Create the perfect gaming rig, workstation, or home computer with our expert guidance and compatibility checking system.
                </p>
              </div>

              {/* Account Info */}
              <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 animate-slide-up delay-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-red-400" />
                    <span className="text-gray-300 text-sm">
                      {isAuthenticated ? `Signed in as ${user?.email}` : 'Not signed in'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-400">
                      {isAuthenticated ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 animate-slide-up delay-400">
                <button
                  onClick={() => setCurrentPage('myBuilds')}
                  className="group bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/30 rounded-xl p-4 transition-all duration-300 hover:scale-105"
                >
                  <Package className="h-6 w-6 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium text-sm">My Builds</p>
                  <p className="text-gray-400 text-xs">View saved builds</p>
                </button>
                
                <button
                  onClick={() => setCurrentPage('cart')}
                  className="group bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-red-500/30 rounded-xl p-4 transition-all duration-300 hover:scale-105 relative"
                >
                  <ShoppingCart className="h-6 w-6 text-red-400 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-white font-medium text-sm">Cart</p>
                  <p className="text-gray-400 text-xs">{cartItems.length} items</p>
                  {cartItems.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{cartItems.length}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Right Side - Main Action */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="relative max-w-lg w-full">
                {/* Main Build Card */}
                <div 
                  onClick={handleStartBuild}
                  className="group relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-8 rounded-3xl shadow-2xl hover:shadow-red-500/30 transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden animate-slide-up delay-500"
                >
                  {/* Animated Background Elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/5 rounded-full group-hover:scale-125 transition-transform duration-700 delay-100"></div>
                  
                  <div className="relative z-10 text-center space-y-6">
                    {/* Icon */}
                    <div className="flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6 group-hover:bg-white/20 transition-all duration-300 group-hover:rotate-12 mx-auto">
                      <Cpu className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-3xl font-bold text-white group-hover:text-red-100 transition-colors duration-300">
                      {isAuthenticated ? 'Build Your PC' : 'Get Started'}
                    </h2>
                    
                    {/* Description */}
                    <p className="text-red-100/90 leading-relaxed">
                      {isAuthenticated 
                        ? 'Configure your perfect PC with our intelligent component selector and real-time compatibility checks.'
                        : 'Sign in to start building your perfect PC with our intelligent component selector and compatibility checking system.'
                      }
                    </p>
                    
                    {/* Action Button */}
                    <div className="pt-4">
                      <div className="inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-full px-6 py-3 group-hover:translate-y-1 transition-all duration-300">
                        <span className="text-white font-semibold">
                          {isAuthenticated ? 'Start Building' : 'Sign In to Build'}
                        </span>
                        <Zap className="h-5 w-5 text-white group-hover:rotate-12 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-400/20 rounded-lg rotate-12 animate-float"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-red-300/20 rounded-full animate-float delay-1000"></div>
                <div className="absolute top-1/2 -right-8 w-4 h-4 bg-red-500/20 rounded-lg rotate-45 animate-float delay-500"></div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Prebuilts */}
          <div className="mt-16 text-center animate-slide-up delay-700">
            <div className="inline-flex items-center space-x-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-full px-6 py-3 hover:border-red-500/30 transition-colors duration-300 cursor-pointer group">
              <Trophy className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-gray-300 font-medium">Need a PC for College?</span>
              <span className="text-red-400 text-sm">View Prebuilts →</span>
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