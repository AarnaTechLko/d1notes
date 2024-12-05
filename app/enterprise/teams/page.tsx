"use client";

import { useState, useEffect } from "react";
import TeamModal from "@/app/components/enterprise/TeamModal";
import Sidebar from "@/app/components/enterprise/Sidebar";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";

import Link from "next/link";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

type Team = {
  id?: number;
  team_name?: string;
  description?: string;
  logo?: string;
  created_by?: string;
  creator_id?: number;
  team_type?: string;
  team_year?: string;
  slug?: string;
  cover_image?: string;
  firstName?: string;
  lastName?: string;
  coachSlug?: string;
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [enterpriseId, setEnterpriseID] = useState<string | null>(null);
  const { data: session } = useSession();
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  const [fullDescription, setFullDescription] = useState<string | null>(null); // State for full description
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false); // State for showing full description modal

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
    fetchTeams();
    fetchPlayers();
  }, [session]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Teams</h1>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setModalOpen(true)}
            >
              Add Team
            </button>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left px-4 py-2">Year</th>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Logo</th>
                    <th className="text-left px-4 py-2">Description</th>
                    <th className="text-left px-4 py-2">Players</th>
                    <th className="text-left px-4 py-2">Roster</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
              {loadingData ? (
                 <tbody>
                  <tr>
                    <td colSpan={5}> <div className="flex justify-center items-center">
    <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-8 h-8"></div>
  </div></td>
                  </tr>
                 </tbody>
  
) : (
 
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="border-b">
                      <td className="px-4 py-2">{team.team_year}
                       
                      </td>
                      <td className="px-4 py-2">{team.team_name}
                        <a href={`/coach/${team.coachSlug}`} target="_blank">
<span className="inline-block bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
Coach: {team.firstName} {team.lastName}
</span></a>
                      </td>
                      <td className="px-4 py-2">
                      <img src={team.logo} className="w-12 h-12 rounded-full" />
                      </td>
                      <td className="px-4 py-2">
                        <p>
                          {team.description
                            ? team.description.length > 100
                              ? `${team.description.slice(0, 100)}...`
                              : team.description
                            : "No description available"}
                        </p>
                        {team.description && team.description.length > 100 && (
                          <button
                            onClick={() => handleShowFullDescription(team.description || '')}
                            className="text-blue-500 underline mt-2"
                          >
                            Read More
                          </button>
                        )}
                      </td>
                      
                      <td className="px-4 py-2">
                      <Link
  href={`/enterprise/addplayers/${team.id}`}
  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
  style={{ minWidth: '120px', whiteSpace: 'nowrap' }}
>
  Add Players
</Link>
                      </td>
                      <td className="px-4 py-2">
                        <a
                            href={`/teams/${team.slug}`}
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                            target="_blank" style={{ minWidth: '50px', whiteSpace: 'nowrap' }}
                          >
                            View
                          </a></td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          
                          <button
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                            onClick={() => handleEdit(team)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            onClick={() => handleDelete(team.id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
              </table>
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
