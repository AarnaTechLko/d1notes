"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession, getSession } from "next-auth/react";
import Sidebar from "../../components/enterprise/Sidebar";
import CoachForm from "@/app/components/enterprise/CoachForm";
import { showError, showSuccess } from "@/app/components/Toastr";
import {
  FaTrash,
  FaArchive,
  FaEye,
  FaHistory,
  FaKey,
  FaShare,
  FaSpinner,
  FaUndo,
  FaUsers,
} from "react-icons/fa";
import ResetPassword from "@/app/components/ResetPassword";
import Swal from "sweetalert2";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
  //In order to allow the id numbers to be inserted into selectedTeams number array
  //we can't allow id to be undefined
  id: number;
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
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [coachId, setCoachId] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [beingRestored, setBeingRestored] = useState<boolean>(false);
  const [loadingKey, setLoadingKey] = useState<boolean>(false);
  const [showLicenseModal, setShowLicenseModal] = useState<boolean>(false);
  const [assignLicenseLoader, setAssignLicenseLoader] =
    useState<boolean>(false);
  const [showLicenseNoModal, setShowLicenseNoModal] = useState<boolean>(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [licenseCount, setLicenseCount] = useState<number>(0);
  const [licenseKey, setLicenseKey] = useState<string>("");
  const [totalLicenses, setTotalLicenses] = useState<number>(0);
  const limit = 10; // Items per page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<{
    firstName?: string;
    id?: number;
  }>({});
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handlePasswordChangeSuccess = () => {
    console.log("Password changed successfully!");
  };

  const { data: session } = useSession();

  const handleTeamAssign = async (player: any) => {
    console.log("id", player);
    setSelectedPlayer(player);
    // setSelectedTeams([]); // Reset selections
    setIsOpen(true);
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
        const { scrollLeft, scrollWidth, clientWidth } =
          tableContainerRef.current;
        const scrollPercentage =
          (scrollLeft / (scrollWidth - clientWidth)) * 100;

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

  const fetchTeams = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    try {
      // console.log("Does the session id exists :", session.user.id)

      setLoadingData(true);
      const res = await fetch(`/api/teams?enterprise_id=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      const {
        data,
        teamplayersList,
      }: { data: Team[]; teamplayersList: any[] } = await res.json();
      setTeams(data);
      const updatedTeams = data.map((team) => ({
        ...team,
        playerIds: teamplayersList
          .filter((player) => player.teamId === team.id)
          .map((player) => player.playerId),
      }));
      setLoadingData(false);

      // console.log("Let's see the teams: ", updatedTeams)

      setTeams(updatedTeams);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const handleCheckboxChange = (teamId: number) => {
    setSelectedTeams((prev) =>
      //filter removes the team id that has been unchecked, else when a new team id
      //is checked it will be added to the array

      //only changes I made was the format
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedPlayer) return;

    const payload = {
      playerId: selectedPlayer.id,
      teamIds: selectedTeams,
      type: "coach",
      enterpriseId: session?.user?.id,
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
        setSelectedTeams([])
        setIsOpen(false);
      } else {
        showError("Error assigning teams");
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const fetchCoaches = async (page = 1, searchQuery = "") => {
    setLoading(true);

    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId) {
        console.error("Enterprise ID not found in session");
        return;
      }

      const response = await fetch(
        `/api/enterprise/coach/signup?enterprise_id=${enterpriseId}&page=${page}&limit=${limit}&search=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (!response.ok) {
        console.error("Failed to fetch coaches");
        return;
      }

      const data = await response.json();
      setCoaches(data.coaches);
      setTotalLicenses(data.totalLicensesCount[0].count);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching coaches:", error);
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

  const handleAddCoachClick = () => {
    setShowModal(true); // Open the modal
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  const handlePopup = () => {
    Swal.fire({
      title: "No Evaluations Completed Yet...",
      text: "",
      icon: "info", // Can be 'success', 'error', 'warning', 'info', 'question'
      confirmButtonText: "OK",
    });
  };
  const handleSubmitCoachForm = async (formData: any) => {
    try {
      const response = await fetch("/api/enterprise/coach/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      fetchCoaches(currentPage, search);
      if (response.ok) {
        console.log("Coach added successfully");
        fetchCoaches(); /// Refresh data table
      } else {
        console.error("Failed to add coach");
      }
    } catch (error) {
      console.error("Error adding coach:", error);
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
        console.error("Missing required data");
        return;
      }
      if (licenseCount > totalLicenses) {
        showError(
          "License Qualtity can not be greater than available license."
        );
        setAssignLicenseLoader(false);
        return;
      }
      if (licenseCount === 0) {
        showError("Enter number of licenses.");
        setAssignLicenseLoader(false);
        return;
      }
      const response = await fetch("/api/enterprise/coach/assignLicense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coach_id: selectedCoach.id,
          enterprise_id: enterpriseId,
          licenseCount: licenseCount,
        }),
      });

      if (response.ok) {
        showSuccess("License shared successfully");
        setAssignLicenseLoader(false);
        fetchCoaches();
        setShowLicenseModal(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to share license";
        setAssignLicenseLoader(false);
        showError(errorMessage);
        setShowLicenseModal(true);
      }
    } catch (error) {
      console.error("Error sharing license:", error);
      setAssignLicenseLoader(false);
    } finally {
      setAssignLicenseLoader(false);
      setLicenseCount(0);
    }
  };

  const handleResetPassword = (coach: Coach) => {
    console.log(coach);
    setCoachId(coach.id);
    setIsModalOpen(true);
  };
  const handleLicenseKeySubmit = async () => {
    try {
      const session = await getSession();
      const enterpriseId = session?.user?.id;

      if (!enterpriseId || !selectedCoach) {
        console.error("Missing required data");
        return;
      }

      const response = await fetch("/api/enterprise/coach/updatestatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coach_id: selectedCoach.id,
          licenseKey: licenseKey,
        }),
      });

      if (response.ok) {
        showSuccess("License shared successfully");
        fetchCoaches(currentPage, search);

        setShowLicenseNoModal(false);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to Change Status";
        showError(errorMessage);
        setShowLicenseNoModal(true);
      }
    } catch (error) {
      console.error("Error shared license:", error);
    } finally {
      setLicenseCount(0);
    }
  };
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will archive the coach!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, archive it!",
    }).then(async (result) => {
      if (result.isConfirmed) {

        const enterpriseId = session?.user?.id;


        try {
          const response = await fetch(`/api/player/archived`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id, // Send only the id
              type: 'coach',
              club_id: enterpriseId
            }),
          });
          const responseData = await response.json();

          if (response.ok) {
            fetchCoaches();
            Swal.fire("Archived!", "Coach archived successfully!", "success");
          } else {
            Swal.fire(
              "Failed!",
              responseData.message || "Failed to archive Coach",
              "error"
            );
          }
        } catch (error) {
          Swal.fire(
            "Error!",
            "An error occurred while archiving the coach",
            "error"
          );
        }
      }

      // if (result.isConfirmed) {
      //   try {
      //     const response = await fetch(`/api/player/archived`, {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //       body: JSON.stringify({
      //         id,
      //         type: 'coach'
      //       }),
      //     });
      //     if (response.ok) {
      //       fetchCoaches();
      //       Swal.fire("Archived!", "Player archived successfully!", "success");
      //     } else {
      //       Swal.fire("Failed!", "Failed to archive Player", "error");
      //     }
      //   } catch (error) {
      //     Swal.fire("Error!", "An error occurred while archiving the player", "error");
      //   }
      // }
    });
  };

  const handleRestore = async (id: number) => {
    setBeingRestored(true);
    setCoachId(id);
  };

  const handleAssign = async (e: any) => {
    e.preventDefault();

    if (!selectedTeam) {
      showError("Please select a team.");
      return;
    }

    try {
      const response = await fetch(`/api/coach/unarchived`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coachId,
          type: "coach",
          teamId: selectedTeam,
          club_id: session?.user?.id,
        }),
      });
      if (response.ok) {
        fetchCoaches();
        setBeingRestored(false);
        Swal.fire("Restored!", "Player restored successfully!", "success");
      } else {
        Swal.fire("Failed!", "Failed to restore Player", "error");
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "An error occurred while archiving the player",
        "error"
      );
    }
  };
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ResetPassword
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handlePasswordChangeSuccess}
        type="coach"
        userId={coachId}
      />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          <h1 className="text-2xl font-bold mb-4">Your Coaches</h1>
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search By Name..."
              className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={handleSearchChange}
            />
            <div className="flex space-x-4 gap-5">
              {/* <button
          <h1 className="text-2xl font-bold mb-4">Your Coaches</h1>
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
      Add Coach
    </button> */}
              <a
                href={`/enterprise/invitations/0?mass=0`}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 h-full"
              >
                Add Coach Manually
              </a>
              <a
                href={`/enterprise/invitations/0?mass=1`}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 h-full"
              >
                Mass Coach Uplaod
              </a>
              {/* <a
              <a
                href={`/enterprise/invitations/0?mass=0`}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-700 rounded-lg"
              >
                Add Coach Manually
              </a>
              <a
                href={`/enterprise/invitations/0?mass=1`}
                className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-700 rounded-lg"
              >
                Mass Coach Uplaod
              </a>
              {/* <a
     href={`/enterprise/massuploadcoach`}
      className="px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-700 rounded-lg"
    >
     Mass Upload
    </a> */}
            </div>
          </div>

          <div ref={tableContainerRef} className="overflow-x-auto">
            <button
              onClick={scrollLeft}
              className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
                IsStart
                  ? "bg-gray-400 cursor-not-allowed"
                  : isMiddle
                  ? "bg-green-500"
                  : "bg-blue-500"
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
                  {/* <th>Sport</th> */}
                  {/* <th>Available License</th>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Sport</th>
                  {/* <th>Available License</th>
        <th>Used License</th> */}
                  <th>Evaluations</th>
                  <th>Status</th>
                  <th style={{ width: 225 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coaches.length > 0 ? (
                  coaches.map((coach) => (
                    <tr key={coach.id}>
                      <td className="text-center">
                        <a
                          href={`/coach/${coach.slug}`}
                          title="View Bio"
                          className="px-4 py-2"
                          target="_blank"
                        >
                          <img
                            src={
                              coach.image === "null" || !coach.image
                                ? "/default.jpg"
                                : coach.image
                            }
                            className="rounded-full w-16 h-16 object-cover m-auto"
                          />
                          {coach.firstName} {coach.lastName}
                        </a>
                      </td>
                      <td>{coach.gender}</td>
                      <td>{coach.email}</td>
                      <td>
                        {coach.countrycode}
                        {coach.phoneNumber}
                      </td>
                      {/* <td>{coach.sport}</td> */}
                      {/* <td>{coach.assignedLicenseCount}</td>
            <td>{coach.consumeLicenseCount}</td> */}
                      <td align="center">
                        {Number(coach.totalEvaluations) >= 1 && (
                          <a
                            href={`/coach/history/${coach.slug}`}
                            title="History"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            target="_blank"
                          >
                            View {/* {coach.totalEvaluations} */}
                          </a>
                        )}
                        {Number(coach.totalEvaluations) == 0 && (
                          <button
                            title="History"
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            onClick={handlePopup}
                          >
                            View {/* {coach.totalEvaluations} */}
                          </button>
                        )}
                      </td>
                      <td>
                        {coach.status === "Pending" ? (
                          <span className=" text-black-500">
                            {coach.status}
                          </span>
                        ) : (
                          <span className=" text-black-500">
                            {coach.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              if(coach.firstName) {//if player has completed profile
                                handleTeamAssign(coach)
                              }
                            }} // Pass the banner ID to the delete handler
                            className=" text-green-500 hover:text-green-700 mr-4"
                            aria-label="Archive Player"
                            title="Assign a Team"
                          >
                            <FaUsers size={24} />
                          </button>
                          <button
                            onClick={() => handleDelete(coach.id)} // Pass the banner ID to the delete handler
                            className="bg-black-500 text-white-500 hover:text-white-700"
                            aria-label="Archive Coach"
                            title="Archive Coach"
                          >
                            <FaArchive size={24} />
                          </button>

                          {coach.status == "Archived" && (
                            <button
                              onClick={() => handleRestore(coach.id)} // Pass the banner ID to the delete handler
                              className=" text-green-500 hover:text-green-700"
                              aria-label="Archive Player"
                              title="Archive Coach"
                            >
                              <FaUndo size={24} />
                            </button>
                          )}
                          {/* <button
                  onClick={() => handleResetPassword(coach)}
                  title='Reset Password'
                  className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
                >
                 <FaKey/>
                </button>
               
                  
               
               
                <button
                  onClick={() => handleAssignLicense(coach)}
                  title="Share License"
                  className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
                >
                 <FaShare/>
                </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>No Coaches added yet...</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              onClick={scrollRight}
              disabled={isEnd}
              style={{
                backgroundColor: isEnd
                  ? "grey"
                  : isMiddle
                  ? "#22c55e"
                  : "#22c55e", // Tailwind green-500 and blue-500
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

        {/* License Modal */}
        {showLicenseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-96">
              <h2 className="text-2xl font-semibold mb-4">Assign Licenses</h2>
              <div className="mb-2">
                <label>Available License Keys: </label>
                <span className="bg-blue-500 w-16 h-16 rounded-full p-2 text-white">
                  {totalLicenses}
                </span>
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
                    <>Share License</>
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
                  <p>
                    <FaSpinner className="animate-spin mr-2" /> Finding Key...
                  </p>
                </>
              ) : (
                <></>
              )}
              {/* <button
          type='button'
  className="text-xs text-gray-500"
  onClick={() => handleLoadLicense()}
>
  Assign License
</button> */}
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

        {isOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6 md:p-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md sm:max-w-lg">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                {/* Select Teams for {selectedPlayer?.firstName} */}
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
                        // handleCheckboxChange
                        onChange={() => handleCheckboxChange(team.id)}
                        // onChange={() => setSelectedTeams(...selectedTeams, team.id)}
                        className="w-5 h-5 text-green-600 focus:ring focus:ring-green-300"
                      />
                      <a
                        href={`/teams/${team.slug}`}
                        target="_blank"
                        className="flex items-center gap-3 w-full"
                      >
                        <img
                          src={team.logo}
                          alt={team.team_name}
                          className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"
                        />
                        <span className="text-gray-700 font-medium">
                          {team.team_name}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between mt-5">
                <button
                  onClick={() => {setIsOpen(false); setSelectedTeams([])}}
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
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-11/12 max-h-[100vh] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Add Coach
                </h2>
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

        {beingRestored && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-lg w-4/12 max-h-[100vh] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 bg-white p-4 flex justify-between items-center border-b">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Assign A Team
                </h2>
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
                        onChange={() =>
                          setSelectedTeam(team.id?.toString() || "")
                        }
                      />

                      <img
                        src={team.logo}
                        alt={team.team_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
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
