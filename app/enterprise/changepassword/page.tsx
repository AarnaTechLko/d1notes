"use client";
import React from 'react';
import Sidebar from '../../components/enterprise/Sidebar';
import ChangePassword from '../../components/ChangePassword';

const Home: React.FC = () => {
     
    return (
        <div className="flex h-screen overflow-hidden ">
            <Sidebar />
            <main className="flex-grow bg-gray-100 p-4 overflow-auto ">
                <div className="bg-white shadow-md rounded-lg p-6   h-svh">
                    <ChangePassword/>
                    
                </div>
            </main>
        </div>
    );
};

export default Home;
