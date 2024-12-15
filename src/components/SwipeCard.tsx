import React, { useState } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Product } from '../types/product';
import { ImageCarousel } from './ImageCarousel';
import { ImageModal } from './ImageModal';
import { ProductInfo } from './ProductInfo';
import { ActionButtons } from './ActionButtons';

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
          <ImageCarousel
            images={product.images}
            currentImageIndex={currentImageIndex}
            onPrevious={previousImage}
            onNext={nextImage}
            onImageSelect={setCurrentImageIndex}
            onOpenModal={() => setIsImageModalOpen(true)}
          />
          <div className="absolute top-4 left-4 bg-purple-600/75 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-lg font-medium text-white">${product.price}</span>
          </div>
        </div>
        
        <div className="p-6">
          <ProductInfo
            name={product.name}
            condition={product.condition}
            description={product.description}
            isDescriptionExpanded={isDescriptionExpanded}
            onToggleDescription={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          />

          <ActionButtons
            onDislike={() => handleButtonClick('left')}
            onAddToCart={handleAddToCart}
            onLike={() => handleButtonClick('right')}
          />
        </div>
      </motion.div>

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        images={product.images}
        currentImageIndex={currentImageIndex}
        onPrevious={previousImage}
        onNext={nextImage}
        onImageSelect={setCurrentImageIndex}
      />
    </>
  );
};