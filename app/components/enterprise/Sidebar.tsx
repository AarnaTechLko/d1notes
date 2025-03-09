import React, { useEffect, useState } from 'react';
import { FaPen, FaClipboardList, FaCog, FaSignOutAlt, FaDashcube, FaDollarSign, FaBars, FaFacebookMessenger, FaCompressAlt, FaUserPlus, FaUser, FaEnvelope, FaAssistiveListeningSystems, FaArchive } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useSession, signOut, getSession } from 'next-auth/react';
import CertificateIcon from '@mui/icons-material/WorkspacePremium';
import { useRouter } from 'next/navigation';
import LogoutLoader from '../LoggingOut';
import Swal from 'sweetalert2';
const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEvaluationListOpen, setIsEvaluationListOpen] = useState(false);
  const [isArchiveListOpen, setIsArchiveListOpen] = useState(false);
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
  
  const toggleArchiveList = () => {
    setIsArchiveListOpen((prev) => !prev);
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
        const data = JSON.parse(dataResponse);

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



  const handleDeleteAccount = async () => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
  
    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch("/api/delete-account", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type:session?.user.type,
            userId: session?.user.id,
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          await Swal.fire("Deleted!", "Your account has been deleted.", "success");
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
        } else {
          Swal.fire("Error!", data.message || "Failed to delete account", "error");
        }
      } catch (error) {
        console.error("Error deleting account:", error);
        Swal.fire("Error!", "Something went wrong. Please try again.", "error");
      }
    }
  };
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
        >
           {session?.user && (
          <div className="flex flex-col items-center p-4 border-b border-gray-700">
            <img
              src={session.user.image || '/default.jpg'} // Fallback to default avatar
              alt="Coach Avatar"
              className="w-16 h-16 rounded-full mb-2"
            />
            <h2 className="text-lg font-semibold">{session.user.name || ''}</h2>
            <h3>(Organization)</h3>
          
          </div>
        )}
          <nav className="flex-grow mt-3">
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


              <li className="hover:bg-gray-700 rounded transition duration-200">
                <a href="/enterprise/joinrequests" className="flex items-center space-x-2 p-2">
                  <CertificateIcon className='text-xl' />

                  <span>Invitation Log</span>
                </a>
              </li>
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
    (session?.user.buy_evaluation == null && session?.user.view_evaluation == null) && (
              <li className="hover:bg-gray-700 rounded transition duration-200">
                <a href="/enterprise/doc" className="flex items-center space-x-2 p-2">
                  <FaUserPlus className='text-xl' />

                  <span>Sub Administrators</span>
                </a>
              </li>
)}

              <li className="hover:bg-gray-700 rounded transition duration-200">
                <a
                  href="#tab1"
                  className="flex items-center space-x-2 p-2"
                  onClick={toggleArchiveList}
                >
                  <FaArchive className="text-xl" />
                  <span>Archives</span>
                </a>
                {isArchiveListOpen && (
                  <ul className="ml-4 mt-1 space-y-1">
                  <li className="hover:bg-gray-600 rounded transition duration-200">
                    <a href="/enterprise/teamsarchived" className="flex items-center space-x-2 p-2">
                      <span>Teams</span>
                    </a>
                  </li>
                  <li className="hover:bg-gray-600 rounded transition duration-200">
                    <a href="/enterprise/players/archived" className="flex items-center space-x-2 p-2">
                      <span>Players</span>
                    </a>
                  </li>
                  <li className="hover:bg-gray-600 rounded transition duration-200">
                  <a href="/enterprise/coaches/archived" className="flex items-center space-x-2 p-2">
                      <span>Coaches</span>
                    </a>
                  </li>
                </ul>
                )}
              </li>


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
                      <a onClick={handleLogout} className="flex items-center space-x-2 p-2 cursor-pointer">
                        <span>Log Out</span>
                      </a>
                    </li>
                    <li className="hover:bg-gray-600 rounded transition duration-200 ">
                    <a  onClick={handleDeleteAccount} className="flex text-sm text-red-300 mt-10 items-center space-x-2 p-2 cursor-pointer">
                      <span>Delete Account</span>
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
