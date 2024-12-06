import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { Heart } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { likedProducts, removeLikedProduct } = useProducts();

  if (likedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-pink-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
          <p className="text-gray-600">Start swiping to find items you love!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {likedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRemove={() => removeLikedProduct(product.id)}
                removeLabel="Remove from favorites"
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};