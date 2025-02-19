import React, { useEffect, useState } from 'react';
import { FaPen, FaClipboardList, FaCog, FaSignOutAlt, FaDashcube, FaDollarSign, FaBars, FaFacebookMessenger, FaCompressAlt, FaUserPlus, FaUser, FaEnvelope, FaAssistiveListeningSystems } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useSession, signOut, getSession } from 'next-auth/react';
import CertificateIcon from '@mui/icons-material/WorkspacePremium';
import { useRouter } from 'next/navigation';
import LogoutLoader from '../LoggingOut';
const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEvaluationListOpen, setIsEvaluationListOpen] = useState(false);
  const [isDocListOpen, setIsDocListOpen] = useState(false);
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [permissions, setPermissions] = useState<string>('');
  const [hasJoinRequest, setHasJoinRequest] = useState<boolean>(false);
  const [hasLicenses, setHasLicenses] = useState<boolean>(false);
  const [hasTeams, setHasTeams] = useState<boolean>(false);
  const [hasCoaches, setHasCoaches] = useState<boolean>(false);
  const [hasPlayers, setHasPlayers] = useState<boolean>(false);
  const [hasOrderHistory, setHasOrderHistory] = useState<boolean>(false);
  const [hasPurchaseHistory, setHasPurchaseHistory] = useState<boolean>(false);
  const [hasDoc, setHasDoc] = useState<boolean>(false);
  const [hasRoles, setHasRoles] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const toggleEvaluationList = () => {
    setIsEvaluationListOpen((prev) => !prev);
  };
  const toggleDocList = () => {
    setIsDocListOpen((prev) => !prev); // Toggle DOC submenu
  };
  const handleLogout = async () => {
    setIsLoggingOut(true);
  
    try {
      const result = await signOut({
        redirect: false, 
        callbackUrl: "/login",
      });
  
      setTimeout(() => {
        if (result.url) {
          router.push(result.url); // Use Next.js router for redirection
        }
      }, 2000);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const fetchPermissions = async () => {
    setLoading(true);
    if (session?.user?.added_by) {
      try {
        const session = await getSession();
        const enterprise_id = session?.user?.added_by;

        if (!enterprise_id) {
          console.error('Enterprise ID not found in session');
          return;
        }

        const response = await fetch(
          `/api/enterprise/permissions?enterprise_id=${enterprise_id}`,

        );

        if (!response.ok) {
          console.error('Failed to fetch coaches');
          return;
        }
      

        const dataResponse = await response.json();
        const data  = JSON.parse(dataResponse);
        
        const hasJoinRequest = "Join Request" in data;
        
        setHasJoinRequest(hasJoinRequest);
        const hasLicenses = "Licenses" in data;
        setHasLicenses(hasLicenses);
        const hasTeams = "Teams" in data;
        setHasTeams(hasTeams);
        const hasCoaches = "Coaches" in data;
        setHasCoaches(hasCoaches);
        const hasPlayers = "Players" in data;
        setHasPlayers(hasPlayers);
        const hasOrderHistory = "Order- History" in data;
        setHasOrderHistory(hasOrderHistory);
        const hasPurchaseHistory = "Purchase Licenses" in data;
        setHasPurchaseHistory(hasPurchaseHistory);
        const hasDoc = "Doc" in data;
        setHasDoc(hasDoc);
        const hasRoles = "Roles" in data;
        setHasRoles(hasRoles);


      } catch (error) {
        console.error('Error fetching coaches:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPermissions();

  }, [session]);

  return (
    <>{isLoggingOut && <LogoutLoader />}
    <div>

      <button
        className="md:hidden text-white bg-gray-800 p-2 mt-1 focus:outline-none absolute top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <FaBars className="text-2xl" />
      </button>
      {/* {JSON.stringify(session, null, 2)} */}

      <aside
        className={`mt-0.5 fixed top-0 left-0 h-full bg-gray-800 text-white w-64 transform ${isSidebarOpen ? 'translate-x-0 z-40' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col md:z-auto`}
      >{permissions}
        <nav className="flex-grow mt-10">
          <ul className="space-y-2 p-4">
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/dashboard" className="flex items-center space-x-2 p-2">
                <MdDashboard className="text-xl" />
                <span>Dashboard</span>
              </a>
            </li>
            {/* {
    (session?.user.added_by === null || (session?.user.added_by && hasPurchaseHistory)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/upgrade" className="flex items-center space-x-2 p-2">

                <FaDollarSign className='text-xl' />
                <span>Purchase Evaluations</span>
              </a>
            </li>

            
    )}
   */}
    {
    (session?.user.added_by === null || (session?.user.added_by && hasTeams)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/teams" className="flex items-center space-x-2 p-2">

                <FaCompressAlt className='text-xl' />
                <span>Your Teams</span>
              </a>
            </li>
    )}
    {
    (session?.user.added_by === null || (session?.user.added_by && hasCoaches)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/coaches" className="flex items-center space-x-2 p-2">

                <FaCompressAlt className='text-xl' />
                <span>Your Coaches</span>
              </a>
            </li>
    )}
            {
    (session?.user.added_by === null || (session?.user.added_by && hasPlayers)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/players" className="flex items-center space-x-2 p-2">

                <FaCompressAlt className='text-xl' />
                <span>Your Players</span>
              </a>
            </li>
              )
}
{/* {
    (session?.user.added_by === null || (session?.user.added_by && hasOrderHistory)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/orderhistory" className="flex items-center space-x-2 p-2">

                <FaDollarSign className='text-xl' />
                <span>Order History</span>
              </a>
            </li>
    )} */}
    {/* {
    (session?.user.added_by === null || (session?.user.added_by && hasLicenses)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/licenses" className="flex items-center space-x-2 p-2">
                <CertificateIcon className='text-xl' />

                <span>Licences</span>
              </a>
            </li>
    )} */}

 
            {/* <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/joinrequests" className="flex items-center space-x-2 p-2">
                <CertificateIcon className='text-xl' />

                <span>Join Invitations</span>
              </a>
            </li> */}
{/* {
    (session?.user.added_by === null || (session?.user.added_by && hasPurchaseHistory)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <a href="/enterprise/messages" className="flex items-center space-x-2 p-2">

                <FaEnvelope className='text-xl' />
                <span>Messages</span>
              </a>
            </li>

            
    )} */}


{
    (session?.user.added_by === null || (session?.user.added_by && hasDoc)) && (
            <li className="hover:bg-gray-700 rounded transition duration-200">
              <button onClick={toggleDocList} className="flex items-center space-x-2 p-2 w-full text-left">
                <FaUser className='text-xl' />
                <span>Sub Admin</span>
              </button>
              {/* Submenu for DOC */}
              {isDocListOpen && (
                <ul className="pl-8 space-y-2">
                  <li className="hover:bg-gray-700 rounded transition duration-200">
                    <a href="/enterprise/doc" className="flex items-center space-x-2 p-2">
                      <FaUserPlus className="text-lg" />
                      <span>Add Sub Admin</span>
                    </a>
                  </li>
                  {/* <li className="hover:bg-gray-700 rounded transition duration-200">
                    <a href="/enterprise/roles" className="flex items-center space-x-2 p-2">
                      <FaClipboardList className="text-lg" />
                      <span>Roles</span>
                    </a>
                  </li> */}
                  {/* Add more DOC submenu items as needed */}
                </ul>
              )}
            </li>
    )}
<li className="hover:bg-gray-700 rounded transition duration-200">
              <a
                href="#tab1"
                className="flex items-center space-x-2 p-2"
                onClick={toggleEvaluationList}
              >
                <FaClipboardList className="text-xl" />
                <span>Settings</span>
              </a>
              {isEvaluationListOpen && (
                <ul className="ml-4 mt-1 space-y-1">
                  <li className="hover:bg-gray-600 rounded transition duration-200">
                    <a href="/enterprise/profile" className="flex items-center space-x-2 p-2">
                      <span>Profile</span>
                    </a>
                  </li> 
                  <li className="hover:bg-gray-600 rounded transition duration-200">
                    <a href="/enterprise/changepassword" className="flex items-center space-x-2 p-2">
                      <span>Change Password</span>
                    </a>
                  </li>
                  <li className="hover:bg-gray-600 rounded transition duration-200">
                    <a  onClick={handleLogout} className="flex items-center space-x-2 p-2 cursor-pointer">
                      <span>Sign Out</span>
                    </a>
                  </li>
                </ul>
              )}
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
    </>
  );
};

export default Sidebar;
