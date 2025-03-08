"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/teams/Sidebar';
import CoachForm from '@/app/components/enterprise/CoachForm';
import { showError, showSuccess } from '@/app/components/Toastr';
import { FaArchive, FaEye, FaHistory, FaKey, FaShare, FaSpinner } from 'react-icons/fa';
import ResetPassword from '@/app/components/ResetPassword';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import  { useRef } from "react";

// Define the type for the coach data
interface Coach {
  id: number;
  image: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countrycode: string;
  gender: string;
  sport: string;
  expectedCharge: string;
  slug: string;
  qualifications: string;
  status: string;
  assignedLicenseCount: string;
  consumeLicenseCount: string;
  earnings: string;
  totalEvaluations: string;
}

const Home: React.FC = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [search, setSearch] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [coachId, setCoachId] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loadingKey, setLoadingKey] = useState<boolean>(false);
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [assignLicenseLoader, setAssignLicenseLoader] = useState<boolean>(false);
  const [showLicenseNoModal, setShowLicenseNoModal] = useState<boolean>(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [licenseKey, setLicenseKey] = useState<string>('');
  const [totalLicenses, setTotalLicenses] = useState<number>(0);
  const limit = 10; // Items per page
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handlePasswordChangeSuccess = () => {
    console.log('Password changed successfully!');
  };

  const { data: session } = useSession();

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
        `/api/teampanel/coach/archived?team_id=${teamId}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
      );

      if (!response.ok) {
        console.error('Failed to fetch coaches');
        return;
      }

      const data = await response.json();
      setCoaches(data.coaches);
      setTotalLicenses(data.totalLicensesCount[0].count)
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
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will deleted this Coache!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`/api/teampanel/restore`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              coachId: id,
            }),
          });
          if (response.ok) {
            fetchCoaches();
            Swal.fire("Archive!", "Coache Deleted successfully!", "success");
          } else {
            Swal.fire("Failed!", "Failed to archive Coache", "error");
          }
        } catch (error) {
          Swal.fire("Error!", "An error occurred while archiving the Coache", "error");
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

  const handleSubmitCoachForm = async (formData: any) => {
    try {
      const response = await fetch('/api/enterprise/coach/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      fetchCoaches(currentPage, search);
      if (response.ok) {
        console.log('Coach added successfully');
        fetchCoaches();  /// Refresh data table

      } else {
        console.error('Failed to add coach');
      }
    } catch (error) {
      console.error('Error adding coach:', error);
    } finally {
      setShowModal(false);
    }
  };

  const handleAssignLicense = (coach: Coach) => {
    setSelectedCoach(coach);
    setShowLicenseModal(true);
  };

  const handleEnterLicense = (coach: Coach) => {
    handleLoadLicense();
    setSelectedCoach(coach);
    setShowLicenseNoModal(true);
  };

  const handleLicenseSubmit = async () => {
    setAssignLicenseLoader(true);
    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId || !selectedCoach) {
        console.error('Missing required data');
        return;
      }
      if (licenseCount > totalLicenses) {
        showError('License Qualtity can not be greater than available license.');
        setAssignLicenseLoader(false);
        return;
      }
      if (licenseCount === 0) {
        showError('Enter number of licenses.');
        setAssignLicenseLoader(false);
        return;
      }
      const response = await fetch('/api/enterprise/coach/assignLicense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coach_id: selectedCoach.id,
          enterprise_id: enterpriseId,
          licenseCount: licenseCount,
        }),
      });

      if (response.ok) {
        showSuccess('License shared successfully');
        setAssignLicenseLoader(false);
        fetchCoaches();
        setShowLicenseModal(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Failed to share license';
        setAssignLicenseLoader(false);
        showError(errorMessage);
        setShowLicenseModal(true);
      }
    } catch (error) {
      console.error('Error sharing license:', error);
      setAssignLicenseLoader(false);
    } finally {
      setAssignLicenseLoader(false);
      setLicenseCount(0);
    }
  };

  const handleResetPassword = (coach: Coach) => {
    console.log(coach);
    setCoachId(coach.id);
    setIsModalOpen(true)
  }
  

  const handlecocheRestore = async (id: number) => {
    Swal.fire({
        title: "Are you sure?",
        text: "This action will restore this coach!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, restore it!",
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                console.log("Sending Request with:", { coachId: id }); // Debug log

                const response = await fetch(`/api/teampanel/restore`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ coachId: id }),
                });

                const responseData = await response.json();
                console.log("Response Data:", responseData); // Debug log

                if (response.ok) {
                    fetchCoaches();
                    Swal.fire("Restored!", "Coach restored successfully!", "success");
                } else {
                    Swal.fire("Failed!", responseData.message || "Failed to restore Coach", "error");
                }
            } catch (error) {
                Swal.fire("Error!", "An error occurred while restoring the Coach", "error");
            }
        }
    });
};



  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ResetPassword isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePasswordChangeSuccess}
        type="coach"
        userId={coachId} />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <h1 className="text-2xl font-bold mb-4">Archived Coaches</h1>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search..."
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={handleSearchChange}
            />
            
          </div>

          {/* <div className="overflow-x-auto"> */}
            <div ref={tableContainerRef} className="overflow-x-auto">
                        <button
                          onClick={scrollLeft}
                          className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
                            IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
                          }`}
                        >
                          <FaArrowLeft />
                        </button>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Sport</th>
                  <th>Status</th>
                  <th style={{ width: 225 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {coaches.length > 0 ? (
                  coaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className="text-center">
                        <a href={`/coach/${coach.slug}`} target='_blank'>
                          <img src={coach.image === 'null' || !coach.image ? '/default.jpg' : coach.image} className="rounded-full w-16 h-16 object-cover m-auto" />
                          {coach.firstName} {coach.lastName}
                        </a>
                      </td>
                      <td>{coach.gender}</td>
                      <td>{coach.email}</td>
                      <td>{coach.countrycode}{coach.phoneNumber}</td>
                      <td>{coach.sport}</td>

                      
                      <td>
                        {coach.status === 'Inactive' ? (
                          <span
                            className=" px-1 py-2 text-xs rounded  text-black"
                            onClick={() => handleEnterLicense(coach)}
                          >
                            {coach.status}
                          </span>
                        ) : (
                          <span className=" px-2 text-xs py-2 rounded text-black">
                            {coach.status}
                          </span>
                        )}

                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                         
                          {/* Add Back Button */}
                          <button
                            onClick={() => handlecocheRestore(coach.id)} // Restore functionality
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                            aria-label="Restore Player"
                          >
                            Add Back
                          </button>

                          {/* Archive Button */}
                          <button
                            onClick={() => handleDelete(coach.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                            aria-label="Archive Player"
                          > Delete
                          </button>

                          
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10}>No Coaches added yet...</td>
                  </tr>
                )}
              </tbody>
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
                    : 'text-blue-500'
                  }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* License Modal */}
        {showLicenseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">Assign Licenses</h2>
              <div className="mb-2">
                <label>Available License Keys: </label>
                <span className='bg-blue-500 w-16 h-16 rounded-full p-2 text-white'>{totalLicenses}</span>
              </div>
              <div className="mb-2">
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg mb-4"
                  value={licenseCount}
                  onChange={(e) => setLicenseCount(Number(e.target.value))}
                  placeholder="Number of licenses"
                />
              </div>
              <div className="flex">
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLicenseSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  {assignLicenseLoader ? (
                    <>
                      <span className="flex items-center">
                        <FaSpinner className="animate-spin mr-2" /> Sharing...
                      </span>
                    </>
                  ) : (
                    <>
                      Share License
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {showLicenseNoModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">Enter License Key</h2>
              <input
                type="text"
                className="w-full p-2 border rounded-lg mb-4"
                value={licenseKey}
                readOnly
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
                
              </div>
            </div>
          </div>
        )}


        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-11/12 max-h-[100vh] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                <h2 className="text-2xl font-semibold text-gray-800">Add Coach</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xl text-gray-600 hover:text-gray-900"
                >
                  &times;
                </button>
              </div>
              <div className="pt-16 pb-4 overflow-y-auto max-h-[70vh]">
                <CoachForm onSubmit={handleSubmitCoachForm} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
