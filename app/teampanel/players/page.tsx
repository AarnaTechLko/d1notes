"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/teams/Sidebar';
import PlayerForm from '@/app/components/coach/PlayerForm';
import { showError, showSuccess } from '@/app/components/Toastr';
import { FaArchive, FaKey, FaSpinner, FaTrash } from 'react-icons/fa';
import defaultImage from '../../public/default.jpg';
import ResetPassword from '@/app/components/ResetPassword';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
import  { useRef } from "react";
// Define the type for the coach data
interface Coach {
  id: number;
  image: string;
  first_name: string;
  last_name: string;
  email: string;
  number: string;
  countrycode: string;
  gender: string;
  sport: string;
  expectedCharge: string;
  status: string;
  position: string;
  team: string;
  slug: string;
  totalEvaluations: string;
}

const Home: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [teamId, setTeamId] = useState<string>('');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showLicenseNoModal, setShowLicenseNoModal] = useState<boolean>(false);
  const [licenseKey, setLicenseKey] = useState<string>('');
  const limit = 10; // Items per page
  const [loadingKey, setLoadingKey] = useState<boolean>(false);
  const { data: session } = useSession();
  const [coachId, setCoachId] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const [isMiddle, setIsMiddle] = useState(false);
    const [IsStart, setIsStart] = useState(false);
    const [isEnd, setIsEnd] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null); // ✅ Correct usage of useRef
    
      // Scroll handlers
      const scrollLeft = () => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollLeft -= 200; // Adjust as needed
        }
      };
    
      const scrollRight = () => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollLeft += 200;
        }
      };
      
      useEffect(() => {
        const handleScroll = () => {
          if (tableContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
            const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    
            
            setIsStart(scrollLeft === 0);
          setIsEnd(scrollLeft + clientWidth >= scrollWidth);
          setIsMiddle(scrollPercentage >= 40);
    
          }
        };
    
        const container = tableContainerRef.current;
        if (container) {
          container.addEventListener("scroll", handleScroll);
        }
    
        return () => {
          if (container) {
            container.removeEventListener("scroll", handleScroll);
          }
        };
      }, []); // Empty dependency array means it runs only once after mount
  const handlePasswordChangeSuccess = () => {
    console.log('Password changed successfully!');
  };
  const fetchCoaches = async (page = 1, searchQuery = '') => {
    setLoading(true);

    try {
      const session = await getSession();
      const teamId = session?.user?.id;

      if (!teamId) {
        console.error('Enterprise ID not found in session');
        return;
      }

      const response = await fetch(
        `/api/teampanel/player/signup?team_id=${teamId}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,

      );

      if (!response.ok) {
        console.error('Failed to fetch coaches');
        return;
      }

      const data = await response.json();
      setCoaches(data.players);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePopup = () => {
    Swal.fire({
      title: "No Evaluations Completed Yet...",
      text: "",
      icon: "info", // Can be 'success', 'error', 'warning', 'info', 'question'
      confirmButtonText: "OK",
    });

  }

  const handleLicenseKeySubmit = async () => {
    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId || !selectedCoach) {
        console.error('Missing required data');
        return;
      }

      const response = await fetch('/api/enterprise/player/updatestatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: selectedCoach.id,
          licenseKey: licenseKey,


        }),
      });

      if (response.ok) {
        showSuccess('License assigned successfully');
        fetchCoaches(currentPage, search);
        setShowLicenseNoModal(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to Change Status';
        showError(errorMessage);
        setShowLicenseNoModal(true);
      }
    } catch (error) {
      console.error('Error assigning license:', error);
    } finally {

      setLicenseKey('');
    }
  };
  useEffect(() => {
    if (session) {
      setTeamId(session?.user.id)
    }

    fetchCoaches(currentPage, search);
  }, [currentPage, search, session]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddCoachClick = () => {
    setShowModal(true); // Open the modal
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };
  const handleEnterLicense = (coach: Coach) => {
    handleLoadLicense();
    setSelectedCoach(coach);
    setShowLicenseNoModal(true);
  };
  const handleSubmitCoachForm = async (formData: any) => {
    try {
      const response = await fetch('/api/teampanel/player/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      fetchCoaches(currentPage, search);
      if (response.ok) {

        fetchCoaches(currentPage, search);  // Refresh data table
      } else {
        console.error('Failed to add Player');
      }
    } catch (error) {
      console.error('Error adding Player:', error);
    } finally {
      setShowModal(false);
    }
  };
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will archive this player!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, archive it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/player/archived`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id,
              type: 'player'
            }),
          });
          if (response.ok) {
            fetchCoaches();
            Swal.fire("Archived!", "Player archived successfully!", "success");
          } else {
            Swal.fire("Failed!", "Failed to archive Player", "error");
          }
        } catch (error) {
          Swal.fire("Error!", "An error occurred while archiving the player", "error");
        }
      }
    });
  };
  const handleLoadLicense = async () => {

    try {
      setLoadingKey(true);
      const userId = session?.user.id;
      const response = await fetch("/api/fetchlicense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          type: "Enterprise",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch license");
      }
      setLoadingKey(false);
      const data = await response.json();
      setLicenseKey(data.licenseKey);

    } catch (error) {
      console.error("Error fetching license:", error);
      alert("Failed to assign license");
    }
  };
  const handleResetPassword = (coach: Coach) => {
    console.log(coach);
    setCoachId(coach.id);
    setIsModalOpen(true)
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ResetPassword isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePasswordChangeSuccess}
        type="player"
        userId={coachId} />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <h1 className="text-2xl font-bold mb-4">Your Players</h1>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={handleSearchChange}
            />
            <div className="flex space-x-4">
              {/* <button
        onClick={handleAddCoachClick}
        className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-700 rounded-lg"
      >
        Add Player
      </button> */}
                {/*<a
      href={`/teampanel/massupload`}
        className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-700 rounded-lg"
      >
      Mass Upload
      </a>*/}

              <a
                href={`/teampanel/addplayers/${teamId}`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 h-full"
              >
                 Add Player Manually
              </a>
              <a
                href={`/teampanel/addplayers/${teamId}`}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 h-full"
              >
                Mass Player Uplaod
              </a>
            </div>
          </div>
          <div ref={tableContainerRef} className="overflow-x-auto max-h-[400px] overflow-y-auto">
 <button
  onClick={scrollLeft}
  className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
    IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
  }`}
>
  <FaArrowLeft />
</button>

          <table className="w-full text-sm text-left text-gray-700 mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Sport</th>
                <th>Team</th>
                <th>Position(s)</th>
                <th>Evaluations</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            {loading ? (
              <tbody>
                <tr>
                  <th colSpan={10}>Loading....</th>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {coaches.length > 0 ? (
                  coaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className='text-center'>
                        <a href={`/players/${coach.slug}`} target='_blank'>
                          {coach.image === null || coach.image === '' ? (
                            <img
                              src={defaultImage.src}
                              className="rounded-full w-16 h-16 object-cover m-auto"
                              alt={`${coach.first_name} ${coach.last_name}`}
                            />
                          ) : (
                            <img
                              src={coach.image} // Use defaultImage if coach.image is null or empty
                              className="rounded-full w-16 h-16 object-cover m-auto"
                              alt={`${coach.first_name} ${coach.last_name}`}
                            />)}
                          {coach.first_name} {coach.last_name}</a></td>
                      <td>{coach.gender}</td>
                      <td>{coach.email}</td>
                      <td>{coach.countrycode}{coach.number}</td>
                      <td>{coach.sport}</td>
                      <td>{coach.team}</td>
                      <td>{coach.position}</td>
                      <td align='center'>
                        {Number(coach.totalEvaluations) >= 1 && (<a
                          href={`/players/history/${coach.slug}`}
                          title='History'
                          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
                          target="_blank"
                        >
                          View {/* {coach.totalEvaluations} */}
                        </a>
                        )}
                        {Number(coach.totalEvaluations) == 0 && (<button

                          title='History'
                          className='bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
                          onClick={handlePopup}
                        >
                          View {/* {coach.totalEvaluations} */}
                        </button>
                        )}
                      </td>
                      <td>
                        
                        
                        {coach.status === 'Pending' ? (
                        <div className='bg-red px-4 py-2 rounded text-black-500 '>
                          {coach.status}
                        </div>
                      ) : (
                        <div className='bg-red px-4 py-2 rounded bg-white-500 text-black'>
                          {coach.status}
                        </div>
                      )}
                      
                      
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          {/* <button
                  onClick={() => handleResetPassword(coach)}
                  title='Reset Password'
                  className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                >
                 <FaKey/>
                </button> */}
                          <button
                            onClick={() => handleDelete(coach.id)} // Pass the banner ID to the delete handler
                            className=" text-red-500 hover:text-red-700"
                            aria-label="Archive Player"
                            title="Archive Player"
                          >
                            <FaArchive size={24} />
                          </button>
                        </div>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>No Players added yet...</td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
          <button
            onClick={scrollRight}
            disabled={isEnd} 
            style={{
              backgroundColor: isEnd ? "grey" : isMiddle ? "#22c55e" : "#22c55e", // Tailwind green-500 and blue-500
              color: "white",
              padding: "10px",
              border: "none",
              cursor: isEnd ? "not-allowed" : "pointer",
            }}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md z-10 lg:hidden
            `}
          >
            <FaArrowRight />
          </button>
          
                      </div>

          {totalPages >= 1 && (

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm ${currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-500'
                  }`}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm ${currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-blue-500 '
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
        {showLicenseNoModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">Enter License Key</h2>
              <input
                type="text"
                className="w-full p-2 border rounded-lg mb-4"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter License Key"
              />
              {loadingKey ? (
                <>
                  <p><FaSpinner className="animate-spin mr-2" /> Finding Key...</p>
                </>
              ) : (
                <>

                </>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLicenseNoModal(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLicenseKeySubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-11/12 max-h-[100vh] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                <h2 className="text-2xl font-semibold text-gray-800">Add Player</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xl text-gray-600 hover:text-gray-900"
                >
                  &times;
                </button>
              </div>
              <div className="pt-16 pb-4 overflow-y-auto max-h-[70vh]">
                <PlayerForm onSubmit={handleSubmitCoachForm} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
