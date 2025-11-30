'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { HiMenu, HiX } from 'react-icons/hi';
import Logo from './Logo';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Logo variant="light" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/search"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Listings
            </Link>
            <Link
              href="/preapproval"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Services
            </Link>
            <Link
              href="#contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="text-gray-500 text-sm">Loading...</div>
            ) : session ? (
              <>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Logout
                </button>
                <Link
                  href="/profile"
                  className="bg-[#2A6AFF] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e5ae6] transition-colors shadow-md hover:shadow-lg"
                >
                  My Profile
                </Link>
              </>
            ) : (
              <Link
                href="/auth"
                className="bg-[#2A6AFF] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e5ae6] transition-colors shadow-md hover:shadow-lg"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <HiX className="h-6 w-6" />
            ) : (
              <HiMenu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Listings
              </Link>
              <Link
                href="/preapproval"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="#contact"
                className="text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {status === 'loading' ? (
                  <div className="text-gray-500 text-sm">Loading...</div>
                ) : session ? (
                  <>
                    <button
                      onClick={() => {
                        signOut({ callbackUrl: '/' });
                        setMobileMenuOpen(false);
                      }}
                      className="text-gray-700 hover:text-blue-600 font-medium w-full text-left"
                    >
                      Logout
                    </button>
                    <Link
                      href="/profile"
                      className="bg-[#2A6AFF] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e5ae6] transition-colors inline-block text-center w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/auth"
                    className="bg-[#2A6AFF] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#1e5ae6] transition-colors inline-block text-center w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

