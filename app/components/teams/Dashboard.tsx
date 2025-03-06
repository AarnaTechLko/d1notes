import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import Joyride, { CallBackProps, STATUS } from "react-joyride";
interface StatsData {
  totalCoaches: number;
  totalPlayers: number;
  activeLicenses: number;
  consumeLicenses: number;
  totalTeams: number;
}

const Dashboard: React.FC = () => {
  const API_ENDPOINT = '/api/teampanel/dashboard'; // Define the API endpoint here
  const [run, setRun] = useState(true); 
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    {
      target: ".dashboard-step",
      content: "Let’s get started! First, purchase evaluations for your Organization. Next, create teams by clicking on Your Teams in the left side menu. Finally, add Sub Admin(s) if you wish to add additional administrators.",
      placement: "right" as const,
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED) {
      setRun(false); // Keep the tour from running permanently after finish
    }
  };
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
    { label: 'Total Coaches', value: stats.totalCoaches, bgColor: 'bg-blue-500', icon:  <img src="/coachIcon.png" alt="Team Icon" className="h-12 w-12 filter brightness-[1000] contrast-[200]" /> },
    { label: 'Total Players', value: stats.totalPlayers, bgColor: 'bg-green-500', icon: <img src="/playerIcon.png" alt="Team Icon" className="h-12 w-12" /> },
    
    
    { label: 'Evaluations Used', value: stats.consumeLicenses, bgColor: 'bg-red-500', icon: '🔥' },
    { label: 'Evaluations Available', value: stats.activeLicenses, bgColor: 'bg-yellow-500', icon: '🎫' },
   
  ]; 

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 p-2">
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
