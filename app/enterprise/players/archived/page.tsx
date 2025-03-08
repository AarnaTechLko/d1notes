"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../../components/enterprise/Sidebar';
import PlayerForm from '@/app/components/coach/PlayerForm';
import { showError, showSuccess } from '@/app/components/Toastr';
import { FaArchive, FaKey, FaSpinner, FaTeamspeak, FaTrash, FaUndo, FaUsers } from 'react-icons/fa';
import defaultImage from '../../../public/default.jpg';
import ResetPassword from '@/app/components/ResetPassword';
import Swal from 'sweetalert2';
import { FaArrowLeft, FaArrowRight, FaEye } from 'react-icons/fa';
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
    const [beingRestored, setBeingRestored] = useState<boolean>(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
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
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<{ first_name?: string, id?: number }>({});
    const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<string>('');
    const [isMiddle, setIsMiddle] = useState(false);
        const [IsStart, setIsStart] = useState(false);
        const [isEnd, setIsEnd] = useState(false);
    const handlePasswordChangeSuccess = () => {
        console.log('Password changed successfully!');
    };

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

    useEffect(() => {
        fetchTeams();

    }, [session]);
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
                `/api/enterprise/player/archived?enterprise_id=${enterpriseId}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`,

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
        fetchCoaches(currentPage, search);
    }, [currentPage, search]);

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
            const response = await fetch('/api/enterprise/player/signup', {
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

    const handleTeamAssign = async (player: any) => {
        console.log("id", player);
        setSelectedPlayer(player);
        // setSelectedTeams([]); // Reset selections
        setIsOpen(true);
    };


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

    const handleCheckboxChange = (teamId: number) => {
        setSelectedTeams((prev) =>
            prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
        );
    };


    const handleSubmit = async () => {
        if (!selectedPlayer) return;

        const payload = {
            playerId: selectedPlayer.id,
            teamIds: selectedTeams,
            type: 'player',
            enterpriseId: session?.user?.id
        };

        console.log("Submitting Data:", payload);

        try {
            const response = await fetch("/api/assignteams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                showSuccess("Teams assigned successfully!");
                setIsOpen(false);
            } else {
                showError("Error assigning teams");
            }
        } catch (error) {
            console.error("API error:", error);
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
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will delete this player!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Delete!",
            cancelButtonText: 'Cancel',
        });
    
        // If Cancel is clicked, exit early and do nothing
        if (!result.isConfirmed) {
            return;
        }
    
        try {
            let clubId; // Declare clubId outside the if block
    
            if (session) {
                clubId = session.user.id;
            }
    
            if (!clubId) {
                Swal.fire("Error!", "Club ID is missing!", "error");
                return;
            }
    
            const response = await fetch(`/api/enterprise/player/archived`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id, // Send the player's ID for deletion
                }),
            });
    
            if (response.ok) {
                fetchCoaches();
                Swal.fire("Archived!", "Player delete successfully!", "success");
            } else {
                Swal.fire("Failed!", "Failed to delete Player", "error");
            }
        } catch (error) {
            Swal.fire("Error!", "An error occurred while removing the player", "error");
        }
    };
    
    const handleRestore = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This action will restore this Player!",
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
    
            const response = await fetch(`/api/enterprise/player/archived`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }), // Send the player's ID to restore
            });
    
            const responseData = await response.json();
            console.log("Response Data:", responseData); // Debug log
    
            if (response.ok) {
                fetchCoaches();
                Swal.fire("Restored!", "Player restored successfully!", "success");
            } else {
                Swal.fire("Failed!", responseData.message || "Failed to restore Player", "error");
            }
        } catch (error) {
            Swal.fire("Error!", "An error occurred while restoring the Player", "error");
        }
    };
    


    const handleAssign = async (e: any) => {
        e.preventDefault();

        if (!selectedTeam) {
            showError("Please select a team.");
            return;
        }

        try {
            const response = await fetch(`/api/coach/unarchived`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    coachId,
                    type: 'player',
                    teamId: selectedTeam,
                    club_id: session?.user?.id
                }),
            });
            if (response.ok) {
                fetchCoaches();
                setBeingRestored(false)
                Swal.fire("Restored!", "Player restored successfully!", "success");
            } else {
                Swal.fire("Failed!", "Failed to restore Player", "error");
            }
        } catch (error) {
            Swal.fire("Error!", "An error occurred while archiving the player", "error");
        }

    };
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
                    <h1 className="text-2xl font-bold mb-4"> Your Archived Players</h1>
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
                                href={`/enterprise/invitations/1?mass=0`}
                                className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-700 rounded-lg"
                            >
                                Manual Invitation
                            </a>
                            <a
                                href={`/enterprise/invitations/1?mass=1`}
                                className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-700 rounded-lg"
                            >
                                Mass Invitation
                            </a>


                        </div> */}
                    </div>

                    {isOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6 md:p-8">
                            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg">
                                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                                    {/* Select Teams for {selectedPlayer?.first_name} */}
                                    Select Team to Join
                                </h2>
                                <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                                    <ul>
                                        {teams.map((team) => (
                                            <li
                                                key={team.id ?? Math.random()}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTeams.includes(team.id!)}
                                                    onChange={() => handleCheckboxChange(team.id!)}
                                                    className="w-5 h-5 text-green-600 focus:ring focus:ring-green-300"
                                                />
                                                <a href={`/teams/${team.slug}`} target='_blank' className="flex items-center gap-3 w-full">
                                                    <img
                                                        src={team.logo}
                                                        alt={team.team_name}
                                                        className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"
                                                    />
                                                    <span className="text-gray-700 font-medium">{team.team_name}</span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex justify-between mt-5">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                                {/* <th>Sport</th>
                                <th>Team</th> */}
                                <th>Position(s)</th>
                                {/* <th>Evaluations</th> */}
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        {loading ? (
                            <tbody>
                                <tr>
                                    <td colSpan={10}>Loading....</td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>
                                {coaches.length > 0 ? (
                                    coaches.map((coach) => (
                                        <tr key={coach.id}>
                                            <td className='text-center'>
                                                <a href={`/players/${coach.slug}`} target='_blank'>
                                                    {coach.image === null || coach.image === '' || coach.image === 'null' ? (
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
                                            {/* <td>{coach.sport}</td>
                                            <td>{coach.team}</td> */}
                                            <td>{coach.position}</td>
                                            

                                            <td>
                                                <span className='bg-white px-4 py-2 rounded text-black-500'>
                                                    {coach.status}
                                                </span>
                                            
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


                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4">
                            {currentPage > 1 && (
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="px-4 py-2 text-sm text-blue-500 "
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



                {beingRestored && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-4 rounded-lg w-4/12 max-h-[100vh] overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                                <h2 className="text-2xl font-semibold text-gray-800">Assign A Team</h2>
                                <button
                                    onClick={() => setBeingRestored(false)}
                                    className="text-xl text-gray-600 hover:text-gray-900"
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="pt-16 pb-4 overflow-y-auto max-h-[70vh]">
                                <form onSubmit={handleAssign}>
                                    {/* Dynamically Render Team Names with Radio Buttons */}
                                    {teams.map((team, index) => (
                                        <label key={index} className="flex items-center gap-3 p-2">
                                            {/* Team Logo */}


                                            {/* Radio Button */}
                                            <input
                                                type="radio"
                                                name="selectedTeam"
                                                value={team.id}
                                                className="form-radio text-blue-500"
                                                onChange={() => setSelectedTeam(team.id?.toString() || '')}
                                            />

                                            <img src={team.logo} alt={team.team_name} className="w-10 h-10 rounded-full object-cover" />
                                            <span className="text-gray-800">{team.team_name}</span>
                                        </label>

                                    ))}

                                    <button
                                        type="submit"
                                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600"
                                    >
                                        Assign Team
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
