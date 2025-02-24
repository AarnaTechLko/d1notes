import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MdHelpOutline, MdKeyboardArrowDown } from "react-icons/md";

interface FreeMenuProps {
  session: any;
  closeMenu: () => void;
  isActiveLink: (path: string) => string;
  handleLogout: () => void;
  toggleHelp: () => void;
  toggleDropdown: () => void;
  toggleCreateAccount: () => void;
  helpRef: any;
  helpOpen: any;
}

const FreeMenu: React.FC<FreeMenuProps> = ({
  session,
  closeMenu,
  isActiveLink,
  handleLogout,
  toggleHelp,
  toggleDropdown,
  helpRef,
  helpOpen,
  toggleCreateAccount,
}) => {
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const createAccountRef = useRef<HTMLLIElement>(null);
  const enterpriseRef = useRef<HTMLLIElement>(null);

  const handleCreateAccountToggle = () => {
    setCreateAccountOpen((prev) => !prev);
  };

  const handleEnterpriseToggle = () => {
    setEnterpriseOpen((prev) => !prev);
  };

  const handleOptionClick = () => {
    setCreateAccountOpen(false);
    setEnterpriseOpen(false);
    closeMenu();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        createAccountRef.current &&
        !createAccountRef.current.contains(event.target as Node)
      ) {
        setCreateAccountOpen(false);
      }
      if (
        enterpriseRef.current &&
        !enterpriseRef.current.contains(event.target as Node)
      ) {
        setEnterpriseOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <li>
        <Link
          href="/browse"
          className={`border-b-1 md:border-b-0 ${isActiveLink("/browse")} hover:text-blue-300`}
          onClick={closeMenu}
        >
          Coaches
        </Link>
      </li>
      <li>
        <Link
          href="/browse/players"
          className={`${isActiveLink("/browse/players")} hover:text-blue-300`}
          onClick={closeMenu}
        >
          Players
        </Link>
      </li> 
      <li ref={enterpriseRef} className="relative">
        <button
          onClick={handleEnterpriseToggle}
          className="flex items-center text-black hover:text-blue-300"
        >
         Enterprises
          <MdKeyboardArrowDown className={`ml-1 transition-transform ${enterpriseOpen ? "rotate-180" : ""}`} />
        </button>
        {enterpriseOpen && (
          <div className="absolute left-1/4 mt-2 w-48 z-10 bg-white shadow-lg rounded-md md:left-1/2 md:transform md:-translate-x-1/2">
            <ul>
              <li className="pt-[8px]">
                <Link
                  href="/browse/clubs"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={handleOptionClick}
                >
                  Organizations
                </Link>
              </li>
              <li className="pt-[8px]">
                <Link
                  href="/browse/teams"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={handleOptionClick}
                >
                  Teams
                </Link>
              </li>
            </ul>
          </div>
        )}
      </li>
    
      <li ref={createAccountRef} className="relative">
        <button
          onClick={handleCreateAccountToggle}
          className="flex items-center text-black hover:text-blue-300"
        >
          Create Account
          <MdKeyboardArrowDown className={`ml-1 transition-transform ${createAccountOpen ? "rotate-180" : ""}`} />
        </button>
        {createAccountOpen && (
          <div className="absolute left-1/4 mt-2 w-48 z-10 bg-white shadow-lg rounded-md md:left-1/2 md:transform md:-translate-x-1/2">
            <ul>

            <li className="pt-[8px]">
                <Link
                  href="/coach/signup"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={handleOptionClick}
                >
                  Coach  
                </Link>
              </li>
              
              <li className="pt-[8px]">
                <Link
                  href="/register"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={handleOptionClick}
                >
                  Player  
                </Link>
              </li>
              
              <li className="pt-[8px]">
                <Link
                  href="/enterprise/signup"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={handleOptionClick}
                >
                  Organization  
                </Link>
              </li>
              <li className="pt-[8px]">
                <Link
                  href="/teampanel/signup"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={handleOptionClick}
                >
                  Team  
                </Link>
              </li>
            </ul>
          </div>
        )}
      </li>
      <li>
        <Link
          href="/login"
          className={`${isActiveLink("/login")} hover:text-blue-300`}
          onClick={closeMenu}
        >
          Login
        </Link>
      </li>
      <li>
        <Link
          href="/howitworks"
          className={`${isActiveLink("/howitworks")} hover:text-blue-300`}
          onClick={closeMenu}
        >
          How It Works?
        </Link>
      </li>
    </>
  );
};

export default FreeMenu;
