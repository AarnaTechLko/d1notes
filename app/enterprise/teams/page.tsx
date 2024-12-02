"use client";

import { useState, useEffect } from "react";
import TeamModal from "@/app/components/enterprise/TeamModal";
import Sidebar from "@/app/components/enterprise/Sidebar";
import { useSession } from "next-auth/react";
 
import Link from "next/link";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
// Define types for better TypeScript compliance
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
  const [players, setPlayers] = useState<Player[]>([]); // Player list state
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]); // Selected players state
  const [playerModalOpen, setPlayerModalOpen] = useState(false); // Player selection modal visibility
  const [enterpriseId, setEnterpriseID] =useState<string | null>(null);; // Player selection modal visibility
  const { data: session } = useSession();
  const [currentTeamId, setCurrentTeamId] = useState<number | null>(null);
  const fetchTeams = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    try {
      const res = await fetch(`/api/teams?enterprise_id=${session.user.id}`);
      if (!res.ok) throw new Error("Failed to fetch teams");
      const { data, teamplayersList }: { data: Team[]; teamplayersList: any[] } = await res.json();
      setTeams(data);
      const updatedTeams = data.map((team) => ({
        ...team,
        playerIds: teamplayersList
          .filter((player) => player.teamId === team.id)
          .map((player) => player.playerId), // Extract only player IDs
      }));
  
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
        ...(editTeam && { id: editTeam.id }), // Include `id` if editing
      };
      await fetch("/api/teams", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      setEditTeam(null);
      fetchTeams(); 
     ///// fetchPlayers();
    } catch (error) {
      console.error("Error submitting team:", error);
    }
  };

  const handleEdit = (team: Team) => {
    if (!team) return;
    const sanitizedTeam = {
      ...team,
      created_by: team.created_by || "",
      creator_id: team.creator_id ,
    };
    setEditTeam(sanitizedTeam);
    setModalOpen(true);
  };

  const handleDelete = async (id?: number) => {
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
      setSelectedPlayers(team.playerIds || []); // Pre-select players assigned to the team
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

            {/* Responsive Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="text-left px-4 py-2">Logo</th>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Description</th>
                    <th className="text-left px-4 py-2">Players</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="border-b">
                      <td className="px-4 py-2"><img src={team.logo} className="w-8 h-8 rounded-full"/></td>
                      <td className="px-4 py-2">{team.team_name}</td>
                      <td className="px-4 py-2">{team.description}</td>
                      <td className="px-4 py-2"><Link
  href={`/enterprise/addplayers/${team.id}`}
  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
>
  Add/View Players
</Link></td>
<td className="px-4 py-2">
  <div className="flex items-center space-x-2">
    <a href={`/teams/${team.slug}`} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-yellow-600" target="_blank">
      <FaEye />
    </a>
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

          
          </div>
        </div>
      </main>
    </div>
  );
}
