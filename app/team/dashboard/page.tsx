"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Sidebar from "@/app/components/teams/Sidebar";
import { getSession, useSession, signIn } from "next-auth/react";
import Packages from "@/app/components/enterprise/Packages";
import DashboardContent from "@/app/components/enterprise/Dashboard";
import InviteForm from "@/app/components/InviteForm";


const Dashboard: React.FC = () => {
    const { data: sessions } = useSession();
    const [packageId, setPackageId]=useState<number>();
    const [clubName, setClubName]=useState<string>();
    const [coachName, setCoachName]=useState<string>();
    const [showPackages, setShowPackages]=useState<string>('No');
    const fetchPackages = async () => {
        try {
          // Fetch session to get enterprise_id
          const session = await getSession();
      
          if (!session || !session.user.id) {
            console.error('No Enterprise found in session');
            return;
          }
      
          // Include enterprise_id in the query string
         
          const response = await fetch('/api/teams/clubdetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              club_id: session.user.club_id,  // Correctly send enterprise_id
              coach_id: session.user.coach_id,  // Correctly send enterprise_id
            }),
          });

          const data = await response.json();
         
          if(data){
           /// setClubName
           setClubName(data.clubData[0].enterprises); 
           setCoachName(data.coachData[0].firstName+' '+data.coachData[0].lastName); 
          }
          else{
             
             
          }
        } catch (error) {
          console.error('Error fetching packages:', error);
        }
      };
    useEffect(() => {
        fetchPackages();
      }, []);

  return ( 
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-x-auto">
        <div className="bg-white shadow-md rounded-lg p-6 ">
        <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
  Club: {clubName} 
</span>
<span className="inline-block bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full ml-5">
  Coach: {coachName} 
</span>
          
        </div>
        <div className="bg-white shadow-md rounded-lg p-6 ">
        
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
