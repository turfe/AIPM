import React from 'react';
import { Heart, X, ShoppingCart } from 'lucide-react';

interface ActionButtonsProps {
  onDislike: () => void;
  onAddToCart: () => void;
  onLike: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDislike,
  onAddToCart,
  onLike,
}) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={onDislike}
        className="p-4 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
        aria-label="Dislike"
      >
        <X size={24} />
      </button>
      
      <button
        onClick={onAddToCart}
        className="p-4 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors"
        aria-label="Add to Cart"
      >
        <ShoppingCart size={24} />
      </button>
      
      <button
        onClick={onLike}
        className="p-4 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
        aria-label="Like"
      >
        <Heart size={24} />
      </button>
    </div>
  );
};