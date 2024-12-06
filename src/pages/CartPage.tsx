import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { ShoppingCart } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cartItems, removeFromCart } = useProducts();
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600">Add items to your cart to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Cart</h1>
          <div className="text-lg font-semibold">
            Total: <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {cartItems.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRemove={() => removeFromCart(product.id)}
                removeLabel="Remove from cart"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};