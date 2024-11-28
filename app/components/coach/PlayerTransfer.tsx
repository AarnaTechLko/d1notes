import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { showError, showSuccess } from "../Toastr";
 

interface Player {
  id: number;
  first_name: string;
  last_name: string;
  image: string;
}

interface PlayerTransferProps {
  teamId: string;
}

const PlayerTransfer: React.FC<PlayerTransferProps> = ({ teamId }) => {
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [availableSearchTerm, setAvailableSearchTerm] = useState<string>("");
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
      const res = await fetch("/api/coach/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enterprise_id: session.user.id,
          teamId,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch players");

      const data = await res.json();
      setAvailablePlayers(data);
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

  // Filter available and selected players based on search term
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
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex justify-center items-center h-1/2-screen">
          <div className="flex w-3/4 gap-4">
            <Droppable droppableId="available">
              {(provided) => (
                <div
                  className="w-1/2 border p-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h2 className="text-lg font-bold mb-2">Available Players</h2>
                  <input
                    type="text"
                    placeholder="Search available players"
                    value={availableSearchTerm}
                    onChange={(e) => setAvailableSearchTerm(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                  />
                  <ul>
                    {filteredAvailablePlayers.map((player, index) => (
                      <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                        {(provided) => (
                          <li
                            className="p-2 bg-gray-100 border mb-2 flex items-center gap-2 cursor-pointer"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <img
                              src={player.image}
                              alt={`${player.first_name} ${player.last_name}`}
                              className="w-8 h-8 rounded-full"
                            />
                            <span>
                              {player.first_name} {player.last_name}
                            </span>
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
                  className="w-1/2 border p-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <h2 className="text-lg font-bold mb-2">Selected Players</h2>
                  <input
                    type="text"
                    placeholder="Search selected players"
                    value={selectedSearchTerm}
                    onChange={(e) => setSelectedSearchTerm(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                  />
                  <ul>
                    {filteredSelectedPlayers.map((player, index) => (
                      <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                        {(provided) => (
                          <li
                            className="p-2 bg-gray-100 border mb-2 flex items-center gap-2 cursor-pointer"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <img
                              src={player.image}
                              alt={`${player.first_name} ${player.last_name}`}
                              className="w-8 h-8 rounded-full"
                            />
                            <span>
                              {player.first_name} {player.last_name}
                            </span>
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
        </div>
      </DragDropContext>
      <div className="text-center mt-4 flex justify-center gap-4">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Assigning..." : "Assign"}
        </button>
        <Link href="/coach/teams">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Teams
          </button>
        </Link>
      </div>
    </>
  );
};

export default PlayerTransfer;
