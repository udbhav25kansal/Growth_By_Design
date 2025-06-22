"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="nav-blur">
      <div className="wrap">
        <nav className="flex items-center justify-between h-11" role="navigation" aria-label="Main navigation">
          {/* Logo/Brand - Center aligned like Apple */}
          <div className="flex-1" />
          
          <Link 
            href="/"
            className="text-white text-sm font-medium tracking-tight hover:opacity-80 transition-opacity duration-300"
          >
            Growth By Design
          </Link>
          
          <div className="flex-1 flex justify-end">
            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className={`text-xs font-normal text-white hover:opacity-80 transition-opacity duration-300 ${
                  pathname === "/" ? "opacity-100" : "opacity-70"
                }`}
              >
                Home
              </Link>
              
              <Link
                href="/get-started"
                className={`text-xs font-normal text-white hover:opacity-80 transition-opacity duration-300 ${
                  pathname === "/get-started" ? "opacity-100" : "opacity-70"
                }`}
              >
                Get Started
              </Link>

              <Link
                href="/dashboard"
                className={`text-xs font-normal text-white hover:opacity-80 transition-opacity duration-300 ${
                  pathname === "/dashboard" ? "opacity-100" : "opacity-70"
                }`}
              >
                Dashboard
              </Link>

              {/* Shopping bag icon placeholder - Apple style */}
              <button 
                className="text-white opacity-70 hover:opacity-100 transition-opacity duration-300"
                aria-label="Menu"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path 
                    d="M11.5 4H2.5L1 1H0V0H1.5L3 3H12L11.5 4ZM3.5 5H10.5L10 9H4L3.5 5ZM4 11C4.55228 11 5 11.4477 5 12C5 12.5523 4.55228 13 4 13C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11ZM10 11C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12C9 11.4477 9.44772 11 10 11Z" 
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
} 