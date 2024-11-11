import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react'; // Import getSession to retrieve user session
import EvaluationsTable from './EvaluationsTable';
import { EvaluationsByStatus } from '../types/types'; // Adjust path as needed

const DashboardTabs: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationsByStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Requested' | 'Accepted' | 'Completed' | 'Declined'>('Requested');

  const fetchEvaluations = async (status: string) => {
    setLoading(true); // Set loading to true at the start of the fetch

    try {
      // Retrieve the session to get user ID
      const session = await getSession();
      const userId = session?.user.id; 
      console.log(userId);

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // POST request to your API endpoint
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status, // Pass the active tab status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }

      const data: EvaluationsByStatus = await response.json();
      setEvaluations(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
          setError(err.message); // Access the message property safely
      } else {
          setError("An unexpected error occurred."); // Handle non-Error cases
      }
  } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    console.log("check"+activeTab);
    fetchEvaluations(activeTab);
  }, [activeTab]); // Dependency on activeTab to refetch when it changes

  const tabs = [
    { id: '0', label: 'Requested' },
    { id: '1', label: 'Accepted' },
    { id: '2', label: 'Completed' },
    { id: '3', label: 'Declined' },
  ];

  const activeEvaluations = evaluations ? evaluations[activeTab] || [] : [];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="flex justify-center items-center space-x-4 border-b pb-2">
        {tabs.map(tab => (
         
          <button
            key={tab.id}
            className={`p-2 font-semibold ${activeTab === tab.id ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              // Fetch evaluations whenever the tab is changed
              fetchEvaluations(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-4">
         
      </div>
    </div>
  );
};

export default DashboardTabs;
