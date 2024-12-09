"use client"; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
// Import the modal

import Loading from '@/app/components/Loading';


import { EvaluationData } from '../../types/types';
import ProfileCard from '@/app/components/players/ProfileCard';
import CoachProfileCard from '@/app/components/ProfileCard';


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
  jersey: number;
}

interface CoachData {

  team_name: string;
  created_by: string;
  description: string;
  cover_image: string;
  createdAt: string;
  slug: string;
  logo: string;
  qualifications: string;
  firstName: string;
  lastName: string;
  coachimage: string;
  team_type: string;
  team_year: string;
   
  coachSlug: string;
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
  const [coachList, setCoachList] = useState<[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isevaludationModalopen, setIsevaluationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const openCertificateModal = () => setIsCertificateModalOpen(true);
  const closeCertificateModal = () => setIsCertificateModalOpen(false);
  const [evaluationList, setEvaluationList] = useState<EvaluationData[]>([]);
  function toSentenceCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  // Fetch coach data
  useEffect(() => {
    const payload = { slug: slug };
    const fetchCoachData = async () => {
      try {
        const response = await fetch(`/api/teams/profile/`, {
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
        setCoachList(responseData.coach);

      } catch (err) {
        setError("Some error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
    setPlayerId(session?.user?.id || null);

  }, [session, slug]);

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
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < 5 ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));
  return (
    <>
     <head>
    <title>Team Roster - D1 NOTES</title>
    <meta name="description" content="This is the home page of my Next.js application." />
  </head>
      <div className="container mx-auto px-4 py-8 animate-fadeIn" >
        

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
  {/* First Column: Team Details */}
  <div className="flex-1 text-center flex flex-col items-center space-y-4">
    <div className="flex-shrink-0">
      <Image
        src={coachData.logo}
        alt={coachData.team_name}
        width={120}
        height={120}
        className="rounded-full object-cover"
      />
    </div>

    {/* Team Info */}
    <div>
      <h1 className="text-3xl font-bold text-gray-800 animate-bounce-once teamname">
        {coachData.team_name}
      </h1>
      <p className="text-gray-600 text-lg">
       <b>Team For :</b> {coachData.team_type}
      </p>
      <p className="text-gray-600 text-lg">
      <b>Year :</b> {coachData.team_year}
      </p>
    </div>

        
   
  </div>

   


</div>

<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
<h2 className="text-xl font-bold text-gray-800 animate-bounce-once teamname">About Team</h2>
 
</div>
<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
 
<p>{coachData.description}</p>
</div>


        {/* Header Section */}

        <div className="flex flex-col md:flex-row items-start bg-white p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg">

          {/* Profile Image and Coach Info */}
          <div className="flex flex-col md:flex-row  mb-4 md:mb-0 md:mr-4">

            <img src={coachData.cover_image} width="100%" />
            {/* Profile Image */}

          </div>


        </div>

        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Coach
        </h2>

        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

<div className="flex flex-col md:flex-row md:space-x-8">
{coachList?.map((item: any) => {
  
  return (
    <CoachProfileCard
      key={item?.teamSlug}
      name={item.firstName}
      organization={item.clubName} // Ensure `team_name` is correct
      image={item.image ?? '/default.jpg'}
      rating={5}
      slug={item.slug}
    />
  );
})}

</div>
</section>
        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Players
        </h2>
        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

 {teamData?.map((profile:any) => (
                <div className="w-full lg:w-auto" key={profile.slug}>
                  <ProfileCard
                    key={profile.slug}
                    rating={5}
                    coachName=''
                   
                    firstName={toSentenceCase(profile.firstName)}
                    lastName={toSentenceCase(profile.lastName)}
                    image={profile.image ?? '/default.jpg'}
                    jersey={profile.jersey}
                    slug={profile.slug}
                    position={toSentenceCase(profile.position)}
                    grade_level={toSentenceCase(profile.grade_level)}
                    location={toSentenceCase(profile.location)}
                    height={profile.height}
                    weight={profile.weight}
                  />


                </div>
              ))}

          </div>
        </section>
      </div>

      {/* Modals */}

    </>
  );
};

export default CoachProfile;
