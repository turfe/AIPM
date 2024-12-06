import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Sustainable Fashion with
            <span className="text-purple-600"> PolySwipe</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Swipe through curated second-hand fashion pieces, powered by AI recommendations.
            Shop sustainably, save money, and find your perfect style match.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full text-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Start Shopping <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};