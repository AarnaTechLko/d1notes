"use client";

import { useState, useEffect } from "react";
import TeamModal from "@/app/components/coach/TeamModal";
import Sidebar from "@/app/components/Sidebar";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import  { useRef } from "react";
import Link from "next/link";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

type Team = {
  id?: number;
  team_name?: string;

  logo?: string;
  leage: string;
  age_group: string;
  team_type?: string;
  team_year?: string;
  slug?: string;
  league?: string;
  



};

type Player = {
  id: number;
  image: string;
  first_name: string;
  last_name: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [enterpriseId, setEnterpriseID] = useState<string | null>(null);
  const { data: session } = useSession();
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);
const [isMiddle, setIsMiddle] = useState(false);
  const [IsStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [fullDescription, setFullDescription] = useState<string | null>(null); // State for full description
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false); // State for showing full description modal
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
  const fetchTeams = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    try {
      setLoadingData(true);
      const res = await fetch(`/api/yourteams?enterprise_id=${session.user.id}`);
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

   
  };

  const handleSubmit = async (formValues: Partial<Team>) => {
    try {
      const method = editTeam ? "PUT" : "POST";
      const payload = {
        ...formValues,
        ...(editTeam && { id: editTeam.id }),
      };
      await fetch("/api/yourteams", {
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

 

  const handleDelete = async (id?: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    try {
      await fetch("/api/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
    }
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
    fetchTeams();
    fetchPlayers();
  }, [session]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Teams</h1>
            {/* <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setModalOpen(true)}
            >
              Add Team
            </button> */}

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
                    <th className="text-left px-4 py-2">Age</th>
                    <th className="text-left px-4 py-2">Team Name</th>
                    <th className="text-left px-4 py-2">Logo</th>
                    <th className="text-left px-4 py-2">Gender</th>
                    <th className="text-left px-4 py-2">League</th>

                    <th className="text-left px-4 py-2">Roster</th>
                    
                  </tr>
                </thead>
                {loadingData ? (
                  <tbody>
                    <tr>
                      <td colSpan={7}> <div className="flex justify-center items-center">
                        <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-8 h-8"></div>
                      </div></td>
                    </tr>
                  </tbody>

                ) : (

                    <tbody>
                    {teams.length > 0 ? (
                      teams.map((team) => (
                        <tr key={team.id} className="border-b">
                          <td className="px-4 py-2">
                            {team.team_year || `${team.age_group}` || ''}
                          </td>
                          <td className="px-4 py-2">{team.team_name}</td>
                          <td className="px-4 py-2">
                            <img src={team.logo} className="w-12 h-12 rounded-full" />
                          </td>
                          <td className="px-4 py-2">{team.team_type}</td>
                          <td className="px-4 py-2">{team.leage}</td>
                          <td className="px-4 py-2">
                            <a
                              href={`/teams/${team.slug}`}
                              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                              target="_blank"
                              style={{ minWidth: '50px', whiteSpace: 'nowrap' }}
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                          You have not been added to any Teams yet...
                        </td>
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
