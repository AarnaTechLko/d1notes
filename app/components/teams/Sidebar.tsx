import React, { useState } from 'react';
import { FaPen, FaClipboardList, FaCog, FaSignOutAlt, FaDashcube, FaDollarSign, FaBars, FaFacebookMessenger, FaCompressAlt } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useSession, signOut } from 'next-auth/react';
import CertificateIcon from '@mui/icons-material/WorkspacePremium';
import Visibility from '../Visibility';
const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEvaluationListOpen, setIsEvaluationListOpen] = useState(false);
  const { data: session } = useSession();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const toggleEvaluationList = () => {
    setIsEvaluationListOpen((prev) => !prev);
  };
  const handleLogout = async () => {
    await signOut(); // Sign out using NextAuth.js
     
    window.location.href = '/login';
  };

  return (
    <div>
      {/* Mobile Menu Toggle Button */}
      <button
        className="md:hidden text-white bg-gray-800 p-2 mt-1 focus:outline-none absolute top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <FaBars className="text-2xl" />
      </button>

      {/* Sidebar */}
      <aside
        className={`mt-0.5 fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform ${
          isSidebarOpen ? 'translate-x-0 z-40' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col md:z-auto`}
      >
         {session?.user && (
          <div className="flex flex-col items-center p-4 border-b border-gray-700">
            <img
              src={session.user.image || '/default.jpg'} // Fallback to default avatar
              alt="Coach Avatar"
              className="w-16 h-16 rounded-full mb-2"
            />
            <h2 className="text-lg font-semibold">{session.user.name || ''}</h2>
            <h3>(Team)</h3>
            <p className="text-sm text-gray-400">{session.user.club_name || ''}</p>
          </div>
        )}
        <nav className="flex-grow mt-10">
        <ul className="space-y-2 p-4">
        <li>
            <Visibility  
          playerId={session?.user.id}
          type="Team"
          visibilitystatus={session?.user?.visibility}
          />
          </li>
          <li className="hover:bg-gray-700 rounded transition duration-200">
            <a href="/teampanel/dashboard" className="flex items-center space-x-2 p-2">
              <MdDashboard className="text-xl" />
              <span>Dashboard</span>
            </a>
          </li>
        
          <li className="hover:bg-gray-700 rounded transition duration-200">
            <a href="/teampanel/joinrequests" className="flex items-center space-x-2 p-2">
            
              <FaCompressAlt className='text-xl'/>
              <span>Join Requests</span>
            </a>
          </li>
          <li className="hover:bg-gray-700 rounded transition duration-200">
            <a href="/teampanel/players" className="flex items-center space-x-2 p-2">
            
              <FaCompressAlt className='text-xl'/>
              <span>Players</span>
            </a>
          </li>
        
           
          <li className="hover:bg-gray-700 rounded transition duration-200">
            <a href="/teampanel/coaches" className="flex items-center space-x-2 p-2">
            
              <FaCompressAlt className='text-xl'/>
              <span>Coaches</span>
            </a>
          </li>
        
        
      
        </ul>
      </nav>
      </aside>

      {/* Overlay for mobile view when the sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Sidebar;
