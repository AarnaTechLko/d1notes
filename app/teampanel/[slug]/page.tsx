"use client"; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
// Import the modal
import defaultImage from '../../public/default.jpg'
import Loading from '@/app/components/Loading';
import JoinRequestModal from '@/app/components/JoinRequestModal';
import { EvaluationData } from '../../types/types';
import ProfileCard from '@/app/components/teams/ProfileCard';
import CoachProfileCard from '@/app/components/ProfileCard';
import LoginModal from '@/app/components/LoginModal';




interface CoachData {

  organizationName: string;
  contactPerson: string;
  address: string;

  createdAt: string;
  slug: string;

  country: string;
  state: string;
  city: string;

  logo: string;
  id: string;
}

interface CoachProfileProps {
  params: {
    slug: string;
  };
}

const CoachProfile = ({ params }: CoachProfileProps) => {
  const { slug } = params;
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [coachList, setCoachList] = useState<[] | []>([]);
  const [teamData, setTeamData] = useState<[] | null>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRequested, setIsRequested] = useState<number>(0);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  const openCertificateModal = () => setIsCertificateModalOpen(true);
  const closeCertificateModal = () => setIsCertificateModalOpen(false);
  const [evaluationList, setEvaluationList] = useState<EvaluationData[]>([]);

  // Fetch coach data
  useEffect(() => {
    const payload = { slug: slug,loggeInUser:session?.user.id };
    const fetchCoachData = async () => {
      try {
        const response = await fetch(`/api/enterprise/profile/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Club not found');
        }

        const responseData = await response.json();
        setCoachData(responseData.clubdata);
        setTeamData(responseData.clubTeams);
        setCoachList(responseData.coachesList);
        setIsRequested(responseData.isRequested);

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
    <title>Club Roster - D1 NOTES</title>
    <meta name="description" content="This is the home page of my Next.js application." />
  </head>
      <div className="container mx-auto px-4 py-8 animate-fadeIn" >


        <div className="mx-auto px-4 py-8 transition-all duration-300 hover:shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Left Section */}
            <div className="flex flex-col items-center justify-center md:items-end">

             

{coachData.logo && coachData.logo !== 'null' && (
              <Image
                src={coachData.logo}
                alt={`${coachData.organizationName}`}
                width={150}
                height={150}
                className="rounded-full object-cover"
              />
            )}
            {(!coachData.logo || coachData.logo === 'null') && (
              <Image
                src={defaultImage}
                alt={`${coachData.organizationName}`}
                width={150}
                height={150}
                className="rounded-full object-cover"
              />

            )}
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h1 className="text-3xl font-bold text-gray-800 animate-bounce-once">
                {coachData.organizationName}
              </h1>
              <p className="text-gray-600 text-lg">Club</p>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <div className="mt-1">{stars}</div>
              </div>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <span className="text-yellow-500 text-2xl">5</span>
                <span className="ml-2 text-gray-500">/ 5.0</span>
              </div>
            </div>
            {/* Right Section */}
            <div className="flex flex-col items-center md:items-end">
              <ul className="space-y-4">
                <li>
                  <strong>Address:</strong> {coachData.address}
                </li>
                <li>
                  <strong>Country:</strong> {coachData.country}
                </li>
                <li>
                  <strong>State:</strong> {coachData.state}
                </li>
                <li>
                  <strong>City:</strong> {coachData.city}
                </li>
              </ul>
            </div>
            {/* <div className="flex flex-col items-center ">

            {!session ? (
  <>
    {isRequested > 0 ? (
      <button
        className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
        disabled
      >
        Requested
      </button>
    ) : (
      <button
        onClick={() => setIsModalOpen(true)} // Open modal on click
        className="mt-6 bg-customBlue text-black px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white"
      >
        Request to Join
      </button>
    )}
  </>
) : (
  <>
    {isRequested > 0 ? (
      <button
        className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
        disabled
      >
        Requested
      </button>
    ) : (
      <button
        onClick={() => setIsJoinRequestModalOpen(true)} // Open modal on click
        className="mt-6 bg-blue-500 text-black px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Request to Join
      </button>
    )}
  </>
)}
              </div> */}
          </div>
        </div>

        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Teams
        </h2>
        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

          <div className="flex flex-col md:flex-row md:space-x-8">
          {teamData?.map((item: any) => {
            console.log(item); // Check the structure of item
            return (
              <ProfileCard
                key={item?.teamSlug}
                creatorname={item.creatorName}
                teamName={item.teamName} // Ensure `team_name` is correct
                logo={item.logo ?? '/default.jpg'}
                rating={5}
                slug={item.slug}
              />
            );
          })}

          </div>
        </section>

        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Coaches
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






      </div>
      {isModalOpen && (
        <LoginModal isOpen={isModalOpen} coachslug={coachData.slug} onClose={() => setIsModalOpen(false)} />
      )}

      {isJoinRequestModalOpen  && playerId && (
        <JoinRequestModal 
        isOpen={isJoinRequestModalOpen} 
        requestToID={coachData?.id}
        onRequest={()=> setIsRequested(1)}
        type="club"
        onClose={() => setIsJoinRequestModalOpen(false)}
        />
      )}

     

    </>
  );
};

export default CoachProfile;
