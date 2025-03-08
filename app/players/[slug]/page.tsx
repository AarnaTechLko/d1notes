"use client"; // Ensure this is a client component

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Loading from '@/app/components/Loading';
import ProfileCard from '@/app/components/teams/ProfileCard';
import ClubProfileCard from '@/app/components/enterprise/ProfileCard';
import PlayerProfileCard from '../../components/players/ProfileCard'
import Profile from '@/app/coach/profile/page';
import JoinRequestModal from '@/app/components/JoinRequestModal';
import { FaFacebook, FaInstagram, FaLinkedin, FaUser, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
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
  facebook: string;
  instagram: string;
  linkedin: string;
  xlink: string;
  youtube: string;
  id: number;
  school_name: string;
  gpa: string;
  sport: string;
  playingcountries: string;
  countryName: string;
  age_group: string;
  birth_year:string;
  gender: string;
  state: string;
  city: string;
  bio: string;
  league: string;
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
  const [organizations, setOrganization] = useState<string[]>([]);
  const [clubName, setClubName] = useState<string | null>(null);
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
        
        setTeamData(responseData.teamplayersList);
        setTeams(responseData.playerOfTheTeam);
        setRestTeams(responseData.teamPlayers);
        setCoaches(responseData.coachesList || []);
        if(responseData.clubname)
        {
          setClubName(responseData.clubname.clubname);
        }
        
      } catch (err) {
        setError('Some error occurred.:'+err);
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
      <div className="container mx-auto px-4 py-8 animate-fadeIn ">
      <div className="flex flex-col md:flex-row items-start bg-white p-6 rounded-lg  transition-all duration-300 hover:shadow-lg  z-1">
          {/* Profile Image and Coach Info */}
          <div className="flex flex-col md:flex-row  mb-4 md:mb-0 md:mr-4">
            {/* Profile Image */}
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
              {coachData.image && coachData.image !== 'null' && (
                <Image
                  src={coachData.image ?? '/default.jpg'}
                  alt={`${coachData.first_name} ${coachData.last_name}`}
                  width={200}
                  height={200}
                  className="rounded-full object-cover"
                />
              )}
              {coachData.image && coachData.image == 'null' && (
                <Image
                  src={'/default.jpg'}
                  alt={`${coachData.first_name} ${coachData.last_name}`}
                  width={200}
                  height={200}
                  className="rounded-full object-cover"
                />
              )}


            </div>

            {/* Coach Info */}
            <div className="text-left md:text-left">
            <h3 className="text-4xl font-semibold text-blue-500 text-stroke mt-8">
  {coachData?.jersey && (
    <span className="bg-blue-500 text-xl text-white px-4 py-2 rounded-full w-10 h-10 inline-flex items-center justify-center">
      #{coachData.jersey || '-'}
    </span>
  )}{" "}
  {coachData.first_name} {coachData.last_name}
</h3>

            <div className="flex space-x-4 ml-11  mt-3 mb-3 h-5">
                {coachData.facebook && (
                  <a href={coachData.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
                    <FaFacebook size={25} />
                  </a>
                )}
                {coachData.instagram && (
                  <a href={coachData.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500">
                    <FaInstagram size={25} />
                  </a>
                )}
                {coachData.linkedin && (
                  <a href={coachData.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
                    <FaLinkedin size={25} />
                  </a>
                )}
                {coachData.xlink && (
                  <a href={coachData.xlink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">
                    <FaXTwitter size={25} />
                  </a>
                )}
                {coachData.youtube && (
                  <a href={coachData.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600">
                    <FaYoutube size={25} />
                  </a>
                )}
              </div>
            <div className='bg-white p-6 w-full mt-4'>
              <div className="grid grid-cols-3 gap-5">
                {/* <div><b>Organization Name:</b> {clubName}</div> */}
                <div><b>Position(s):</b> {coachData.position ?? "N/A"}</div>
                <div><b>Graduation Year (High School):</b> {coachData.graduation ?? "N/A"}</div>
                 <div><b>Weight (lbs):</b> {coachData.weight ?? "N/A"}</div>  
                <div><b>Height:</b> {coachData.height ?? "N/A"}</div>
                <div><b>School Name:</b> {coachData.school_name ?? "N/A"}</div>
                <div><b>GPA:</b> {coachData.gpa ?? "N/A"}</div>
                <div><b>Sport(s):</b> {coachData.sport ?? "N/A"}</div>
                <div><b>Nationality(ies):</b> {coachData.playingcountries ?? "N/A"}</div>
                <div><b>Gender:</b> {coachData.gender ?? "N/A"}</div>
                <div><b>Team Name(s):</b> {coachData.team ?? "N/A"}</div>
                <div><b>Level:</b> {coachData.grade_level ?? "N/A"}</div>
                <div><b>Country:</b> {coachData.countryName ?? "N/A"}</div>
                <div><b>State:</b> {coachData.state ?? "N/A"}</div>
                <div><b>City:</b> {coachData.city ?? "N/A"}</div>
                
              </div>
              <div className="grid grid-cols-3 gap-5 mt-4">
            {/*   <div><b>City:</b> {coachData.city ?? "N/A"}</div> */}
            {/* { birth_year && (
          <p className="text-gray-500 teampagefont">
            <b>Birth Year: </b>{birth_year}
          </p>
        )}
        { birth_year && (
          <p className="text-gray-500 teampagefont">
            <b>Age Group: </b>{age_group}
          </p>
          )} */}
          { coachData.age_group && (
              <div><b>Age Group:</b> {coachData.age_group ?? "N/A"}</div>
            )}
            { coachData.birth_year && (
              <div><b>Birth Year:</b> {coachData.birth_year ?? "N/A"}</div>
            )}
            
              </div>
              <div className="grid grid-cols-1 gap-5 mt-4">
              <div><b>League(s):</b> {coachData.league ?? "N/A"}</div>
              
              </div>
              <div className="grid grid-cols-1 gap-5 mt-4">
              <div><b>Experience/Accolades:</b> {coachData.bio ?? "N/A"}</div>
              
              </div>
              {/* <div>
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


            </div> */}
            </div>
              
              
            </div>
          </div>
 

        </div>

      
    
      </div>
      <div className="container mx-auto mt-4 mb-20">
      <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Organization
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {organizations.length > 0 ? (
  organizations.map((item: any) => (
    <ClubProfileCard
      key={item.id}
   
      organization={item.organizationName}
      logo={item.logo ?? '/default.jpg'}
      id={item.id}
      country={item.country}
      slug={item.slug}
    />
  ))
) : (
  <p>No Organizations added yet..</p>
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
            <p>No Teams added yet...</p>
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
