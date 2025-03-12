import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { MdHelpOutline, MdKeyboardArrowDown } from "react-icons/md";

interface EnterpriseMenuProps {
    session: any; // Adjust to your actual session type
    closeMenu: () => void;
    isActiveLink: (path: string) => string;
    handleLogout: () => void;
    toggleHelp:()=>void;
    toggleDropdown:()=>void;
    toggleCreateAccount:()=>void;
    helpRef:any;
    helpOpen:any;
}

const TeamMenu: React.FC<EnterpriseMenuProps> = ({ session, closeMenu, isActiveLink, handleLogout,toggleHelp,toggleDropdown,helpRef,helpOpen,toggleCreateAccount }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const enterpriseRef = useRef<HTMLLIElement>(null);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const createAccountRef = useRef<HTMLLIElement>(null);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, []);

// This function toggles the dropdown
const handleToggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
};

// Close the dropdown when an option is clicked
const handleOptionClick = () => {
    setDropdownOpen(false);
    closeMenu(); // Optional: close the menu if you want
};
const handleEnterpriseToggle = () => {
  setEnterpriseOpen((prev) => !prev);
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

<li className="pt-[8px] border-b-1 md:border-b-0">
                <Link
                    href="/browse"
                    className={`${isActiveLink("/browse")} hover:text-blue-300`}
                    onClick={closeMenu}
                >
                    Coaches
                </Link>
            </li>
            <li className="pt-[8px]">
                <Link
                    href="/browse/players"
                    className={`${isActiveLink("/browse/players")} hover:text-blue-300`}
                    onClick={closeMenu}
                >
                    Players
                </Link>
            </li>
            <li ref={enterpriseRef} className="relative pt-[8px]">
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
            
            
      <li className="pt-[8px]">
        <Link href="/teampanel/dashboard" className={`${isActiveLink("/enterprise/dashboard")} hover:text-blue-300`} onClick={closeMenu}>
          Dashboard
        </Link>
      </li>
      
      
      <li className="pt-[8px]">
        <Link href="/teampanel/dashboard" className=" text-black font-bold py-2 px-4 rounded  cursor-default" onClick={closeMenu}>
         {session?.user?.name || "Team"}!
        </Link>
      </li>
{/* 
      <li className="relative text-center items-center" ref={dropdownRef}>
  <button
    onClick={handleToggleDropdown}
    className="flex mx-auto" // Centering image in the button
  >
    <Image
      src={session?.user?.image || '/default-image.jpg'}
      alt="Profile"
      width={40}
      height={40}
      className="rounded-full h-12 w-12 border-gray-900"
    />
  </button>
  
</li> */}

    
    </>
  );
};

export default TeamMenu;
