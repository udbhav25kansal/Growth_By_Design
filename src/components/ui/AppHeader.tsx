"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link 
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            Growth By Design
          </Link>

          {/* Navigation Links */}
          <nav className="flex space-x-8" role="navigation" aria-label="Main navigation">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === "/" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Home
            </Link>
            
            <Link
              href="/get-started"
              className={`text-sm font-medium transition-colors ${
                pathname === "/get-started" 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-700 hover:text-blue-600"
              }`}
            >
              Get Started
            </Link>

            {/* CTA Button */}
            <Link
              href="/get-started"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Start Now
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 