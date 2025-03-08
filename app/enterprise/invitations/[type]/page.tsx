"use client";

import { useState, useEffect } from "react";
import TeamModal from "@/app/components/enterprise/TeamModal";
import Sidebar from "@/app/components/enterprise/Sidebar";
import { useSession } from "next-auth/react";
import PlayerTransfer from "@/app/components/PlayerTransfer";
import Link from "next/link";
import InviteForm from "@/app/components/InviteForm";
import MassUploadPlayer from "@/app/components/MassUploadPlayer";
import PlayerForm from "@/app/components/coach/PlayerForm";
import { showSuccess } from "@/app/components/Toastr";
import { useSearchParams } from "next/navigation";
type PageProps = {
  params: {
    type: number;
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
  const { type } = params;
  const searchParams = useSearchParams();
  const mass = searchParams.get("mass");
  const  teamId  = '';
  const { data: session } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [teamType, setTeamType] = useState<string>("");
  const [activeTab, setActiveTab] = useState(Number(mass));

  const handleSubmitCoachForm = async (formData: any) => {
    try {
      const response = await fetch('/api/enterprise/player/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
     
      if (response.ok) {
        showSuccess("Player Added Successfully.");
         
      } else {
        console.error('Failed to add Player');
      }
    } catch (error) {
      console.error('Error adding Player:', error);
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
      setTeamType(data.team.team_type);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  useEffect(() => {
    fetchAvailablePlayers();
    setActiveTab(Number(mass))
  }, [teamId, session?.user?.id]);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
         {type==0 && (
          <h2 className="text-xl font-bold w-full text-blue-600">Invite Coach(es)</h2>
         )}
          {type==1 && (
          <h2 className="text-xl font-bold w-full text-blue-600">Invite Player(s)</h2>
         )}
          

          <div className="w-full mx-auto px-4 mt-5">
            {/* Tabs Header */}
            <div className="flex space-x-4 border-b border-gray-300">
              <button
                onClick={() => setActiveTab(0)}
                className={`tab-btn ${activeTab === 0 ? 'active-tab' : ''}`}
              >
                {type==0 && (
              <span>Add Coach Manually</span>  
            )}
            {type==1 && (
           <span>Add Player Manually</span> 
           )}
              </button>
              <button
                onClick={() => setActiveTab(1)}
                className={`tab-btn ${activeTab === 1 ? 'active-tab' : ''}`}
              >
                {type==0 && (
              <span>Mass Coach Upload</span>  
            )}
            {type==1 && (
           <span>Mass Player Upload</span> 
           )}
                
              </button>
              {/* <button
                onClick={() => setActiveTab(2)}
                className={`tab-btn ${activeTab === 2 ? 'active-tab' : ''}`}
              >
                Manual
              </button> */}
            </div>
 
            <div className="tab-content mt-4">
              {activeTab === 0 && (
                <div className="tab-panel">
                  <InviteForm usertype="Club"  teamId={''}  enterpriseId={session?.user.id ?? ''} registrationType={Number(type) === 0 ? "coach" : "player"}/>
                </div>
              )}
              {activeTab === 1 && (
                <div className="tab-panel active-tab">
                  <MassUploadPlayer usertype="Club"  teamId={''}  enterpriseId={session?.user.id ?? ''} registrationType={Number(type) === 0 ? "coach" : "player"}/>
                </div>
              )}
              {activeTab === 2 && (
                <div className="tab-panel">
                  <PlayerForm onSubmit={handleSubmitCoachForm} teamId={teamId}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
