import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { MdHelpOutline } from "react-icons/md";

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
    const dropdownRef = useRef<HTMLLIElement>(null);
    const dropdownMenuRef = useRef<HTMLDivElement>(null); // Ref for the dropdown menu

    // Close the dropdown when clicking outside
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
                    href="/browse/clubs"
                    className={`${isActiveLink("/browse/clubs")} hover:text-blue-300`}
                    onClick={closeMenu}
                >
                    Organizations
                </Link>
            </li>
            <li className="pt-[8px]">
                <Link
                    href="/browse/teams"
                    className={`${isActiveLink("/browse/teams")} hover:text-blue-300`}
                    onClick={closeMenu}
                >
                    Teams
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
                    href="/coach/invitation"
                    className={`${isActiveLink("/coach/invitation")} hover:text-blue-300`}
                    onClick={closeMenu}
                >
                    Send Invitation
                </Link>
            </li>
            <li className="pt-[8px]">
                <Link
                    href="/coach/dashboard"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={closeMenu}
                >
                    Hello, {session?.user?.name || "Coach"}!
                </Link>
            </li>
            <li className="relative" ref={dropdownRef}>
                <button
                    onClick={handleToggleDropdown}
                    className="flex items-center mx-auto"
                >
                    <Image
                        src={session?.user?.image || '/default.jpg'}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full h-12 w-12 border-gray-900"
                    />
                </button>
                {dropdownOpen && (
                    <div
                        className="absolute  left-1/4 md:left-0 mt-2 w-48 z-50  bg-white shadow-lg rounded-md"
                        ref={dropdownMenuRef} // Attach ref here
                    >
                        <ul>
                            <li className="pt-[8px]">
                                <Link
                                    href="/coach/profile"
                                    className={`${isActiveLink("/coach/profile")} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`}
                                    onClick={() => { handleOptionClick(); }}
                                >
                                    Profile
                                </Link>
                            </li>
                            <li className="pt-[8px]">
                                <Link
                                    href="/coach/changepassword"
                                    className={`${isActiveLink("/coach/changepassword")} hover:text-black-300 block w-full text-left px-4 py-2 text-black hover:bg-blue-300`}
                                    onClick={() => { handleOptionClick(); }}
                                >
                                    Change Password
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => { handleLogout(); handleOptionClick(); }}
                                    className="block w-full text-left px-4 py-2 text-black hover:bg-blue-300"
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </li>
        </>
    );
};

export default CoachMenu;
