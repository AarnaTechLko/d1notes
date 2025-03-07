"use client"; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
// Import the modal

import Loading from '@/app/components/Loading';


import { EvaluationData } from '../../types/types';
import ProfileCard from '@/app/components/players/ProfileCard';
import CoachProfileCard from '@/app/components/ProfileCard';
import LoginModal from '@/app/components/LoginModal';
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
  leage: string;
  height: number;
  weight: number;
  jersey: number;
  id: number;

}

interface CoachData {

  team_name: string;
  age_group?: string;
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
  leage?: string;
  expectedCharge: string;
  coachSlug: string;
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
  const [isRequested, setIsRequested] = useState<number>(0);
  const [coachList, setCoachList] = useState<[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isevaludationModalopen, setIsevaluationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const openCertificateModal = () => setIsCertificateModalOpen(true);
  const closeCertificateModal = () => setIsCertificateModalOpen(false);
  const [evaluationList, setEvaluationList] = useState<EvaluationData[]>([]);
  function toSentenceCase(str: string): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  // Fetch coach data
  useEffect(() => {
    const payload = { slug: slug, loggeInUser: session?.user.id };
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
        <title>Team Roster - D1 NOTES</title>
        <meta name="description" content="This is the home page of my Next.js application." />
      </head>
      <div className="container mx-auto px-4 py-8 animate-fadeIn" >


        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
          {/* First Column: Team Details */}
          <div className="flex-1 text-center flex flex-col items-center space-y-4">
            <div className="flex-shrink-0">
              <Image
                src={coachData.logo ?? '/default.jpg'}
                alt={coachData.team_name}
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            </div>

            {/* Team Info */}
            <div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800 animate-bounce-once teamname">
                  {coachData.team_name} 
                </h1>
                <p className=" text-black p-2"><span><b>Sport: </b> Soccer</span></p>
                {/* <p className="text-black p-2">
                  <b>Gender :</b> {coachData.team_type}
                </p> */}
                {coachData.team_year && (
                  <p className=" text-black p-2">
                    <span ><b>Birth Year: </b>{coachData.team_year}</span>
                  </p>
                )}
                {coachData.age_group && (
                  <p className=" text-black p-2">
                    <span ><b>Age Group: </b>{coachData.age_group}</span>
                  </p>

                )}
                {coachData.leage && (
                <p className=" text-black p-2"><span><b>League: </b> {coachData.leage}</span></p>
              )}
              </div>
            </div>

            {/* <div>
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



        {/* Header Section */}

        <div className="flex flex-col md:flex-row items-start bg-white p-6 rounded-lg   transform transition-all duration-300 hover:shadow-lg">

          {/* Profile Image and Coach Info */}
          <div className="flex flex-col md:flex-row  mb-4 md:mb-0 md:mr-4">

            <img src={coachData.cover_image} width="100%" />
            {/* Profile Image */}

          </div>


        </div>

        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Coaches
        </h2>

        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(coachList) && coachList.length > 0 ? (
              coachList.map((item: any) => (
                <CoachProfileCard
                  key={item?.teamSlug}
                  name={item.firstName}
                  organization={item.clubName} // Ensure this field is correct
                  image={item.image ?? "/default.jpg"}
                  rating={5}
                  slug={item.slug}
                  evaluation_rate={item.expectedCharge}
                />
              ))
            ) : (
              <p className="col-span-full text-left">No Coaches yet...</p>
            )}
          </div>
        </section>

        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
          Players
        </h2>
        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

            {Array.isArray(teamData) && teamData.length > 0 ? (
              teamData.map((profile: any) => (
                <div className="w-full lg:w-auto" key={profile.slug}>
                  <ProfileCard
                    key={profile.slug}
                    rating={5}
                    coachName=""
                    graduation={profile.graduation}
                    birthdate={profile.birthdate}
                    firstName={toSentenceCase(profile.firstName)}
                    lastName={toSentenceCase(profile.lastName)}
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
                </div>
              ))
            ) : (
              <p>No Players yet...</p>
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
          onRequest={() => setIsRequested(1)}
          requestToID={coachData?.id.toString()}
          type="team"
          onClose={() => setIsJoinRequestModalOpen(false)}
        />
      )}

      {/* Modals */}

    </>
  );
};

export default CoachProfile;
