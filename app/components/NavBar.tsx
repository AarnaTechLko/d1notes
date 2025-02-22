import React, { Suspense, lazy } from "react";
import { MdHelpOutline } from "react-icons/md";
import TeamMenu from "./TeamMenu";

// Lazy load the menu components
const FreeMenu = lazy(() => import("./FreeMenu"));
const CoachMenu = lazy(() => import("./CoachMenu"));
const PlayerMenu = lazy(() => import("./PlayerMenu"));
const EnterpriseMenu = lazy(() => import("./Enterprisemenu"));
interface NavBarProps {
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
  
const NavBar: React.FC<NavBarProps> = ({ session, closeMenu, isActiveLink, handleLogout, toggleHelp, toggleDropdown, helpRef, helpOpen, toggleCreateAccount }) => {
  return (
    <nav className="md:flex md:items-center w-full md:w-auto ml-auto flex-row-reverse">
      <ul className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 mt-4 md:mt-0 text-center md:text-left border-b border-gray-300 py-2 md:border-b-0">
        {!session ? (
          <Suspense fallback={<div>Loading...</div>}>
            <FreeMenu session={session} closeMenu={closeMenu} isActiveLink={isActiveLink} handleLogout={handleLogout} toggleHelp={toggleHelp} toggleDropdown={toggleDropdown} toggleCreateAccount={toggleCreateAccount} helpRef={helpRef} helpOpen={helpOpen} />
          </Suspense>
        ) : session?.user?.type === "coach" ? (
          <Suspense fallback={<div>Loading...</div>}>
            <CoachMenu session={session} closeMenu={closeMenu} isActiveLink={isActiveLink} handleLogout={handleLogout} toggleHelp={toggleHelp} toggleDropdown={toggleDropdown} toggleCreateAccount={toggleCreateAccount} helpRef={helpRef} helpOpen={helpOpen} />
          </Suspense>
        ) : session?.user?.type === "player" ? (
          <Suspense fallback={<div>Loading...</div>}>
            <PlayerMenu session={session} closeMenu={closeMenu} isActiveLink={isActiveLink} handleLogout={handleLogout} toggleHelp={toggleHelp} toggleDropdown={toggleDropdown} toggleCreateAccount={toggleCreateAccount} helpRef={helpRef} helpOpen={helpOpen} />
          </Suspense>
        ) : session?.user?.type === "enterprise" ? (
          <Suspense fallback={<div>Loading...</div>}>
            <EnterpriseMenu session={session} closeMenu={closeMenu} isActiveLink={isActiveLink} handleLogout={handleLogout} toggleHelp={toggleHelp} toggleDropdown={toggleDropdown} toggleCreateAccount={toggleCreateAccount} helpRef={helpRef} helpOpen={helpOpen} />
          </Suspense>
        ) : session?.user?.type === "team" ? (
          <Suspense fallback={<div>Loading...</div>}>
            <TeamMenu session={session} closeMenu={closeMenu} isActiveLink={isActiveLink} handleLogout={handleLogout} toggleHelp={toggleHelp} toggleDropdown={toggleDropdown} toggleCreateAccount={toggleCreateAccount} helpRef={helpRef} helpOpen={helpOpen} />
          </Suspense>
        ) : (
          <></>
        )}
        <li className="relative" ref={helpRef}>
          <button onClick={toggleHelp} className="ml-4">
            <MdHelpOutline className="text-black w-8 h-8" />
          </button>
          {helpOpen && (
         <div className="absolute left-1/2 transform -translate-x-1/2 md:left-0 md:right-2 md:top-5 mt-2 w-56 bg-white shadow-lg rounded-md p-4">
         <p>For technical difficulties and other feedback, email us at </p>
         <a className="font-bold" href="mailto:support@d1notes.com">
           support@d1notes.com
         </a>
         <button onClick={toggleHelp} className="text-blue-500 mt-2">
           Close
         </button>
       </div>
        
        
          
          )}
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
