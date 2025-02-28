"use client";
import React, { useEffect, useState } from "react";
import "../../globals.css";
import Sidebar from "../../components/enterprise/Sidebar";
import { getSession, useSession, signIn } from "next-auth/react";

import PurchaseLicense from "@/app/components/PurchaseLicense";



const Dashboard: React.FC = () => {
  const { data: sessions } = useSession();
   
  
  return (
    <div className="flex h-screen bg-gradient-to-r from-blue-50 to-purple-50">
      <Sidebar />
      <main className="flex-grow p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
      <PurchaseLicense  organizationId={sessions?.user.id || ''} type={sessions?.user.type || ""}/>
      
    </div>
    </main>
    </div>
  );
};

export default Dashboard;

