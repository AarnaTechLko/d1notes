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
import PlayerProfileCard from '@/app/components/players/ProfileCard';
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';




interface CoachData {

  organizationName: string;
  contactPerson: string;
  address: string;

  createdAt: string; 
  slug: string;

  country: string;
  country_name: string;
  state: string;
  city: string;

  logo: string;
  id: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  xlink: string;
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
  const [playerList, setPlayerList] = useState<[] | []>([]);
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
  function toSentenceCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  const openCertificateModal = () => setIsCertificateModalOpen(true);
  const closeCertificateModal = () => setIsCertificateModalOpen(false);
  const [evaluationList, setEvaluationList] = useState<EvaluationData[]>([]);

  // Fetch coach data
  useEffect(() => {
    const payload = { slug: slug, loggeInUser: session?.user.id };
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
        console.log("Country data", responseData.country);
        setCoachData(responseData.clubdata);
        setTeamData(responseData.clubTeams);
        setCoachList(responseData.coachesList);
        setIsRequested(responseData.isRequested);
        setPlayerList(responseData.clubPlayers);

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
             <p> <strong>Sport: </strong> Soccer</p>
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
              {/* <p className="text-gray-600 text-lg">Club</p> */}
              {/* <div className="flex items-center justify-center md:justify-start mt-2">
                <div className="mt-1">{stars}</div>
              </div>
              <div className="flex items-center justify-center md:justify-start mt-2">
                <span className="text-yellow-500 text-2xl">5</span>
                <span className="ml-2 text-gray-500">/ 5.0</span>
              </div> */}
            </div>
            {/* Right Section */}
            <div className="flex flex-col items-center md:items-end">
              <ul className="space-y-4">
                <li>
                  <strong>Address:</strong> {coachData.address}
                </li>
                <li>
                  <strong>Country:</strong> {coachData.country_name}
                </li>
                <li>
                  <strong>State/Province:</strong> {coachData.state}
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {teamData && teamData.length > 0 ? (
              teamData.map((item: any) => {
                console.log(item); // Check the structure of item
                return (
                  <ProfileCard
                    key={item?.teamSlug}
                    creatorname={item.creatorName}
                    teamName={item.team_name} // Ensure `team_name` is correct
                    logo={item.logo ?? '/default.jpg'}
                    rating={5}
                    slug={item.slug}
                  />
                );
              })
            ) : (
              <p className="text-black-500 text-lg">No Teams added yet...</p>
            )}
          </div>

        </section>

        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Coaches
        </h2>
        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {coachList && coachList.length > 0 ? (
              coachList.map((item: any) => (
                <CoachProfileCard
                  key={item?.teamSlug}
                  name={item.firstName}
                  organization={item.clubName} // Ensure `clubName` is correct
                  image={item.image ?? '/default.jpg'}
                  rating={5}
                  slug={item.slug}
                />
              ))
            ) : (
              <p className="text-black-500 text-lg">No Coaches added yet....</p>
            )}
          </div>

        </section>


        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Players
        </h2>
        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {playerList && playerList.length > 0 ? (
              playerList.map((profile: any) => (
                <PlayerProfileCard
                  key={profile.slug}
                  rating={5}
                  coachName=""
                  graduation={profile.graduation}
                  birthdate={profile.birthday}
                  firstName={toSentenceCase(profile.first_name)}
                  lastName={toSentenceCase(profile.last_name)}
                  image={profile.image ?? "/default.jpg"}
                  jersey={profile.jersey}
                  slug={profile.slug}
                  position={toSentenceCase(profile.position)}
                  grade_level={toSentenceCase(profile.grade_level)}
                  location={toSentenceCase(profile.location)}
                  height={profile.height}
                  weight={profile.weight}
                  facebook={profile.facebook}
                  instagram={profile.instagram}
                  linkedin={profile.linkedin}
                  youtube={profile.youtube}
                  xlink={profile.xlink}
                />
              ))
            ) : (
              <p className="text-black-500 text-lg">No Players added yet...</p>
            )}
          </div>

        </section>






      </div>
      {isModalOpen && (
        <LoginModal isOpen={isModalOpen} coachslug={coachData.slug} onClose={() => setIsModalOpen(false)} />
      )}

      {isJoinRequestModalOpen && playerId && (
        <JoinRequestModal
          isOpen={isJoinRequestModalOpen}
          requestToID={coachData?.id}
          onRequest={() => setIsRequested(1)}
          type="club"
          onClose={() => setIsJoinRequestModalOpen(false)}
        />
      )}



    </>
  );
};

export default CoachProfile;
