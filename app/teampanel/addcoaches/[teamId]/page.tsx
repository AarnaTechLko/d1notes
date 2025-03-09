"use client";

import { useState, useEffect } from "react";
import TeamModal from "@/app/components/enterprise/TeamModal";
import Sidebar from "@/app/components/teams/Sidebar";
import { useSession } from "next-auth/react";
import PlayerTransfer from "@/app/components/PlayerTransfer";
import Link from "next/link";
import InviteForm from "@/app/components/InviteForm";
import MassUploadPlayer from "@/app/components/MassUploadPlayer";
import PlayerForm from "@/app/components/coach/PlayerForm";
import { showSuccess } from "@/app/components/Toastr";
import MassUploadCoach from "@/app/components/MassUploadCoach";
import CoachForm from "@/app/components/enterprise/CoachForm";

type PageProps = {
  params: {
    teamId: string;
  };
};

type Player = {
  id: number;
  image: string;
  first_name: string;
  last_name: string;
  teamId: string;
};

export default function TeamsPage({ params }: PageProps) {
  const { teamId } = params;
  const { data: session } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [teamType, setTeamType] = useState<string>("");
  const [activeTab, setActiveTab] = useState(0);

  const handleSubmitCoachForm = async (formData: any) => {
    try {
      const response = await fetch('/api/enterprise/coach/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
     
      if (response.ok) {
        console.log('Coach added successfully');
       
       
      } else {
        console.error('Failed to add coach');
      }
    } catch (error) {
      console.error('Error adding coach:', error);
    } finally {
      
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
      setTeamName(data.team.team_name);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  useEffect(() => {
    fetchAvailablePlayers();
  }, [teamId, session?.user?.id]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-center">
            {/* <span className="inline-block bg-blue-500 text-white text-xl font-semibold px-3 py-1 rounded-full mb-5">
              {teamName} 
            </span> */}
          </p>

          <h2 className="text-xl font-bold w-full text-blue-600">Add Coach(es) to Team</h2>

          <div className="w-full mx-auto px-4 mt-5">
            {/* Tabs Header */}
            <div className="flex space-x-4 border-b border-gray-300">
              <button
                onClick={() => setActiveTab(0)}
                className={`tab-btn ${activeTab === 0 ? 'active-tab' : ''}`}
              >
                Add Player Manually
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`tab-btn ${activeTab === 1 ? 'active-tab' : ''}`}
              >
                Mass Coach Upload
              </button>
              {/* <button
                onClick={() => setActiveTab(2)}
                className={`tab-btn ${activeTab === 2 ? 'active-tab' : ''}`}
              >
                Manual
              </button> */}
            </div>

            {/* Tab Content */}
            <div className="tab-content mt-4">
              {activeTab === 0 && (
                <div className="tab-panel">
                  <InviteForm usertype="Team" teamId={teamId}  registrationType="coach"/>
                </div>
              )}
              {activeTab === 1 && (
                <div className="tab-panel">
                   <MassUploadCoach  usertype="Team"  teamId={teamId}  enterpriseId={session?.user.id ?? ''} registrationType="coach"/>
                  {/* <MassUploadPlayer usertype="Team" teamId={teamId}/> */}
                </div>
              )}
              {activeTab === 2 && (
                <div className="tab-panel">
                  <CoachForm onSubmit={handleSubmitCoachForm} teamId={teamId}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
