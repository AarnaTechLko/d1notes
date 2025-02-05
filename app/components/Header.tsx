"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../globals.css';
import Logo from '../public/images/logo.png';
import Image from 'next/image';
import defaultImage from '../public/default.jpg';
import { MdHelpOutline } from 'react-icons/md';
import LogoutLoader from './LoggingOut';
import NavBar from './NavBar';

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [profilepic, setProfilepic] = useState<string>(defaultImage.src);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { data: session } = useSession(); 
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState<boolean>(false);
  const [isUserImageAvailable, setIsUserImageAvailable] = useState(false);
  const createAccountRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  const [createAccountOpen, setCreateAccountOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Refs to detect outside click
  const dropdownRef = useRef<HTMLLIElement>(null);
  const helpRef = useRef<HTMLLIElement>(null);
  const handleLogout = async () => {
    setIsLoggingOut(true); // Show the loader

    try {
      const result = await signOut({
        redirect: false, // Prevent automatic redirect by NextAuth
        callbackUrl: "/login", // Specify the callback URL, but handle redirection manually
      });

      // Simulate a delay for UX (optional)
      setTimeout(() => {
        if (result.url) {
          window.location.replace(result.url); // Redirect to the login page
        }
      }, 5000);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false); // Hide the loader in case of an error
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleHelp = () => {
    setHelpOpen(!helpOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };
  const toggleCreateAccount = () => setCreateAccountOpen(!createAccountOpen);




  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = [dropdownRef.current, helpRef.current, createAccountRef.current];
      const clickedInsideDropdown = dropdowns.some(
        (ref) => ref && ref.contains(event.target as Node)
      );
  
      if (!clickedInsideDropdown) {
        setDropdownOpen(false);
        setHelpOpen(false);
        setCreateAccountOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActiveLink = (href: string) =>
    pathname === href ? "text-blue-500 font-bold" : "text-black";

  return (
    <header className="bg-white shadow-md">
       {isLoggingOut && <LogoutLoader />}
      <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center p-4">
        
        {/* Logo section - Adjust for mobile to center logo */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:flex-row md:justify-start">
          <Link href="/" className="text-black text-2xl font-bold flex-shrink-0" onClick={closeMenu}>
            <Image src={Logo} className="logo mx-auto md:ml-0" alt="logo" />
          </Link>

          {/* Mobile menu button (visible only on small screens) */}
          <div className="md:hidden mt-2"> {/* Add margin-top to separate menu from logo */}
            <button
              onClick={toggleMenu}
              className="text-gray-500 focus:outline-none focus:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Menu section - unchanged */}
        <div className={`w-full md:w-3/4 ${menuOpen ? 'block' : 'hidden'} md:block `}>
         <NavBar session={session} closeMenu={closeMenu} isActiveLink={isActiveLink} handleLogout={handleLogout} toggleHelp={toggleHelp} toggleDropdown={toggleDropdown} toggleCreateAccount={toggleCreateAccount} helpRef={helpRef} helpOpen={helpOpen}/>
        </div>
      </div>
    </header>
  );
};

export default Header;
