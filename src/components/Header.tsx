import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-purple-600">
          PolySwipe
        </Link>
        
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/favorites" className="p-2 text-gray-600 hover:text-purple-600">
                <Heart size={24} />
              </Link>
              <Link to="/cart" className="p-2 text-gray-600 hover:text-purple-600">
                <ShoppingBag size={24} />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-purple-600"
              >
                <LogOut size={24} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="p-2 text-gray-600 hover:text-purple-600 flex items-center gap-2"
              >
                <LogIn size={20} />
                <span className="hidden md:inline">Sign In</span>
              </Link>
              <Link
                to="/register"
                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <UserPlus size={20} />
                <span className="hidden md:inline">Sign Up</span>
              </Link>
            </>
          )}
          <button className="p-2 text-gray-600 hover:text-purple-600 md:hidden">
            <Menu size={24} />
          </button>
        </nav>
      </div>
    </header>
  );
};