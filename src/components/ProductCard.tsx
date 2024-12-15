import React, { useState } from 'react';
import { ExternalLink, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types/product';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="relative">
        <div className="relative">
          <AnimatePresence>
            <motion.img
              key={currentImageIndex}
              src={product.images[currentImageIndex].url}
              alt={product.images[currentImageIndex].alt}
              className="w-full h-48 object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          <button
            onClick={(e) => {
              e.stopPropagation();
              previousImage();
            }}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight size={16} />
          </button>
        </div>
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