"use client";

import { useState, useEffect } from "react";
import TeamModal from "@/app/components/enterprise/TeamModal";
import Sidebar from "@/app/components/coach/Sidebar";
import { useSession } from "next-auth/react";
import PlayerTransfer from "@/app/components/coach/PlayerTransfer"; 
import Link from "next/link";

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



  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6">
          <PlayerTransfer
           
            teamId={String(teamId)}
          />
        </div>
      </main>
    </div>
  );
}
