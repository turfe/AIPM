import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface Image {
  url: string;
  alt: string;
}

interface ImageCarouselProps {
  images: Image[];
  currentImageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  onImageSelect: (index: number) => void;
  onOpenModal: () => void;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  currentImageIndex,
  onPrevious,
  onNext,
  onImageSelect,
  onOpenModal,
}) => {
  return (
    <div 
      className="relative cursor-pointer group"
      onClick={onOpenModal}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImageIndex}
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].alt}
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
            onPrevious();
          }}
          className="p-2 bg-black/75 backdrop-blur-sm rounded-full text-white hover:bg-black/90 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="p-2 bg-black/75 backdrop-blur-sm rounded-full text-white hover:bg-black/90 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onImageSelect(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute top-4 right-4 p-2 bg-purple-600/75 backdrop-blur-sm rounded-lg">
        <Maximize2 size={20} className="text-white" />
      </div>
    </div>
  );
};