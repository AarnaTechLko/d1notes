// FreeMenu.tsx
import { useState, useRef } from "react";
import Link from "next/link";
import { MdHelpOutline } from "react-icons/md";

interface FreeMenuProps {
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

const FreeMenu: React.FC<FreeMenuProps> = ({ session, closeMenu, isActiveLink, handleLogout,toggleHelp,toggleDropdown,helpRef,helpOpen,toggleCreateAccount }) => {
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const createAccountRef = useRef<HTMLLIElement>(null);



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
          href="/browse/clubs"
          className={`${isActiveLink("/browse/clubs")} hover:text-blue-300`}
          onClick={closeMenu}
        >
          Organizations
        </Link>
      </li>
      <li>
        <Link
          href="/browse/teams"
          className={`${isActiveLink("/browse/teams")} hover:text-blue-300`}
          onClick={closeMenu}
        >
          Teams
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
      <li ref={createAccountRef} className="relative">
        <button onClick={toggleCreateAccount} className="text-black hover:text-blue-300">
          Create Account
        </button>
        {createAccountOpen && (
          <div className="absolute left-1/4 mt-2 w-48 z-10 bg-white shadow-lg rounded-md md:left-1/2 md:transform md:-translate-x-1/2">
            <ul>
              <li className="pt-[8px]">
                <Link
                  href="/register"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={() => setCreateAccountOpen(false)}
                >
                  Player Signup
                </Link>
              </li>
              <li className="pt-[8px]">
                <Link
                  href="/coach/signup"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={() => setCreateAccountOpen(false)}
                >
                  Coach Signup
                </Link>
              </li>
              <li className="pt-[8px]">
                <Link
                  href="/enterprise/signup"
                  className="block px-4 py-2 text-black hover:bg-blue-300"
                  onClick={() => setCreateAccountOpen(false) }
                >
                  Organization Signup
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
          How it works?
        </Link>
      </li>
     
    </>
  );
};

export default FreeMenu;
