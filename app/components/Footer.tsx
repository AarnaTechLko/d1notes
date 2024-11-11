"use client"
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'; // You can install react-icons for icons

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo or Brand Name */}
          <div className="text-2xl font-bold mb-4 md:mb-0">
            D1 NOTES
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
            <a href="/" className="hover:text-blue-400">Home</a>
            <a href="/about" className="hover:text-blue-400">About</a>
            <a href="/browse" className="hover:text-blue-400">Coaches</a>
            <a href="/contact" className="hover:text-blue-400">Contact</a>
          </nav>

          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" aria-label="Facebook">
              <FaFacebook className="h-6 w-6 hover:text-blue-600" />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter className="h-6 w-6 hover:text-blue-400" />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram className="h-6 w-6 hover:text-pink-500" />
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} D1 NOTES. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
