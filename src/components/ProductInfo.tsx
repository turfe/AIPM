import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ProductInfoProps {
  name: string;
  condition: string;
  description: string;
  isDescriptionExpanded: boolean;
  onToggleDescription: () => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  name,
  condition,
  description,
  isDescriptionExpanded,
  onToggleDescription,
}) => {
  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-medium">{name}</h2>
        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-sm">
          {condition}
        </span>
      </div>
      
      <div className="mb-6">
        <button
          onClick={onToggleDescription}
          className="w-full text-left flex items-center justify-between text-gray-600 hover:text-gray-900"
        >
          <p className={`${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
            {description}
          </p>
          {isDescriptionExpanded ? (
            <ChevronUp className="flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown className="flex-shrink-0 ml-2" />
          )}
        </button>
      </div>
    </>
  );
};