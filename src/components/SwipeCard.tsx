import React from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Heart, X, ExternalLink, ShoppingCart } from 'lucide-react';
import { Product } from '../types/product';

interface SwipeCardProps {
  product: Product;
  onSwipe: (direction: 'left' | 'right') => void;
  onAddToCart: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ product, onSwipe, onAddToCart }) => {
  const controls = useAnimation();
  const [isExiting, setIsExiting] = React.useState(false);

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
    await controls.start({
      scale: 1.1,
      transition: { duration: 0.2 }
    });
    await controls.start({
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.3 }
    });
    onAddToCart();
    onSwipe('left');
  };

  const handleBuyNow = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isExiting) return;

    setIsExiting(true);
    await controls.start({
      scale: 1.1,
      transition: { duration: 0.2 }
    });
    await controls.start({
      y: -100,
      opacity: 0,
      transition: { duration: 0.3 }
    });
    window.open(product.externalUrl, '_blank');
    onSwipe('left');
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ x: 0, opacity: 1 }}
      whileDrag={{ scale: 1.05 }}
      className="relative w-full max-w-sm bg-white rounded-xl shadow-xl"
    >
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-96 object-cover rounded-t-xl"
        />
        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
          <span className="text-lg font-bold text-green-600">${product.price}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            {product.condition}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">{product.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">Size: {product.size}</span>
          <span className="text-sm font-medium text-gray-700">{product.brand}</span>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => handleButtonClick('left')}
            className="p-3 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
            aria-label="Dislike"
            disabled={isExiting}
          >
            <X size={24} />
          </button>
          
          <button
            onClick={handleAddToCart}
            className="p-3 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors"
            aria-label="Add to cart"
            disabled={isExiting}
          >
            <ShoppingCart size={24} />
          </button>
          
          <a
            href={product.externalUrl}
            onClick={handleBuyNow}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <ExternalLink size={18} />
            Buy Now
          </a>
          
          <button
            onClick={() => handleButtonClick('right')}
            className="p-3 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors"
            aria-label="Like"
            disabled={isExiting}
          >
            <Heart size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};