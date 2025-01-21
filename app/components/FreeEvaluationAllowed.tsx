"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { showError, showSuccess } from '@/app/components/Toastr';

interface FreeEvaluationAllowedProps {
  isOpen: boolean;
  onClose: () => void;
  freeRequests:number;
}

const FreeEvaluationAllowed: React.FC<FreeEvaluationAllowedProps> = ({ isOpen, onClose,freeRequests }) => {
  const [allowedFreeRequests, setAllowedFreeRequests] = useState(freeRequests);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { data: session } = useSession();

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
        body: JSON.stringify({ allowedFreeRequests, clubId }),
      });
      if (response.status === 200) {
        onClose();
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

      const textResponse = await response.text();
      if (!textResponse) {
        throw new Error("Empty response body received.");
      }

      const body = JSON.parse(textResponse);
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
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Allowed Free Evaluation Requests</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row items-left gap-4">
  <label htmlFor="allowedFreeRequests" className="font-semibold w-full md:w-2/4 mt-1">
    Enter Requests:
  </label>
  <select
    id="allowedFreeRequests"
    value={allowedFreeRequests}
    onChange={(e) => setAllowedFreeRequests(Number(e.target.value))}
    className="w-full md:w-3/4 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
  >
    {Array.from({ length: 10 }, (_, index) => (
      <option key={index + 1} value={index + 1}>
        {index + 1}
      </option>
    ))}
  </select>
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
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FreeEvaluationAllowed;
