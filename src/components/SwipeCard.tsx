import React, { useState } from 'react';
import { motion, PanInfo, useAnimation, AnimatePresence } from 'framer-motion';
import { Heart, X, ShoppingCart, ChevronDown, ChevronUp, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types/product';

interface SwipeCardProps {
  product: Product;
  onSwipe: (direction: 'left' | 'right') => void;
  onAddToCart: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ product, onSwipe, onAddToCart }) => {
  const controls = useAnimation();
  const [isExiting, setIsExiting] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (isExiting) return;
    
    const threshold = 100;
    if (Math.abs(info.offset.x) > threshold) {
      setIsExiting(true);
      const direction = info.offset.x > 0 ? 'right' : 'left';
      await controls.start({
        x: direction === 'right' ? 1000 : -1000,
        opacity: 0,
        transition: { duration: 0.5 }
      });
      onSwipe(direction);
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  const handleButtonClick = async (direction: 'left' | 'right') => {
    if (isExiting) return;
    setIsExiting(true);
    await controls.start({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0,
      transition: { duration: 0.5 }
    });
    onSwipe(direction);
  };

  const handleAddToCart = async () => {
    if (isExiting) return;
    setIsExiting(true);
    await controls.start({ scale: 1.1, transition: { duration: 0.2 } });
    await controls.start({
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.3 }
    });
    onAddToCart();
    onSwipe('left');
  };

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
    <>
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ x: 0, opacity: 1 }}
      whileDrag={{ scale: 1.05 }}
      className="absolute w-full max-w-sm bg-white rounded-xl shadow-xl"
    >
      <div className="relative">
        <div className="relative cursor-pointer group">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={product.images[currentImageIndex].url}
              alt={product.images[currentImageIndex].alt}
              className="w-full h-96 object-cover rounded-t-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          
          <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                previousImage();
              }}
              className="p-2 bg-black/75 backdrop-blur-sm rounded-full text-white hover:bg-black/90 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="p-2 bg-black/75 backdrop-blur-sm rounded-full text-white hover:bg-black/90 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="absolute top-4 left-4 bg-purple-600/75 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-lg font-medium text-white">${product.price}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-medium">{product.name}</h2>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-sm">
            {product.condition}
          </span>
        </div>
        
        <div className="mb-6">
          <button
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="w-full text-left flex items-center justify-between text-gray-600 hover:text-gray-900"
          >
            <p className={`${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
              {product.description}
            </p>
            {isDescriptionExpanded ? (
              <ChevronUp className="flex-shrink-0 ml-2" />
            ) : (
              <ChevronDown className="flex-shrink-0 ml-2" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => handleButtonClick('left')}
            className="p-4 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
            aria-label="Dislike"
          >
            <X size={24} />
          </button>
          
          <button
            onClick={handleAddToCart}
            className="p-4 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition-colors"
            aria-label="Add to Cart"
          >
            <ShoppingCart size={24} />
          </button>
          
          <button
            onClick={() => handleButtonClick('right')}
            className="p-4 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
            aria-label="Like"
          >
            <Heart size={24} />
          </button>
        </div>
      </div>
    </motion.div>
    </>
  );
};
