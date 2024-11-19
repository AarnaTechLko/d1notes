"use client"
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa'; // You can install react-icons for icons
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
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
            <a href="#" aria-label="Twitter" className='text-2xl pb-5 font-bold h-6 w-6 mb-2 text-white hover:text-blue-600'>
            <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    version="1.1"
    id="Layer_1"
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
     className='text-white'
    xmlSpace="preserve"
    fill="currentColor"
  >
    <path d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717  l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339  l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z" />
  </svg>
              
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
