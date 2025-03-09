"use client";

import { useState, useEffect, useRef } from "react";
import TeamModal from "@/app/components/enterprise/TeamModal";
import Sidebar from "@/app/components/enterprise/Sidebar";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Link from "next/link";
import { FaArchive, FaClipboard, FaEdit, FaEye, FaTrash } from "react-icons/fa";

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

type Player = {
  id: number;
  image: string;
  first_name: string;
  last_name: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isMiddle, setIsMiddle] = useState(false);
  const [IsStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [enterpriseId, setEnterpriseID] = useState<string | null>(null);
  const { data: session } = useSession();
  const limit = 10;
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fullDescription, setFullDescription] = useState<string | null>(null); // State for full description
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false); // State for showing full description modal
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to the first page
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
  const fetchTeams = async (page = 1, searchQuery = '') => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    try {
      setLoadingData(true);
      const res = await fetch(`/api/teams?enterprise_id=${session.user.id}&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`);
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

  const fetchPlayers = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    try {
      const res = await fetch(`/api/players?enterprise_id=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch players");
      const playerData: Player[] = await res.json();
      setPlayers(playerData);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const handleSubmit = async (formValues: Partial<Team>) => {
    try {
      const method = editTeam ? "PUT" : "POST";
      const payload = {
        ...formValues,
        ...(editTeam && { id: editTeam.id }),
      };

      await fetch("/api/teams", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      setEditTeam(null);
      fetchTeams();
    } catch (error) {
      console.error("Error submitting team:", error);
    }
  };

  const handleEdit = (team: Team) => {
    if (!team) return;
    const sanitizedTeam = {
      ...team,
      created_by: team.created_by || "",
      creator_id: team.creator_id,
    };
    setEditTeam(sanitizedTeam);
    setModalOpen(true);
  };

  const handleDelete = async (id?: number) => {
    // Show the confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will archive this team!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, archive it!',
      cancelButtonText: 'Cancel',
    });

    // If the user clicks "Cancel", the function will exit early and prevent deletion.
    if (!result.isConfirmed) {
      return; // Exit the function early if Cancel is clicked
    }

    try {
      // Proceed with the deletion (archiving the team) if the user confirmed.
      await fetch("/api/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      // Refresh the list of teams after deletion
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };


  const handleAddPlayers = (teamId: number) => {
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      setSelectedPlayers(team.playerIds || []);
    }
    setCurrentTeamId(teamId);
    setPlayerModalOpen(true);
  };

  const handlePlayerSelection = (playerId: number) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleShowFullDescription = (description: string) => {
    setFullDescription(description);
    setDescriptionModalOpen(true);
  };

  useEffect(() => {
    fetchTeams(currentPage, search);
    fetchPlayers();
  }, [session, search, currentPage]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Team; direction: 'asc' | 'desc' } | null>(null);

  const sortedTeams = [...teams].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const order = direction === 'asc' ? 1 : -1;

    const aValue = a[key as keyof Team] ?? '';  // Safely accessing with fallback for undefined
    const bValue = b[key as keyof Team] ?? '';

    if (aValue < bValue) return -1 * order;
    if (aValue > bValue) return 1 * order;
    return 0;
  });

  const renderArrow = (key: keyof Team) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };


  const handleSort = (key: keyof Team) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="container mx-auto p-4"><h1 className="text-2xl font-bold mb-4">Your Teams</h1>
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-1/3 mb-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={search}
                onChange={handleSearchChange}
              />
              <div className="flex items-stretch gap-5">

                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 h-full flex items-center justify-center"
                  onClick={() => setModalOpen(true)}
                >
                  Add Team Manually
                </button>


                <a
                  href="/enterprise/massuploadteams"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 h-full flex items-center justify-center"
                >
                  Mass Team Upload
                </a>
              </div>
            </div>




            <div ref={tableContainerRef} className="mt-4 overflow-x-auto">
              <button
                onClick={scrollLeft}
                className={`absolute left-4 top-1/2 p-3 text-white transform -translate-y-1/2 rounded-full shadow-md z-10 transition-colors duration-300 w-10 h-10 flex items-center justify-center bg-gray-500 lg:hidden ${
                  IsStart ? "bg-gray-400 cursor-not-allowed" : isMiddle ? "bg-green-500" : "bg-blue-500"
                }`}
              >
                <FaArrowLeft />
              </button>
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th onClick={() => handleSort('team_name')} className="text-left px-4 py-2 cursor-pointer">
                      Name{renderArrow('team_name')}
                    </th>

                    <th onClick={() => handleSort('team_year')} className="text-left px-4 py-2 cursor-pointer">
                      Age {renderArrow('team_year')}
                    </th>
                    <th onClick={() => handleSort('team_type')} className="text-left px-4 py-2 cursor-pointer">
                      Gender{renderArrow('team_type')}
                    </th>
                    <th className="text-left px-4 py-2">Coaches</th>
                    <th className="text-left px-4 py-2">Players</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr>
                      <td colSpan={8}>
                        <div className="flex justify-center items-center">
                          <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-8 h-8"></div>
                        </div>
                      </td>
                    </tr>
                  ) : sortedTeams.length > 0 ? (
                    sortedTeams.map((team) => (
                      <tr key={team.id} className="border-b">
                        <td className="px-4 py-2">
                          <a href={`/teams/${team.slug}`} target="_blank" title="Team Roster">
                            <div className="text-center items-center">
                              <img
                                src={team.logo ? team.logo : '/Team.jpg'}
                                className="w-12 h-12 mx-auto rounded-full"
                                alt={`${team.team_name} logo`}
                              />
                              <div className="mb-1">{team.team_name}</div>
                            </div>
                          </a>
                        </td>

                        <td className="px-4 py-2">
                          {team.team_year ? team.team_year : team.age_group}
                         
                         </td>
                        <td className="px-4 py-2">{team.team_type}</td>
                        <td className="px-4 py-2">
                          <Link href={`/enterprise/addcoaches/${team.id}`} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600">
                            Add Coaches to Team
                          </Link>
                          <p className="mt-2">Total Coaches: {team.totalCoaches}</p>
                        </td>
                        <td className="px-4 py-2">
                          <Link href={`/enterprise/addplayers/${team.id}`} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-green-600">
                            Add Players to Team
                          </Link>
                          <p className="mt-2">Total Players: {team.totalPlayers}</p>
                        </td>
                        <td>
                          <span className="px-4 py-2 text-black-500">{team.status}</span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center space-x-2">
                            <a href={`/teams/${team.slug}`} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600" target="_blank" title="View Team Roster">
                              <FaClipboard />
                            </a>
                            <a href={`teams/edit/${team.id}`} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-yellow-600" title="Edit Team Roster">
                              <FaEdit />
                            </a>
                            <button className="bg-black text-white px-2 py-1 rounded" onClick={() => handleDelete(team.id)} title="Archive Team">
                              <FaArchive />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-gray-500">No Teams added yet...</td>
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

            {modalOpen && (
              <TeamModal
                team={editTeam}
                onClose={() => {
                  setModalOpen(false);
                  setEditTeam(null);
                }}
                onSubmit={handleSubmit}
              />
            )}

            {descriptionModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-4 rounded-lg max-w-xl w-full">
                  <h2 className="text-xl font-bold mb-4">Full Description</h2>
                  <p>{fullDescription}</p>
                  <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => setDescriptionModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
