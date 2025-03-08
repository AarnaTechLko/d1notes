"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../../components/enterprise/Sidebar';
import CoachForm from '@/app/components/enterprise/CoachForm';
import { showError, showSuccess } from '@/app/components/Toastr';
import { FaArchive, FaEye, FaHistory, FaKey, FaShare, FaSpinner, FaUndo, FaUsers } from 'react-icons/fa';
import ResetPassword from '@/app/components/ResetPassword';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

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
type Team = {
    id?: number;
    team_name?: string;
    status?: string | undefined;
    description?: string;
    logo?: string;
    created_by?: string;
    creator_id?: number;
    team_type?: string;
    team_year?: string;
    slug?: string;
    cover_image?: string;
    firstName?: string;
    age_group?: string;
    lastName?: string;
    coachSlug?: string;
    totalPlayers?: number;
    totalCoaches?: number;
    playerIds?: number[];
};
const Home: React.FC = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [isMiddle, setIsMiddle] = useState(false);
        const [IsStart, setIsStart] = useState(false);
        const [isEnd, setIsEnd] = useState(false);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [coachId, setCoachId] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [beingRestored, setBeingRestored] = useState<boolean>(false);
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
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<{ firstName?: string, id?: number }>({});
    const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
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

    const { data: session } = useSession();


    const fetchTeams = async () => {
        if (!session || !session.user?.id) {
            console.error("No user logged in");
            return;
        }

        try {
            setLoadingData(true);
            const res = await fetch(`/api/teams?enterprise_id=${session.user.id}`);
            if (!res.ok) throw new Error("Failed to fetch teams");
            const { data, teamplayersList }: { data: Team[]; teamplayersList: any[] } = await res.json();
            setTeams(data);
            const updatedTeams = data.map((team) => ({
                ...team,
                playerIds: teamplayersList
                    .filter((player) => player.teamId === team.id)
                    .map((player) => player.playerId),
            }));
            setLoadingData(false);
            setTeams(updatedTeams);
        } catch (error) {
            console.error("Error fetching teams:", error);
        }
    };


    const fetchCoaches = async (page = 1, searchQuery = '') => {
        setLoading(true);

        try {
            const session = await getSession();
            const enterpriseId = session?.user?.id;

            if (!enterpriseId) {
                console.error('Enterprise ID not found in session');
                return;
            }

            const response = await fetch(
                `/api/enterprise/coach/archived?enterprise_id=${enterpriseId}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,
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
        fetchCoaches(currentPage, search);
        fetchTeams();
    }, [currentPage, search, session]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
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



    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will delete this coach!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: 'Cancel',
        });
    
        // If Cancel is clicked, exit early and do nothing
        if (!result.isConfirmed) {
            return;
        }
    
        try {
            const response = await fetch(`/api/enterprise/coach/archived`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id, // Send only the id
                }),
            });
            const responseData = await response.json();
    
            if (response.ok) {
                fetchCoaches();
                Swal.fire("Deleted!", "Coach deleted successfully!", "success");
            } else {
                Swal.fire("Failed!", responseData.message || "Failed to delete Coach", "error");
            }
        } catch (error) {
            Swal.fire("Error!", "An error occurred while deleting the coach", "error");
        }
    };
    
    const handleRestore = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will restore this Coach!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#28a745",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, restore it!",
            cancelButtonText: 'Cancel',
        });
    
        // If Cancel is clicked, exit early and do nothing
        if (!result.isConfirmed) {
            return;
        }
    
        try {
            console.log("Sending Request with:", { id }); // Debug log
    
            const response = await fetch(`/api/enterprise/coach/archived`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }), // Send only the id for restore
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
                    <h1 className="text-2xl font-bold mb-4">Your Archived Coaches</h1>
                    <div className="flex justify-between items-center">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={search}
                            onChange={handleSearchChange}
                        />
                        {/* <div className="flex space-x-4">
                          
                            <a
                                href={`/enterprise/invitations/0?mass=0`}
                                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-700 rounded-lg"
                            >
                                Manual Invitation
                            </a>
                            <a
                                href={`/enterprise/invitations/0?mass=1`}
                                className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-700 rounded-lg"
                            >
                                Mass Invitation
                            </a>
                           
                        </div> */}
                    </div>

                    <div ref={tableContainerRef}  className="overflow-x-auto">
                        
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
                                    {/* <th>Sport</th> */}
                                    {/* <th>Available License</th>
        <th>Used License</th> */}
                                    {/* <th>Evaluations Completed</th> */}
                                    <th>Status</th>
                                    <th style={{ width: 225 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coaches.length > 0 ? (
                                    coaches.map((coach) => (
                                        <tr key={coach.id}>
                                            <td className="text-center">
                                                <a
                                                    href={`/coach/${coach.slug}`}
                                                    title='View Bio'
                                                    className="px-4 py-2"
                                                    target="_blank"
                                                >
                                                    <img src={coach.image === 'null' || !coach.image ? '/default.jpg' : coach.image} className="rounded-full w-16 h-16 object-cover m-auto" />
                                                    {coach.firstName} {coach.lastName}

                                                </a>
                                            </td>
                                            <td>{coach.gender}</td>
                                            <td>{coach.email}</td>
                                            <td>{coach.countrycode}{coach.phoneNumber}</td>
                                            {/* <td>{coach.sport}</td> */}
                                            {/* <td>{coach.assignedLicenseCount}</td>
            <td>{coach.consumeLicenseCount}</td> */}
                                            {/* <td align='center'>
                                                {Number(coach.totalEvaluations) >= 1 && (<a
                                                    href={`/coach/history/${coach.slug}`}
                                                    title='History'
                                                    className=' text-blue-500'
                                                    target="_blank"
                                                >
                                                    View 
                                                </a>
                                                )}
                                                {Number(coach.totalEvaluations) == 0 && (<button

                                                    title='History'
                                                    className=' text-blue-500'
                                                    onClick={handlePopup}
                                                >
                                                    View 
                                                </button>
                                                )}
                                            </td> */}
                                            <td>
                                                {coach.status === 'Pending' ? (
                                                    <span
                                                        className=" text-black-500"
                                                        
                                                    >
                                                        {coach.status}
                                                    </span>
                                                ) : (
                                                    <span className="text-black-500 ">
                                                        {coach.status}
                                                    </span>
                                                )}

                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center space-x-2">
                                                    {/* Add Back Button */}
                                                    {/* <p className="mt-2">Team ID: {team.id}</p> */}
                                                    <button
                                                        onClick={() => handleRestore(coach.id)} // Restore functionality
                                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                                                        aria-label="Restore Player"
                                                    >
                                                        Restore
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
                                        <td colSpan={8}>No Coaches found yet...</td>
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


                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            {currentPage > 1 && (
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="px-4 py-2 text-sm text-blue-500"
                                >
                                    Previous
                                </button>
                            )}
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            {currentPage < totalPages && (
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="px-4 py-2 text-sm text-blue-500"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    )}
                </div>


            </main>
        </div>
    );
};

export default Home;
