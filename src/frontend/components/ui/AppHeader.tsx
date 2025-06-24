"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  name: string;
}

export default function AppHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        // User not authenticated
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", protected: true },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo/Brand */}
          <Link 
            href="/"
            className="flex items-center space-x-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-lg">G</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Growth By Design
              </span>
              <div className="text-xs text-gray-500 font-medium tracking-wide">
                AI-Powered Growth Intelligence
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-base">{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.name || 'User'}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-96 opacity-100 pb-6' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="pt-4 space-y-2">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive 
                      ? "text-blue-600 bg-blue-50" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            
            {!user && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600 mb-3">Ready to get started?</p>
                  </div>
                  <Link
                    href="/get-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center shadow-lg"
                  >
                    🚀 Get Started
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            )}
            
            {user && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name || 'User'}</div>
                      <div className="text-gray-500 text-sm">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 