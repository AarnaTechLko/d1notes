"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../globals.css";
import Logo from "../public/images/logo.png";
import Image from "next/image";
import defaultImage from "../public/default.jpg";
import { MdHelpOutline } from "react-icons/md";
import LogoutLoader from "./LoggingOut";
import NavBar from "./NavBar";
import { FaChevronDown } from "react-icons/fa";
import Sidebar from "./Sidebar";
import CoachSidebar from "./coach/Sidebar";
import OrgSidebar from "./enterprise/Sidebar";
import TeamSidebar from "./teams/Sidebar";

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [profilepic, setProfilepic] = useState<string>(defaultImage.src);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [signupOpen, setSignupOpen] = useState<boolean>(false);
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRefSignup = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLLIElement>(null);

  const handleLogout = async (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    event.preventDefault();

    setIsLoggingOut(true);

    try {
      const result = await signOut({
        redirect: false,
        // callbackUrl: "/login",
      });

      // console.log("Results: ", result);
      // console.log("Session: ", session);

      router.push("/login");

      // setTimeout(() => {
        // if (result.url) {
        //   router.push(result.url); // Use Next.js router for redirection
        // }
      // }, 2000);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setEnterpriseOpen(false);
      }
      if (
        dropdownRefSignup.current &&
        !dropdownRefSignup.current.contains(event.target as Node)
      ) {
        setSignupOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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

  const [enterpriseOpen, setEnterpriseOpen] = useState(false);

  const toggleEnterprise = () => setEnterpriseOpen(!enterpriseOpen);
  const toggleSignup = () => setSignupOpen(!enterpriseOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdowns = [
        dropdownRef.current,
        helpRef.current,
        createAccountRef.current,
        dropdownRefSignup.current,
      ];
      const clickedInsideDropdown = dropdowns.some(
        (ref) => ref && ref.contains(event.target as Node)
      );

      if (!clickedInsideDropdown) {
        setDropdownOpen(false);
        setHelpOpen(false);
        setCreateAccountOpen(false);
        setSignupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActiveLink = (href: string) =>
    pathname === href ? "text-blue-500 font-bold" : "text-black";

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center p-4">
        {/* Logo section - Adjust for mobile to center logo */}
        <div className="w-full md:w-1/4 flex flex-col items-center md:flex-row md:justify-start">
          <Link
            href="/"
            className="text-black text-2xl font-bold flex-shrink-0"
            onClick={closeMenu}
          >
            <Image src={Logo} className="logo mx-auto md:ml-0" alt="logo" />
            d1 Notes
          </Link>

          {/* Mobile menu button (visible only on small screens) */}
          {/* <div className="md:hidden mt-2">  
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
         
          </div> */}
        </div>

        {/* Menu section - unchanged */}
        <div
          className={`w-full md:w-3/4 ${
            menuOpen ? "block" : "hidden"
          } md:block `}
        >
          <NavBar
            session={session}
            closeMenu={closeMenu}
            isActiveLink={isActiveLink}
            handleLogout={handleLogout}
            toggleHelp={toggleHelp}
            toggleDropdown={toggleDropdown}
            toggleCreateAccount={toggleCreateAccount}
            helpRef={helpRef}
            helpOpen={helpOpen}
          />
        </div>
        {session?.user.type == "coach" && (
          <>
            <div className="md:hidden">
              <CoachSidebar />
            </div>
            <div className="mt-5 w-full flex justify-between md:hidden relative">
              <Link href="/browse/" className="text-black">
                Coaches
              </Link>
              <Link href="/browse/players" className="text-black">
                Players
              </Link>

              {/* Enterprises Dropdown */}
              <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      // onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
              </Link>
              {/* <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleEnterprise}
                  className="flex items-center text-black"
                >
                  Enterprises <FaChevronDown className="ml-1" />
                </button>
                {enterpriseOpen && (
                  <div className="absolute left-0 mt-2 w-48 z-50 bg-white shadow-lg rounded-md p-2">
                    <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
                    </Link>
                    <Link href="/browse/teams" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setEnterpriseOpen(false)}>Teams</Link>
                  </div>
                )}
              </div> */}
              {/* <a onClick={handleLogout} className="text-black">Signout</a> */}
              <Link href="/coach/dashboard" className="text-black">
                Dashboard
              </Link>
              <a onClick={handleLogout} className="text-black">
                Log Out
              </a>
              {/* <li className="hover:bg-gray-600 rounded transition duration-200">
                    <a  onClick={handleLogout} className="flex items-center space-x-2 p-2 cursor-pointer">
                      <span>Log Out</span>
                    </a>
                  </li> */}

              <button onClick={toggleHelp} className="ml-2">
                <MdHelpOutline className="text-black w-86 h-6" />
              </button>

              {helpOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 md:left-0 md:right-2 md:top-5 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
                  <p>
                    For technical difficulties and other feedback, email us at
                  </p>
                  <a className="font-bold" href="mailto:support@d1notes.com">
                    support@d1notes.com
                  </a>
                  <button onClick={toggleHelp} className="text-blue-500 mt-2">
                    Close
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {!session && (
          <>
            <div className="mt-5 w-full flex justify-between md:hidden  space-x-2">
              <Link href="/browse/" className="text-black">
                Coaches
              </Link>
              <Link href="/browse/players" className="text-black">
                Players
              </Link>

              {/* Enterprises Dropdown */}
              <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      // onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
              </Link>
              {/* <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleEnterprise}
                  className="flex items-center text-black"
                >
                  Enterprises <FaChevronDown className="ml-1" />
                </button>
                {enterpriseOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2">
                    <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
                    </Link>
                    <Link href="/browse/teams" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setEnterpriseOpen(false)}>Teams</Link>
                  </div>
                )}
              </div> */}

              {/* <Link href="/dashboard" className="text-black">Dashboard</Link> */}

              <button onClick={toggleHelp} className="ml-2">
                <MdHelpOutline className="text-black w-86 h-6" />
              </button>

              {helpOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 md:left-0 md:right-2 md:top-5 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
                  <p>
                    For technical difficulties and other feedback, email us at
                  </p>
                  <a className="font-bold" href="mailto:support@d1notes.com">
                    support@d1notes.com
                  </a>
                  <button onClick={toggleHelp} className="text-blue-500 mt-2">
                    Close
                  </button>
                </div>
              )}
            </div>
            <div className="mt-5 w-full flex justify-between md:hidden  space-x-2">
              <div className="relative" ref={dropdownRefSignup}>
                <button
                  onClick={toggleSignup}
                  className="flex items-center text-black"
                >
                  Create Account <FaChevronDown className="ml-1" />
                </button>
                {signupOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2">
                    <Link
                      href="/register"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setSignupOpen(false)}
                    >
                      Player
                    </Link>
                    <Link
                      href="/coach/signup"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setSignupOpen(false)}
                    >
                      Coach
                    </Link>
                    <Link
                      href="/enterprise/signup"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setSignupOpen(false)}
                    >
                      Organization
                    </Link>
                    {/* <Link href="/teampanel/signup" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setSignupOpen(false)}>Team</Link> */}
                  </div>
                )}
              </div>
              <Link href="/login" className="text-black">
                Login
              </Link>
              <Link href="/howitworks" className="text-black">
                How It Works?
              </Link>
            </div>
          </>
        )}

        {session?.user.type == "player" && (
          <>
            <div className="md:hidden">
              <Sidebar />
            </div>
            <div className="mt-5 w-full flex justify-between md:hidden relative space-x-2">
              <Link href="/browse/" className="text-black">
                Coaches
              </Link>
              <Link href="/browse/players" className="text-black">
                Players
              </Link>

              {/* Enterprises Dropdown */}
              <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      // onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
              </Link>
              {/* <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleEnterprise}
                  className="flex items-center text-black"
                >
                  Enterprises <FaChevronDown className="ml-1" />
                </button>
                {enterpriseOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2">
                    <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
                    </Link>
                    <Link href="/browse/teams" className="block px-4 py-2 hover:bg-gray-100" onClick={() => setEnterpriseOpen(false)}>Teams</Link>
                  </div>
                )}
              </div> */}

              <Link href="/dashboard" className="text-black">
                Dashboard
              </Link>
              <a onClick={handleLogout} className="text-black">
                Log Out
              </a>
              <button onClick={toggleHelp} className="ml-2">
                <MdHelpOutline className="text-black w-86 h-6" />
              </button>

              {helpOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 md:left-0 md:right-2 md:top-5 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
                  <p>
                    For technical difficulties and other feedback, email us at
                  </p>
                  <a className="font-bold" href="mailto:support@d1notes.com">
                    support@d1notes.com
                  </a>
                  <button onClick={toggleHelp} className="text-blue-500 mt-2">
                    Close
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {session?.user.type == "enterprise" && (
          <>
            <div className="md:hidden">
              <OrgSidebar />
            </div>
            <div className="mt-5 w-full flex justify-between md:hidden relative space-x-2">
              <Link href="/browse/" className="text-black">
                Coaches
              </Link>
              <Link href="/browse/players" className="text-black">
                Players
              </Link>

              {/* Enterprises Dropdown */}
              <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      // onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
              </Link>
              {/* <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleEnterprise}
                  className="flex items-center text-black"
                >
                  Enterprises <FaChevronDown className="ml-1" />
                </button>
                {enterpriseOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2">
                    <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
                    </Link>
                    <Link
                      href="/browse/teams"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setEnterpriseOpen(false)}
                    >
                      Teams
                    </Link>
                  </div>
                )}
              </div> */}

              <Link href="/enterprise/dashboard" className="text-black">
                Dashboard
              </Link>
              <a onClick={handleLogout} className="text-black">
                Log Out
              </a>
              {/* <a onClick={handleLogout} className="text-black">Signout</a>  */}
              <button onClick={toggleHelp} className="ml-2">
                <MdHelpOutline className="text-black w-86 h-6" />
              </button>

              {helpOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 md:left-0 md:right-2 md:top-5 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
                  <p>
                    For technical difficulties and other feedback, email us at
                  </p>
                  <a className="font-bold" href="mailto:support@d1notes.com">
                    support@d1notes.com
                  </a>
                  <button onClick={toggleHelp} className="text-blue-500 mt-2">
                    Close
                  </button>
                </div>
              )}
              <Link href="/browse/players" className="text-black">
                Players
              </Link>
            </div>
          </>
        )}

        {session?.user.type == "team" && (
          <>
            <div className="md:hidden">
              <TeamSidebar />
            </div>
            <div className="mt-5 w-full flex justify-between md:hidden relative space-x-2">
              <Link href="/browse/" className="text-black">
                Coaches
              </Link>
              <Link href="/browse/players" className="text-black">
                Players
              </Link>

              {/* Enterprises Dropdown */}
              <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      // onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
              </Link>
              {/* <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleEnterprise}
                  className="flex items-center text-black"
                >
                  Enterprises <FaChevronDown className="ml-1" />
                </button>
                {enterpriseOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2">
                    <Link
                      href="/browse/clubs"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setEnterpriseOpen(false)}
                    >
                      Organizations
                    </Link>
                    <Link
                      href="/browse/teams"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setEnterpriseOpen(false)}
                    >
                      Teams
                    </Link>
                  </div>
                )}
              </div> */}
              {/* <a onClick={handleLogout} className="text-black">Signout</a> */}
              <Link href="/teampanel/dashboard" className="text-black">
                Dashboard
              </Link>
              <a onClick={handleLogout} className="text-black">
                Log Out
              </a>
              <button onClick={toggleHelp} className="ml-2">
                <MdHelpOutline className="text-black w-86 h-6" />
              </button>

              {helpOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 md:left-0 md:right-2 md:top-5 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
                  <p>
                    For technical difficulties and other feedback, email us at
                  </p>
                  <a className="font-bold" href="mailto:support@d1notes.com">
                    support@d1notes.com
                  </a>
                  <button onClick={toggleHelp} className="text-blue-500 mt-2">
                    Close
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
