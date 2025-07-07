import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { MdHelpOutline, MdKeyboardArrowDown } from "react-icons/md";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
interface EnterpriseMenuProps {
  session: any; // Adjust to your actual session type
  closeMenu: () => void;
  isActiveLink: (path: string) => string;
  handleLogout: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  toggleHelp: () => void;
  toggleDropdown: () => void;
  toggleCreateAccount: () => void;
  helpRef: any;
  helpOpen: any;
}

const EnterpriseMenu: React.FC<EnterpriseMenuProps> = ({ session, closeMenu, isActiveLink, toggleHelp, toggleDropdown, helpRef, helpOpen, toggleCreateAccount }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const enterpriseRef = useRef<HTMLLIElement>(null);
  const [enterpriseOpen, setEnterpriseOpen] = useState(false);
  const createAccountRef = useRef<HTMLLIElement>(null);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    event.preventDefault();
    setIsLoggingOut(true);

    try {
      // ✅ First: Call logout logging API
      await fetch("/api/log-signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      // ✅ Then: Sign out via NextAuth
      await signOut({
        redirect: false,
      });

      // ✅ Navigate to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`/api/notification/unread-count?user_id=${session.user.id}`);
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
  }, [session]);


  const handleClick = async () => {
    try {
      await fetch("/api/notification/mark-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session?.user?.id }),
      });

      // Optional: refresh the unread count after marking read
      setUnreadCount(0);

      // Navigate to notification page
      router.push("/notification");
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };


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
  const handleEnterpriseToggle = () => {
    setEnterpriseOpen((prev) => !prev);
  };
  // Close the dropdown when an option is clicked
  const handleOptionClick = () => {
    setDropdownOpen(false);
    closeMenu(); // Optional: close the menu if you want
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
          Find a Coach
        </Link>
      </li>
      <li className="pt-[8px]">
        <Link
          href="/browse/players"
          className={`${isActiveLink("/browse/players")} hover:text-blue-300`}
          onClick={closeMenu}
        >
          Player Profiles
        </Link>
      </li>
      {/* <li ref={enterpriseRef} className="relative pt-[8px]">
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
      </li> */}

      <li className="pt-[8px]">
        <Link
          href="/browse/clubs"
          // className="block px-4 py-2 text-black hover:text-blue-300"
          className={`${isActiveLink("/browse/clubs")} hover:text-blue-300`}
          onClick={handleOptionClick}>
          Organization Profiles
        </Link>
      </li>
      <li className="pt-[8px]">
        <Link href="/enterprise/dashboard" className={`${isActiveLink("/enterprise/dashboard")} hover:text-blue-300`} onClick={closeMenu}>
          Dashboard
        </Link>
      </li>
      <li className="relative">
        <Link
          href="/browse/tickets"
          className={`${isActiveLink("/browse/tickets")} w-full block text-left py-2 text-black hover:text-blue-300`}
          onClick={closeMenu}
        >
          Support
        </Link>
      </li>

      {/* commented by Harsh 14-03-2025 */}
      {/* <li className="pt-[8px]">
        <Link href="/enterprise/dashboard" className=" text-black font-bold py-2 px-4 rounded  cursor-default" onClick={closeMenu}>
           {session?.user?.name || "Enterprise"}!
        </Link>
      </li> */}
      <li className="pt-[8px] relative" onClick={handleClick}>
        <Link
          href="/notification"
          className={`${isActiveLink("/coach/dashboard")} hover:text-blue-500`}
        >
          <Bell className="text-black w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </li>

      <li className="pt-[8px]">
        <Link href="#" onClick={handleLogout} className={`${isActiveLink("/coach/dashboard")} hover:text-blue-300`}>Log Out</Link>
      </li>

      {/* <li className="relative text-center items-center" ref={dropdownRef}>
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

export default EnterpriseMenu;
