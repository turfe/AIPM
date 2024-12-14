import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Recycle, Heart, MoveHorizontal, MessageSquare } from 'lucide-react';
import { ContactForm } from '../components/ContactForm';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your Style with
            <span className="text-purple-600"> PolySwipe</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Swipe through curated fashion pieces from sustainable brands and pre-loved collections.
            Our AI learns your preferences to show you items that match your unique style.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full text-lg font-medium hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Shopping <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
            <p className="text-gray-600">
              Our AI algorithm learns from your swipes to create a personalized shopping experience,
              showing you items that match your style preferences.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Recycle className="text-green-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sustainable Fashion</h3>
            <p className="text-gray-600">
              Shop from eco-conscious brands and carefully selected pre-loved pieces,
              making fashion choices that are good for you and the planet.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-pink-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Curated Selection</h3>
            <p className="text-gray-600">
              Every item is hand-picked from trusted sustainable brands and vintage boutiques,
              ensuring quality and authenticity.
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">How PolySwipe Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MoveHorizontal className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Swipe & Discover</h3>
              <p className="text-gray-600">
                Swipe right on items you love, left on those you don't. Each swipe helps our AI
                understand your style better.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
              <p className="text-gray-600">
                Items you love are saved to your favorites, making it easy to find and purchase them
                later.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Better Matches</h3>
              <p className="text-gray-600">
                The more you swipe, the better our recommendations become, creating a truly
                personalized shopping experience.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};