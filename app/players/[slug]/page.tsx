"use client"; // Ensure this is a client component

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Loading from '@/app/components/Loading';
import ProfileCard from '@/app/components/teams/ProfileCard';
import Profile from '@/app/coach/profile/page';

interface Profile {
  slug: string;
  enterpriseName: string;
  firstName: string;
  lastName: string;
  image?: string;
  position: string;
  grade_level: string;
  location: string;
  height: number;
  weight: number;

}

interface RestTeam {
  playerId: string;
  playerName: string;
  last_name: string;
  position: string;
  image?: string;
  slug?: string;
}

interface CoachData {
  first_name: string;
  last_name: string;
  jersey: string;
  position: string;
  createdAt: string;
  location: string;
  image: string;
  weight: string;
  height: string;
  team: string;
  grade_level: string;
}

interface CoachProfileProps {
  params: {
    slug: string;
  };
}

const CoachProfile = ({ params }: CoachProfileProps) => {
  const { slug } = params;
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [teamData, setTeamData] = useState<Profile[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [restTeams, setRestTeams] = useState<RestTeam[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0); // Track the current banner index
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const payload = { slug: slug };
    const fetchCoachData = async () => {
      try {
        const response = await fetch(`/api/player/profile/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Club not found');
        }

        const responseData = await response.json();
        setCoachData(responseData.clubdata);
        setBanners(responseData.banners.map((banner: any) => banner.filepath));
        setTeamData(responseData.teamplayersList);
        setTeams(responseData.playerOfTheTeam);
        setRestTeams(responseData.teamPlayers);
      } catch (err) {
        setError('Some error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
  }, [slug]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentBanner((prevBanner) => (prevBanner + 1) % banners.length);
    }, 3000); // Change banner every 3 seconds

    return () => clearInterval(intervalId);
  }, [banners]);

  if (loading) {
    return <Loading />;
  }

  if (error) return <div>{error}</div>;
  if (!coachData) return <div>Club not found</div>;

  const joiningDate = new Date(coachData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <div className="container-fluid mx-auto px-4 py-8 animate-fadeIn mb-44">
        <div className="grid grid-cols-[1fr_5fr] gap-5">
        <div>
  <h3 className="text-lg font-semibold mb-4">Player List</h3>
  <ul className="space-y-4">
    {restTeams.map((item) => (
      <li
        key={item.playerId}
        className="flex items-center space-x-4 bg-gray-100 p-4 rounded-md shadow-md"
      >
       <a href={`/players/${item.slug}`}>
        <img
          src={item.image || '/default.jpg'} // Use a default image if player.image is null
          alt={item.playerName}
          className="w-16 h-16 object-cover rounded-full border border-gray-300"
        /></a>
        
        <a href={`/players/${item.slug}`}>
        <div>
          <h4 className="text-md font-medium">{item.playerName} {item.last_name}</h4>
          <p className="text-sm text-gray-600">Position: {item.position}</p>
        </div>
        </a>
      </li>
    ))}
  </ul>
</div>

          <div>
          <div className="relative overflow-hidden w-full h-[500px]">
  {banners.length > 0 ? (
    banners.map((banner, index) => (
      <div
        key={index}
        className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out ${
          index === currentBanner ? 'transform translate-x-0' : 'transform -translate-x-full'
        }`}
      >
        <img
          src={banner}
          alt={`Banner ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
    ))
  ) : (
    <div className="absolute top-0 left-0 w-full h-full">
      <img
        src="/default-cover.jpg"
        alt="Default Banner"
        className="w-full h-full object-cover"
      />
    </div>
  )}
</div>

          </div>
        </div>


        <div className="absolute left-1/2 transform -translate-x-1/2 top-[500px]  w-full shadow-lg rounded-lg p-4 grid grid-cols-[1fr_2fr] gap-4">
          {/* Image Section */}
          <div className="flex justify-end items-right">
            <img
              src={coachData.image ?? '/default.jpg'}
              alt="Player Thumbnail"
              className="w-[180px] h-[220px] object-cover border-2 border-gray-300"
            />
          </div>

          {/* Text Section */}
          <div className="flex flex-col justify-start items-start">
            <h3 className="text-4xl font-semibold text-white text-stroke mt-8">
              <span className="bg-blue-500 text-xl p-2 text-white">{coachData.jersey}</span> {coachData.first_name} {coachData.last_name}
            </h3>

            <div className='bg-white p-6 w-full mt-7'>
              <div className="grid grid-cols-2 gap-5">
                <div><b>Position:</b> {coachData.position}</div>
                <div><b>Playing Location:</b> {coachData.location}</div>
                <div><b>Weight:</b> {coachData.weight} Lbs</div>
                <div><b>Height:</b> {coachData.height}</div>
                <div><b>Team:</b> {coachData.team}</div>
                <div><b>Grade Level:</b> {coachData.grade_level}</div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-4 mb-20">
        <h2 className="text-2xl font-semibold mb-4">Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teams.map((item: any) => {
            console.log(item); // Check the structure of item
            return (
              <ProfileCard
                key={item?.teamSlug}
                creatorname={item.creatorName}
                teamName={item.teamName} // Ensure `team_name` is correct
                logo={item.logo ?? '/default.jpg'}
                rating={5}
                slug={item.teamSlug}
              />
            );
          })}

        </div>
      </div>
    </>
  );
};

export default CoachProfile;
