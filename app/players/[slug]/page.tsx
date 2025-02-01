"use client"; // Ensure this is a client component

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Loading from '@/app/components/Loading';
import ProfileCard from '@/app/components/teams/ProfileCard';
import CoachProfileCard from '@/app/components/ProfileCard';
import PlayerProfileCard from '../../components/players/ProfileCard'
import Profile from '@/app/coach/profile/page';
import JoinRequestModal from '@/app/components/JoinRequestModal';

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
  graduation: string;
  id: number;
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
  const [coaches, setCoaches] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [restTeams, setRestTeams] = useState<RestTeam[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0); // Track the current banner index
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coachId, setCoachId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isRequested, setIsRequested] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  
  function toSentenceCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  useEffect(() => {
    const payload = { slug: slug };
    setCoachId(session?.user?.id ?? null);
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
        setCoaches(responseData.coachesList || []);
      } catch (err) {
        setError('Some error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
  }, [slug,session]);

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
     <head>
    <title>Player Roster - D1 NOTES</title>
    <meta name="description" content="This is the home page of my Next.js application." />
  </head>
      <div className="container-fluid mx-auto px-4 py-8 animate-fadeIn mb-64">
        <div className="grid  gap-5">
  

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
        src="/footbal.jpg"
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
 
          {coachData.image && coachData.image !== 'null' && (
            <img
              src={coachData.image ?? '/default.jpg'}
              alt="Player Thumbnail"
              className="w-[180px] h-[220px] object-cover border-2 border-gray-300"
            />
          )}

{ coachData.image === 'null' && (
            <img
              src='/default.jpg'
              alt="Player Thumbnail"
              className="w-[180px] h-[220px] object-cover border-2 border-gray-300"
            />
          )}

{ coachData.image === null && (
            <img
              src='/default.jpg'
              alt="Player Thumbnail"
              className="w-[180px] h-[220px] object-cover border-2 border-gray-300"
            />
          )}
          </div>

          {/* Text Section */}
          <div className="flex flex-col justify-start items-start">
            <h3 className="text-4xl font-semibold text-white text-stroke mt-8">
              <span className="bg-blue-500 text-xl p-2 text-white">#{coachData.jersey || '-'}</span> {coachData.first_name} {coachData.last_name}
            </h3>

            <div className='bg-white p-6 w-full mt-7'>
              <div className="grid grid-cols-2 gap-5">
                <div><b>Position:</b> {coachData.position}</div>
                <div><b>High School Graduation:</b> {coachData.graduation}</div>
                <div><b>Weight:</b> {coachData.weight} Lbs</div>
                <div><b>Height:</b> {coachData.height}</div>
                <div><b>Team:</b> {coachData.team}</div>
                <div><b>Grade Level:</b> {coachData.grade_level}</div>
              </div>
              <div>
              {session?.user?.type === "team" && (
  <>
    {isRequested > 0 ? (
      <button
        className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
        disabled
      >
        Invited
      </button>
    ) : (
      <button
      onClick={() => setIsJoinRequestModalOpen(true)}// Open modal on click
        className="mt-6 bg-customBlue text-black px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white"
      >
        Invite to Join
      </button>
    )}
  </>
)}


            </div>
            </div>
            
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-4 mb-20">
      <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Coaches
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {coaches.length > 0 ? (
  coaches.map((item: any) => (
    <CoachProfileCard
      key={item.id}
      name={item.coachFirstName}
      organization={item.clubName}
      image={item.coachImage ?? '/default.jpg'}
      rating={item.rating}
      slug={item.slug}
    />
  ))
) : (
  <p>No Coach Associated</p>
)}

        </div>
      <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Teams
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.length > 0 ? (
          teams.map((item: any) => (
          
            <ProfileCard
                key={item?.teamSlug}
                creatorname={item.creatorName}
                teamName={item.teamName} // Ensure `team_name` is correct
                logo={item.logo ?? '/default.jpg'}
                rating={5}
                slug={item.teamSlug}
              />
          ) )) : (
            <p>No Team(s) Associated</p>
          )}
        </div>

        {/* <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Teammates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {restTeams.length > 0 ? (
          restTeams.map((item: any) => (
            <PlayerProfileCard
            key={item.playerSlug}
            rating={5}
            coachName=''
           
            firstName={toSentenceCase(item.firstName)}
            lastName={toSentenceCase(item.lastName)}
            image={item.image ?? '/default.jpg'}
            jersey={item.jersey}
            slug={item.playerSlug}
            position={toSentenceCase(item.position)}
            grade_level={toSentenceCase(item.grade_level)}
            location={toSentenceCase(item.location)}
            height={item.height}
            weight={item.weight}
            graduation={item.graduation}
            />
          ) )) : (
            <p>No Teammates Found</p>
          )}


          

 
        </div>*/}
      </div> 


      {isJoinRequestModalOpen && coachId && (
        <JoinRequestModal
          isOpen={isJoinRequestModalOpen}
          onRequest={() => setIsRequested(1)}
          requestToID={coachData?.id.toString()}
          type="team"
          onClose={() => setIsJoinRequestModalOpen(false)}
        />
      )}
    </>
  );
};

export default CoachProfile;
