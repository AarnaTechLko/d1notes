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
      }, 2000);
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
          <nav className="md:flex md:items-center w-full md:w-auto ml-auto flex-row-reverse">
            <ul className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-4 md:mt-0">
              {session ? (
                <>
                  <li  className="pt-[8px]">
                    <Link href="/browse"  className={`${isActiveLink(
                            "/browse"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Coaches
                    </Link>
                  </li>
                  <li  className="pt-[8px]">
                    <Link href="/browse/clubs" className={`${isActiveLink(
                            "/browse/clubs"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Clubs
                    </Link>
                  </li>
                  <li  className="pt-[8px]">
                    <Link href="/browse/teams" className={`${isActiveLink(
                            "/browse/teams"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Teams
                    </Link>
                  </li>
                  <li  className="pt-[8px]">
                    <Link href="/browse/players" className={`${isActiveLink(
                            "/browse/players"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Players
                    </Link>
                  </li>
                  {session?.user?.type === 'coach' && (
                    <>
                      <li className="pt-[8px]">
                        <Link href="/coach/dashboard" className={`${isActiveLink(
                            "/coach/dashboard"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                          Dashboard
                        </Link>
                      </li>
                      {session?.user?.club_id !== '' && session?.user.club_id ? (
                      <li className="pt-[8px]">
                        <Link href="/coach/invitation" className={`${isActiveLink(
                            "/coach/invitation"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                          Send Invitation
                        </Link>
                      </li>
                       ):(
                        <></>
                       )}
                      <li className="pt-[8px]">
                        <Link href="/coach/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={closeMenu}>
                          Hello, {session?.user?.name || "Coach"}!
                        </Link>
                      </li>
                    </>
                 
                  )}
                  {session?.user?.type === 'player' && (
                    <>
                      <li className="pt-[8px]">
                        <Link href="/dashboard" className={`${isActiveLink(
                            "/dashboard"
                          )} hover:text-blue-300`} onClick={closeMenu}>
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
                   {session?.user?.type === 'enterprise' && (
                    <>
                      <li className="pt-[8px]">
                        <Link href="/enterprise/dashboard" className={`${isActiveLink(
                            "/enterprise/dashboard"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                          Dashboard
                        </Link>
                      </li>
                      <li className="pt-[8px]">
                        <Link href="/enterprise/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={closeMenu}>
                          Hello, {session?.user?.name || "Player"}!
                        </Link>
                      </li>
                    </>
                  )}
                   {session?.user?.type === 'team' && (
                    <>
                      <li className="pt-[8px]">
                        <Link href="/team/dashboard" className={`${isActiveLink(
                            "/team/dashboard"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                          Dashboard
                        </Link>
                      </li>
                      <li className="pt-[8px]">
                        <Link href="/team/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={closeMenu}>
                          Hello, {session?.user?.name || "Player"}!
                        </Link>
                      </li>
                    </>
                  )}
                  <li className="relative" ref={dropdownRef}>
                    <button onClick={toggleDropdown} className="flex items-center">
                      <Image
                        src={session?.user?.image || defaultImage}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full h-12 w-12 border-gray-900"
                      />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md">
                        <ul>
                          {session?.user?.type === 'coach' && (
                            <li className="pt-[8px]">
                              <Link href="/coach/profile" className={`${isActiveLink(
                            "/coach/profile"
                          )} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Profile
                              </Link>
                              <Link href="/coach/changepassword" className={`${isActiveLink(
                            "/profile"
                          )} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Change Password
                              </Link>
                            </li>
                          )}
                          {session?.user?.type === 'player' && (
                            <li className="pt-[8px] z-40">
                              <Link href="/profile" className={`${isActiveLink(
                            "/profile"
                          )} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Profile
                              </Link>

                              <Link href="/changepassword" className={`${isActiveLink(
                            "/profile"
                          )} hover:text-black-300 z-40 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Change Password
                              </Link>
                            </li>
                          )}
                          {session?.user?.type === 'enterprise' && (
                            <li className="pt-[8px]">
                              {/* <Link href="/enterprise/profile" className={`${isActiveLink(
                            "/profile"
                          )} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Profile
                              </Link> */}

                              <Link href="/enterprise/changepassword" className={`${isActiveLink(
                            "/profile"
                          )} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Change Password
                              </Link>
                            </li>
                          )}
                          {session?.user?.type === 'team' && (
                            <li className="pt-[8px]">
                              {/* <Link href="/enterprise/profile" className={`${isActiveLink(
                            "/profile"
                          )} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Profile
                              </Link> */}

                              <Link href="/team/changepassword" className={`${isActiveLink(
                            "/profile"
                          )} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`} onClick={closeMenu}>
                                Change Password
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
                    <Link href="/browse"  className={`${isActiveLink(
                            "/browse"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Coaches
                    </Link>
                  </li>
                  <li >
                    <Link href="/browse/clubs" className={`${isActiveLink(
                            "/browse/clubs"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Clubs
                    </Link>
                  </li>
                  <li >
                    <Link href="/browse/teams" className={`${isActiveLink(
                            "/browse/teams"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Teams
                    </Link>
                  </li>
                  <li >
                    <Link href="/browse/players" className={`${isActiveLink(
                            "/browse/players"
                          )} hover:text-blue-300`} onClick={closeMenu}>
                       Players
                    </Link>
                  </li>
                  <li ref={createAccountRef} className="relative">
                    <button onClick={toggleCreateAccount} className="text-black hover:text-blue-300">
                      Create Account
                    </button>
                    {createAccountOpen && (
                      <div className="absolute left-0 mt-2 w-48 z-10 bg-white shadow-lg rounded-md">
                        <ul>
                          <li className="pt-[8px]">
                            <Link href="/register" className="block px-4 py-2 text-black hover:bg-blue-300" onClick={() => setCreateAccountOpen(false)}>
                              Player Signup
                            </Link>
                          </li>
                          <li className="pt-[8px]">
                            <Link href="/coach/signup" className="block px-4 py-2 text-black hover:bg-blue-300" onClick={() => setCreateAccountOpen(false)}>
                              Coach Signup
                            </Link>
                          </li>
                          <li className="pt-[8px]">
                            <Link href="/enterprise/signup" className="block px-4 py-2 text-black hover:bg-blue-300" onClick={() => setCreateAccountOpen(false)}>
                              Club Signup
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                  </li>
                  
                  <li>
                    <Link href="/login" className={`${isActiveLink(
                            "/login"
                          )} hover:text-blue-300`} onClick={closeMenu}>
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
