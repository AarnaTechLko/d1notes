import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
interface StatsData {
  totalCoaches: number;
  totalPlayers: number;
  activeLicenses: number;
  consumeLicenses: number;
}

const Dashboard: React.FC = () => {
  const API_ENDPOINT = '/api/enterprise/dashboard'; // Define the API endpoint here

  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
        const session = await getSession();

  if (!session?.user?.id) {
    throw new Error('User is not logged in.');
  }

  const enterprise_id = session.user.id; 
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINT, {
            method: 'POST', // Specify POST request
            headers: {
              'Content-Type': 'application/json', // Set the content type to JSON
            },
            body: JSON.stringify({ enterprise_id:enterprise_id}), // Replace with your data payload
          });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: StatsData = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-lg">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div className="p-4 text-center">No data available.</div>;
  }

  const statsArray = [
    { label: 'Total Coaches', value: stats.totalCoaches, bgColor: 'bg-blue-500', icon: '🧑‍🏫' },
    { label: 'Total Players', value: stats.totalPlayers, bgColor: 'bg-green-500', icon: '⚽' },
    { label: 'Licenses Available', value: stats.activeLicenses, bgColor: 'bg-yellow-500', icon: '🎫' },
    { label: 'Licenses Consumed', value: stats.consumeLicenses, bgColor: 'bg-red-500', icon: '🔥' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {statsArray.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center`}
        >
          <div className="text-4xl mb-2">{stat.icon}</div>
          <h3 className="text-lg font-semibold">{stat.label}</h3>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
