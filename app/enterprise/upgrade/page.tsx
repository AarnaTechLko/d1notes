"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Sidebar from "../../components/enterprise/Sidebar";
import { getSession, useSession, signIn } from "next-auth/react";
import Packages from "@/app/components/enterprise/Packages";
import DashboardContent from "@/app/components/enterprise/Dashboard";


const Dashboard: React.FC = () => {
    const { data: sessions } = useSession();
    const [packageId, setPackageId]=useState<number>();
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
         
          const response = await fetch('/api/packages/packagedetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              enterprise_id: session.user.id,  // Correctly send enterprise_id
            }),
          });

          const data = await response.json();
          setPackageId(data);
          if(data){
            
            setShowPackages("No");
          }
          else{
             
            setShowPackages("Yes");
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
        
  <Packages />
 
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
