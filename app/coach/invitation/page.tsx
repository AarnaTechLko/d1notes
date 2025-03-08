"use client";
import React, { useEffect, useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import Sidebar from '../../components/coach/Sidebar';
import InviteForm from '@/app/components/InviteForm';

const Home: React.FC = () => {
  

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-md rounded-lg p-6 h-auto">
          
        </div>
      </main>
    </div>
  );
};

export default Home;
