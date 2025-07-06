import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, ShoppingCart, Package, DollarSign, Cpu, AlertCircle, CreditCard } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  description: string | null;
  components: any;
  total_price: number;
  created_at: string;
}

interface CartPageProps {
  onBackToHome: () => void;
  cartItems: CartItem[];
  onRemoveFromCart: (buildId: string) => void;
  onClearCart: () => void;
}

export default function CartPage({ onBackToHome, cartItems, onRemoveFromCart, onClearCart }: CartPageProps) {
  const getComponentCount = (components: any) => {
    return Object.values(components).filter(component => component !== null).length;
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCheckout = () => {
    alert('Checkout functionality would be implemented here with payment processing.');
  };

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
                Shopping Cart
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-300">
                <span className="text-red-400 font-semibold">{cartItems.length}</span> items
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-24 h-24 bg-gray-800/50 rounded-full mb-6 mx-auto">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Cart is Empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Add some PC builds to your cart to get started with your purchase.
            </p>
            <button
              onClick={onBackToHome}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <Package className="h-5 w-5" />
              <span>Browse Builds</span>
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Cart Items</h2>
              
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:border-red-500/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => onRemoveFromCart(item.id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      {item.description && (
                        <p className="text-gray-400 text-sm mb-4">
                          {item.description}
                        </p>
                      )}

                      {/* Item Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Cpu className="h-4 w-4" />
                          <span>{getComponentCount(item.components)}/10 Components</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Package className="h-4 w-4" />
                          <span>Created {formatDate(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-green-400">
                        ${item.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Items ({cartItems.length})</span>
                    <span className="text-white">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tax (estimated)</span>
                    <span className="text-white">${(getTotalPrice() * 0.08).toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Total</span>
                      <span className="font-bold text-xl text-red-400">
                        ${(getTotalPrice() * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 mb-4"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Proceed to Checkout</span>
                </button>

                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    Secure checkout powered by industry-standard encryption
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}