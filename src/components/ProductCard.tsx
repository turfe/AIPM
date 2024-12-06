import React from 'react';
import { ExternalLink, Trash2 } from 'lucide-react';
import { Product } from '../types/product';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onRemove?: () => void;
  removeLabel?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onRemove,
  removeLabel = "Remove" 
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
          <span className="text-lg font-bold text-green-600">${product.price}</span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            {product.condition}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <p>Size: {product.size}</p>
            <p>{product.brand}</p>
          </div>
          
          <div className="flex gap-2">
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 size={16} />
                {removeLabel}
              </button>
            )}
            <a
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <ExternalLink size={16} />
              Buy Now
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};