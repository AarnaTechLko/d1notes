import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { MdHelpOutline } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";

interface CoachMenuProps {
    session: any; // Adjust to your actual session type
    closeMenu: () => void;
    isActiveLink: (path: string) => string;
    handleLogout: () => void;
    toggleHelp: () => void;
    toggleDropdown: () => void;
    toggleCreateAccount: () => void;
    helpRef: any;
    helpOpen: any;
}

const CoachMenu: React.FC<CoachMenuProps> = ({
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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [enterpriseOpen, setEnterpriseOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);
    const dropdownMenuRef = useRef<HTMLDivElement>(null);
    const enterpriseMenuRef = useRef<HTMLLIElement>(null);
   
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownMenuRef.current &&
                !dropdownMenuRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
            if (
                enterpriseMenuRef.current &&
                !enterpriseMenuRef.current.contains(event.target as Node)
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
            <li className="relative" ref={enterpriseMenuRef}>
                <button
                    onClick={() => setEnterpriseOpen((prev) => !prev)}
                    className="flex pt-[8px] items-center mx-auto hover:text-blue-300"
                >
                    Enterprises <FaChevronDown className="ml-1" />
                </button>
                {enterpriseOpen && (
                    <div className="absolute left-0 mt-2 w-48 z-50 bg-white shadow-lg rounded-md">
                        <ul>
                            <li className="pt-[8px]">
                                <Link
                                    href="/browse/clubs"
                                    className={`${isActiveLink("/browse/clubs")} block w-full text-left px-4 py-2 text-black hover:bg-blue-300`}
                                    onClick={closeMenu}
                                >
                                    Organizations
                                </Link>
                            </li>
                            <li className="pt-[8px]">
                                <Link
                                    href="/browse/teams"
                                    className={`${isActiveLink("/browse/teams")} block w-full text-left px-4 py-2 text-black hover:bg-blue-300`}
                                    onClick={closeMenu}
                                >
                                    Teams
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </li>
           
            <li className="pt-[8px]">
                <Link
                    href="/coach/dashboard"
                    className={`${isActiveLink("/coach/dashboard")} hover:text-blue-300`}
                    onClick={closeMenu}
                >
                    Dashboard
                </Link>
            </li>
            <li className="pt-[8px]">
                <Link
                    href="/coach/dashboard"
                    className="text-black font-bold py-2 px-4 rounded  cursor-default"
                    onClick={closeMenu}
                >
                 {session?.user?.name || "Coach"}!
                </Link>
            </li>
            {/* <li className="relative" ref={dropdownRef}>
                <button
                   
                    className="flex items-center mx-auto"
                >
                    <Image
                        src={session?.user?.image || "/default.jpg"}
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

export default CoachMenu;
