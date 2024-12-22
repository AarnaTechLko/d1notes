import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showError, showSuccess } from "./Toastr";
 

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  image: string;
  position?: string; // New fields for additional info
  location?: string; // New fields for additional info
  height?: string; // New fields for additional info
  weight?: string; // New fields for additional info
  grade_level?: string; // New fields for additional info
  team?: string; // New fields for additional info
  
 
}

interface PlayerTransferProps {
  teamId: string;
}

const PlayerTransfer: React.FC<PlayerTransferProps> = ({ teamId }) => {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [availableSearchTerm, setAvailableSearchTerm] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [teamType, setTeamType] = useState<string>("");
  const [selectedSearchTerm, setSelectedSearchTerm] = useState<string>("");
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAssignedPlayers = async () => {
    if (!session || !session.user?.id) return;

    try {
      const response = await fetch('/api/assignedPlayers', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) throw new Error("Failed to fetch assigned players");

      const assignedPlayersResponse = await response.json();
      setSelectedPlayers(assignedPlayersResponse);
    } catch (error) {
      console.error("Error fetching assigned players:", error);
    }
  };

  const fetchAvailablePlayers = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    try {
      const res = await fetch("/api/enterprise/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enterprise_id: session.user.id,
          teamId,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch players");

      const data = await res.json();
      setAvailablePlayers(data.players);
      setTeamName(data.team.team_name);
      setTeamType(data.team.team_type);
      
       
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  

  useEffect(() => {
    fetchAssignedPlayers();
    fetchAvailablePlayers();
  }, [teamId, session?.user?.id]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceList =
      source.droppableId === "available" ? availablePlayers : selectedPlayers;
    const destinationList =
      destination.droppableId === "available" ? availablePlayers : selectedPlayers;

    if (source.droppableId === destination.droppableId) {
      const reorderedList = Array.from(sourceList);
      const [movedPlayer] = reorderedList.splice(source.index, 1);
      reorderedList.splice(destination.index, 0, movedPlayer);

      if (source.droppableId === "available") {
        setAvailablePlayers(reorderedList);
      } else {
        setSelectedPlayers(reorderedList);
      }
      return;
    }

    const updatedSourceList = Array.from(sourceList);
    const updatedDestinationList = Array.from(destinationList);

    const [movedPlayer] = updatedSourceList.splice(source.index, 1);
    updatedDestinationList.splice(destination.index, 0, movedPlayer);

    if (source.droppableId === "available") {
      setAvailablePlayers(updatedSourceList);
      setSelectedPlayers(updatedDestinationList);
    } else {
      setAvailablePlayers(updatedDestinationList);
      setSelectedPlayers(updatedSourceList);
    }
  };

  const handleSubmit = async () => {
    if (!session || !session.user?.id) {
      console.error("No user logged in");
      return;
    }

    if (selectedPlayers.length === 0) {
      showError("No players selected");
      return;
    }

    const teamIdInt = parseInt(teamId, 10);
    if (isNaN(teamIdInt)) {
      console.error("Invalid team ID");
      return;
    }

    const playerIds = selectedPlayers.map((player) => player.id);

    const payload = {
      teamId: teamIdInt,
      enterprise_id: session.user.id,
      playerIds: playerIds,
    };

    setIsLoading(true);

    try {
      const res = await fetch("/api/enterprise/teams/assignPlayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        showError("API Error Details:");
        throw new Error("Failed to assign players to the team");
      }

      showSuccess("Players assigned successfully");
    } catch (error) {
      console.error("Error saving players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAvailablePlayers = availablePlayers.filter((player) =>
    `${player.first_name} ${player.last_name}`
      .toLowerCase()
      .includes(availableSearchTerm.toLowerCase())
  );

  const filteredSelectedPlayers = selectedPlayers.filter((player) =>
    `${player.first_name} ${player.last_name}`
      .toLowerCase()
      .includes(selectedSearchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="justify-between items-start">
      <p className="text-center"><span className="inline-block bg-blue-500 text-white text-xl font-semibold px-3 py-1 rounded-full mb-5">
  {teamName} ({teamType})
</span></p>
 
        <h2 className="text-xl font-bold w-full  text-blue-600">Add / Remove Players</h2>
      <p className="w-full mt-4"><b>Add:</b>To assign players to this team, you can simply Drag & Drop players from Available Players to Selected Players.</p>
      <p className="w-full mt-4 mb-5"><b>Remove:</b>To remove players from this team, you can simply Drag & Drop players from Selected Players to Available Players.</p>
      </div>
      <div className="text-center mt-4 mb-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Assigning..." : "Assign Players"}
        </button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex justify-between items-start">
          <Droppable droppableId="available">
            {(provided) => (
              <div
                className="w-1/2 border p-4 rounded-lg bg-white shadow-md"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2 className="text-xl font-bold mb-2">Available Players</h2>
                <input
                  type="text"
                  placeholder="Search available players"
                  value={availableSearchTerm}
                  onChange={(e) => setAvailableSearchTerm(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                />
                <ul className=" overflow-y-auto h-96">
                  {filteredAvailablePlayers.map((player, index) => (
                    <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                      {(provided) => (
                        <li
                          className="p-4 bg-gray-100 border mb-2 rounded-lg flex items-center gap-4"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <img
                            src={player.image  ?? '/default.jpg'}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="w-20 h-20 rounded-full"
                          />
                          <div>
                            <h3 className="font-semibold">
                              {player.first_name} {player.last_name}
                            </h3>
                            {player.position && <p className="text-xs"><b>Position:</b> {player.position}</p>}
                            {player.location && <p className="text-xs"><b>Playing Location:</b> {player.location}</p>}
                            {player.height && <p className="text-xs"><b>Height:</b> {player.height}</p>}
                            {player.weight && <p className="text-xs"><b>Weight:</b> {player.weight}</p>}
                            {player.grade_level && <p className="text-xs"><b>Level:</b> {player.grade_level}</p>}
                            {player.team && <p className="text-xs"><b>Team:</b> {player.team}</p>}
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              </div>
            )}
          </Droppable>

          <Droppable droppableId="selected">
            {(provided) => (
              <div
                className="w-1/2 border p-4 rounded-lg bg-white shadow-md"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                <h2 className="text-xl font-bold mb-2">Selected Players</h2>
                <input
                  type="text"
                  placeholder="Search selected players"
                  value={selectedSearchTerm}
                  onChange={(e) => setSelectedSearchTerm(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                />
                <ul  className=" overflow-y-auto h-96">
                  {filteredSelectedPlayers.map((player, index) => (
                    <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                      {(provided) => (
                        <li
                          className="p-4 bg-gray-100 border mb-2 rounded-lg flex items-center gap-4"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <img
                            src={player.image  ?? '/default.jpg'}
                            alt={`${player.first_name} ${player.last_name}`}
                            className="w-20 h-20 rounded-full"
                          />
                          <div>
                          <h3 className="font-semibold">
                              {player.first_name} {player.last_name}
                            </h3>
                            {player.position && <p className="text-xs"><b>Position:</b> {player.position}</p>}
                            {player.location && <p className="text-xs"><b>Playing Location:</b> {player.location}</p>}
                            {player.height && <p className="text-xs"><b>Height:</b> {player.height}</p>}
                            {player.weight && <p className="text-xs"><b>Weight:</b> {player.weight}</p>}
                            {player.grade_level && <p className="text-xs"><b>Level:</b> {player.grade_level}</p>}
                            {player.team && <p className="text-xs"><b>Team:</b> {player.team}</p>}
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
      <div className="text-center mt-4">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Assigning..." : "Assign Players"}
        </button>
      </div>
    </div>
  );
};

export default PlayerTransfer;
