import React, { useEffect, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Prompt } from 'next/font/google';
import PromptComponent from '../Prompt';
interface StatsData {
  totalCoaches: number;
  totalPlayers: number;
  activeLicenses: number;
  consumeLicenses: number;
  totalTeams: number;
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
    { label: 'Total Coaches', value: stats.totalCoaches, bgColor: 'bg-blue-500', icon:  <img src="/coachIcon.png" alt="Team Icon" className="h-12 w-12 filter brightness-[1000] contrast-[200]" /> },
    { label: 'Total Players', value: stats.totalPlayers, bgColor: 'bg-green-500', icon: <img src="/playerIcon.png" alt="Team Icon" className="h-12 w-12" /> },
    { 
      label: 'Total Teams', 
      value: stats.totalTeams, 
      bgColor: 'bg-pink-500', 
      icon: <img src="/teamIcon.png" alt="Team Icon" className="h-12 w-12 filter invert" />,
    },
    { label: 'Evaluations Available', value: stats.activeLicenses, bgColor: 'bg-yellow-500', icon: '🎫' },
    { label: 'Evaluations Used', value: stats.consumeLicenses, bgColor: 'bg-red-500', icon: '🔥' },
  ];

  return (
    <>
    <PromptComponent marginleft={2} stepstext="Let’s get started! First, purchase evaluations for your Organization. Next, create teams by clicking on Your Teams in the left side menu. Finally, add Sub Admin(s) if you wish to add additional administrators."/>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 p-2">
      {statsArray.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} text-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center`}
        >
          <div className="text-4xl mb-2">{stat.icon}</div>
          <h3 className="text-[15px] font-semibold">{stat.label}</h3>
          <p className="text-[18px] font-bold">{stat.value}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 bg-white  mt-4 p-6">
          <h3 className='font-bold text-lg'>Quick Tips</h3>

          <h3 className='font-bold text-lg mt-4'>Visibilityn</h3>
          <p>Ensure your Public Visibility in the menu is on so that players seeking individual game film evaluations can find your profile in the coach marketplace. If you would like to go through a quick D1 Notes verification process to enhance your profile with a “D1 Verified” badge, <a href="/contact" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> to email and let us know! Upon receiving an evaluation request, you can either accept or politely decline it with a comment. A completed evaluation will look like this [[[for now, show a blank field player evaluation form]]]. You may search players in the marketplace and see their limited information, but you cannot click through to see all of their details, nor contact them until they request an evaluation from you. If your Public Visibility is off, you will not show up in the coach marketplace.</p>

<h3 className='font-bold text-lg mt-4'>Time and Rate Explanation</h3>
<p>In order to add pricing tiers to your base evaluation rate based on faster maximum evaluation turnaround times, <a href="coach/charges" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or on Time and Rate in the menu. The default rate is your base evaluation rate and the default turnaround time is 60 hours or 5 days (the maximum time). Adding tiers to your oﬀering is optional. If you would like to modify your base evaluation rate, <a href="coach/charges" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or on Time and Rate in the menu, or <a href="coach/profile" target="_blank" className="text-blue-600 hover:text-blue-800 ">click here</a> or edit your Profile in Settings.</p>

<h3 className='font-bold text-lg mt-4'>Enterprises / Your Teams Explanation</h3>
<p>Only if you have been added by an organization or single team that is using D1 Notes’ Enterprises (white label) capabilities, you can view that organization’s or single team’s internal / private information by <a href="/coach/teams" target="_blank" className="text-blue-600 hover:text-blue-800 ">clicking here</a> or on Your Teams in the menu. From here, you can navigate through your team(s) and view the coaches and players on your roster(s). These players will automatically not be charged any rate as your organization / team has already paid for them.</p>

<h3 className='font-bold text-lg mt-4'>Sending Messages</h3>
<p>The Messages function in the menu allows you to communicate with any player in Your Teams as well as communicate further with any player in the marketplace once you have accepted their evaluation request.</p>


        </div>
    </>
  );
};

export default Dashboard;
