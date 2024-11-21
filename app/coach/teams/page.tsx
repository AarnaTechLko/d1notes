"use client";

import { useState, useEffect } from "react";
import TeamModal from "@/app/components/coach/TeamModal";
import Sidebar from "@/app/components/coach/Sidebar";
import { useSession } from "next-auth/react";
// Define types for better TypeScript compliance
type Team = {
  id: number;
  team_name: string;
  description: string;
  logo: string;
  created_by: string;
  creator_id: string;
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
      const res = await fetch(`/api/coach/teams?enterprise_id=${session.user.id}`);
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
      const res = await fetch("/api/coach/player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enterprise_id: session.user.id, // Send logged-in user's ID
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch players");

      const data: Player[] = await res.json();
      setPlayers(data);
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
      await fetch("/api/coach/teams", {
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
      creator_id: team.creator_id || "",
    };
    setEditTeam(sanitizedTeam);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch("/api/coach/teams", {
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

  const handleSavePlayers = async (teamId: number) => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }
  
    if (selectedPlayers.length === 0) {
      console.warn("No players selected");
      return;
    }
  
    try {
      const payload = {
        teamId,
        enterprise_id: session.user.id,
        playerIds: selectedPlayers,
      };
  
      const res = await fetch("/api/coach/teams/assignPlayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        throw new Error("Failed to assign players to the team");
      }
  
      console.log("Players assigned successfully");
      setPlayerModalOpen(false);
      setSelectedPlayers([]); // Clear the selection
    } catch (error) {
      console.error("Error saving players:", error);
    }
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
                      <td className="px-4 py-2"><button
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          onClick={() => handleAddPlayers(team.id)}
                        >
                          Add Players
                        </button></td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          onClick={() => handleEdit(team)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          onClick={() => handleDelete(team.id)}
                        >
                          Delete
                        </button>
                        
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

            {/* Player Selection Modal */}
            {playerModalOpen && (
             <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
             <div className="bg-white p-6 rounded-lg w-96">
               <h2 className="text-xl font-bold mb-4">Select Players</h2>
               <div className="space-y-4">
               {players.map((player) => (
  <div key={player.id} className="flex items-center space-x-4">
   <input
        type="checkbox"
        name={`player_${player.id}`}
        checked={selectedPlayers.includes(player.id)} // Bind checked state
        onChange={() => handlePlayerSelection(player.id)} // Handle toggle
      />
    <img
      src={player.image}
      alt={player.first_name}
      className="w-10 h-10 rounded-full object-cover"
    />
    <span>{player.first_name} {player.last_name}</span>
  </div>
))}

               </div>
               <div className="mt-4 space-x-2">
               <button
  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  onClick={() => currentTeamId && handleSavePlayers(currentTeamId)} // Pass the current teamId
>
  Save
</button>
                 <button
                   className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                   onClick={() => setPlayerModalOpen(false)}
                 >
                   Cancel
                 </button>
               </div>
             </div>
           </div>
           
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
