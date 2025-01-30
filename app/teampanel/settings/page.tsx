"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/enterprise/Sidebar';
import { useSession } from 'next-auth/react';
import { showError, showSuccess } from '@/app/components/Toastr';
 
const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [allowedFreeRequests, setAllowedFreeRequests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data: session, status } = useSession();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
        const clubId = session?.user.id;
        const response = await fetch('/api/freerequests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ allowedFreeRequests,clubId }), // Ensure allowedFreeRequests is properly structured
          });
      if (response.status === 200) {
        showSuccess('Allowed free requests updated successfully.');
      } else {
        showError('Failed to update. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred while updating.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    const clubId = session?.user.id;
    if (!clubId) {
      console.error("Club ID is not available.");
      return;
    } 
    
    try {
      const response = await fetch(`/api/freerequests?clubId=${clubId}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText} (Status: ${response.status})`);
      }
  
      const textResponse = await response.text(); // Read response as text
      if (!textResponse) {
        throw new Error("Empty response body received.");
      }
  
      const body = JSON.parse(textResponse); // Parse text as JSON
      if (body && body.requests) {
        setAllowedFreeRequests(body.requests);
      } else {
        throw new Error("Invalid response structure.");
      }
    } catch (error) {
      console.error("Failed to fetch free requests:", error);
    }
  };
  

  useEffect(() => {
    fetchRequests();

  }, [session])

  return (
    <div className="flex bg-gradient-to-r from-blue-50 to-indigo-100 min-h-screen">
      <Sidebar />
      <main className="flex-grow bg-gray-100 p-4 overflow-auto">
        <div className="bg-white shadow-lg rounded-lg p-8  max-w-6xl">
          <h2 className="text-xl font-bold mb-4">Allowed Free Evaluation Requests</h2>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="flex flex-col md:flex-row items-left gap-4">
              <label htmlFor="allowedFreeRequests" className="font-semibold w-full md:w-2/4 mt-1">
                Enter  Requests:
              </label>
              <input
                type="number"
                id="allowedFreeRequests"
                value={allowedFreeRequests}
                onChange={(e) => setAllowedFreeRequests(Number(e.target.value))}
                min="0"
                className="w-full md:w-3/4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
