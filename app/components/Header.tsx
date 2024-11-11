"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import '../globals.css';
import Logo from '../public/images/logo.png';
import Image from 'next/image';
import defaultImage from '../public/default.jpg';
import { MdHelpOutline } from 'react-icons/md';

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

  // Refs to detect outside click
  const dropdownRef = useRef<HTMLLIElement>(null);
  const helpRef = useRef<HTMLLIElement>(null);

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/login',
      });
  
      localStorage.removeItem('userImage');
  
      window.location.href = '/login';
    } catch (error) {
      
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

  useEffect(() => {
    const userImage = localStorage.getItem('userImage');
    if (userImage) {
      setIsUserImageAvailable(true);
      setProfilepic(userImage);
    } else if (session?.user) {
      fetchUserImage();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        helpRef.current && !helpRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
        setHelpOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, helpRef, session]);

  const fetchUserImage = async () => {
    try {
      const response = await fetch('/api/userimage', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id, 
          type: session?.user?.type, 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.image) {
        localStorage.setItem('userImage', data.image);
        setProfilepic(data.image);
        setIsUserImageAvailable(true);
      }
    } catch (error) {
      
    }
  };

  return (
    <header className="bg-white shadow-md">
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
          <nav className="md:flex md:items-center w-full md:w-auto ml-auto flex-row-reverse">
            <ul className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-4 md:mt-0">
              {session ? (
                <>
                  {session?.user?.type !== 'coach' && isUserImageAvailable && (
                    <li className="pt-[8px]">
                      <Link href="/browse" className="text-black hover:text-black-300" onClick={closeMenu}>
                        Browse Coaches
                      </Link>
                    </li>
                  )}
                  {session?.user?.type === 'coach' && (
                    <>
                      <li className="pt-[8px]">
                        <Link href="/coach/dashboard" className="text-black hover:text-black-300" onClick={closeMenu}>
                          Dashboard
                        </Link>
                      </li>
                      <li className="pt-[8px]">
                        <Link href="/coach/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={closeMenu}>
                          Hello, {session?.user?.name || "Coach"}!
                        </Link>
                      </li>
                    </>
                  )}
                  {session?.user?.type !== 'coach' && (
                    <>
                      <li className="pt-[8px]">
                        <Link href="/dashboard" className="text-black hover:text-black-300" onClick={closeMenu}>
                          Dashboard
                        </Link>
                      </li>
                      <li className="pt-[8px]">
                        <Link href="/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={closeMenu}>
                          Hello, {session?.user?.name || "Player"}!
                        </Link>
                      </li>
                    </>
                  )}
                  <li className="relative" ref={dropdownRef}>
                    <button onClick={toggleDropdown} className="flex items-center">
                      <Image
                        src={localStorage.getItem('userImage') || defaultImage}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                        <ul>
                          {session?.user?.type === 'coach' && (
                            <li className="pt-[8px]">
                              <Link href="/coach/profile" className="block w-full text-left px-4 py-2 text-black hover:bg-blue-300" onClick={closeMenu}>
                                Profile
                              </Link>
                            </li>
                          )}
                          {session?.user?.type === 'player' && (
                            <li className="pt-[8px]">
                              <Link href="/profile" className="block w-full text-left px-4 py-2 text-black hover:bg-blue-300" onClick={closeMenu}>
                                Profile
                              </Link>
                            </li>
                          )}
                          <li>
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-black hover:bg-blue-300">
                              Logout
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/browse" className="text-black hover:text-black-300" onClick={closeMenu}>
                      Browse Coaches
                    </Link>
                  </li>
                  <li>
                    <Link href="/coach/signup" className="text-black hover:text-black-300" onClick={closeMenu}>
                      Coach Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-black hover:text-black-300" onClick={closeMenu}>
                      Player Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link href="/login" className="text-black hover:text-blue-300" onClick={closeMenu}>
                      Login
                    </Link>
                  </li>
                </>
              )}
              <li className="relative" ref={helpRef}>
                <button onClick={toggleHelp} className="ml-4">
                  <MdHelpOutline className="text-black w-8 h-8" />
                </button>
                {helpOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
                    <p>For technical difficulties and general site feedback, Email us at </p>
                    <a className="font-bold" href='mailto:team@d1notes.com'>team@d1notes.com</a>
                    <button onClick={toggleHelp} className="text-blue-500 mt-2">
                      Close
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
