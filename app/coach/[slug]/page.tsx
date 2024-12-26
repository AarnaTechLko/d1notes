"use client"; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import LoginModal from '../../components/LoginModal'; // Import the modal
import EvaluationModal from '@/app/components/EvaluationModal';
import Loading from '@/app/components/Loading';
import CertificateModal from '@/app/components/CertificateModal';
import defaultImage from '../../public/default.jpg'
import { EvaluationData } from '../../types/types';
import JoinRequestModal from '@/app/components/JoinRequestModal';




interface CoachData {
 
  firstName: string;
  lastName: string;
  id:  string;
  expectedCharge:  number;
  createdAt:  string;
  slug: string;
  rating: number;
  gender: string;
  location: string;
  sport: string;
  clubName: string;
  qualifications: string;
  country: string;
  state: string;
  city: string;
  certificate: string;
  image:string;
  enterprise_id:number;
}

interface CoachProfileProps {
  params: {
    slug: string;
  };
}
interface Kids {
  id: string;
  first_name: string;
  last_name: string;
}

const CoachProfile = ({ params }: CoachProfileProps) => {
  const { slug } = params;
  const [coachData, setCoachData] = useState<CoachData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isevaludationModalopen, setIsevaluationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRequested, setIsRequested] = useState<number>(0);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { data: session } = useSession();
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [playerClubId,setPlayerClubid]=useState<string>('')
  const openCertificateModal = () => setIsCertificateModalOpen(true);
  const closeCertificateModal = () => setIsCertificateModalOpen(false);
  const [evaluationList, setEvaluationList] = useState<EvaluationData[]>([]);
  const [kids, setKids]=useState<Kids[] | undefined>(undefined);
  

  useEffect(() => {
    const fetchKids = async () => {
    
      let playerId;
       if(!session)
       {
         console.log("You are not a player.");
       }
       else{
        playerId=session.user.id
       }
    
        try {
          const response = await fetch('/api/player/children', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerId }),
          });
    
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
    
          const data = await response.json();
          setKids(data);
        } catch (error) {
          console.error(error);
        } finally {
           
        }
      };

    const payload = { slug: slug , loggeInUser:session?.user.id};
    const fetchCoachData = async () => {
      try {
        const response = await fetch(`/api/coachprofile/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Coach not found');
        }

        const responseData = await response.json();
setCoachData(responseData.coachdata);
setIsRequested(responseData.isRequested);
 
setEvaluationList(responseData.evaluationlist);
      } catch (err) {
        setError("Some error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchKids()
    fetchCoachData();
    setPlayerId(session?.user?.id || null);
    setPlayerClubid(session?.user?.club_id || '')
  }, [session, slug]);

  if (loading) {
    return <Loading />;
  }
  if (error) return <div>{error}</div>;
  if (!coachData) return <div>Coach not found</div>;

  const joiningDate = new Date(coachData.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < coachData.rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));
  return (
    <>
     <head>
    <title>Coach Roster - D1 NOTES</title>
    <meta name="description" content="This is the home page of my Next.js application." />
  </head>
      <div className="container mx-auto px-4 py-8 animate-fadeIn z-0" >
        {/* Header Section */}
       
        <div className="flex flex-col md:flex-row items-start bg-white p-6 rounded-lg  transition-all duration-300 hover:shadow-lg  z-1">
  {/* Profile Image and Coach Info */}
  <div className="flex flex-col md:flex-row md:w-2/3 mb-4 md:mb-0 md:mr-4">
    {/* Profile Image */}
    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
    {coachData.image && coachData.image !== 'null' && (
      <Image
        src={coachData.image ??  '/default.jpg'}
        alt={`${coachData.firstName} ${coachData.lastName}`}
        width={200}
        height={200}
        className="rounded-full object-cover"
      />
    )}
    {coachData.image && coachData.image == 'null' && (
      <Image
        src={'/default.jpg'}
        alt={`${coachData.firstName} ${coachData.lastName}`}
        width={200}
        height={200}
        className="rounded-full object-cover"
      />
    )}


    </div>

    {/* Coach Info */}
    <div className="text-center md:text-left">
      <h1 className="text-3xl font-bold text-gray-800 animate-bounce-once">
        {coachData.firstName} {coachData.lastName}
      </h1>
      <p className="text-gray-600 text-lg">
        {coachData.sport} Coach at {coachData.clubName}
      </p>

      {/* Rating */}
      <div className="flex items-center justify-center md:justify-start mt-2">
      <div className="mt-1">{stars}</div>
      
      </div>
      <span className="text-yellow-500 text-2xl">{coachData.rating}</span>
      <span className="ml-2 text-gray-500">/ 5.0</span>
    </div>
  </div>

  {/* Additional Text and Button */}
  <div className="md:w-1/3 text-center md:text-left">
  <div>
    {session ? (
              <div className="mt-2 flex justify-center items-center text-sm text-gray-500">
                <span>Rate</span>
                <p className="ml-2">  ${coachData.expectedCharge}</p>
              </div>
            ) : (
              <></>
            )}

{!(session && session.user && session.user.type === 'coach') && (
  <>
    {!session ? (
      <button
        onClick={() => setIsModalOpen(true)} // Open modal on click
        className="mt-6 bg-customBlue text-black px-4 py-2 rounded-md hover:bg-blue-600 hover:text-white"
      >
        Sign in to book
      </button>
    ) : (
      <button
        onClick={() => setIsevaluationModalOpen(true)} // Open modal on click
        className="mt-6 bg-blue-500 text-black px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Proceed to Evaluation
      </button>
    )}
  </>
)}

</div>

<div>
  {session?.user?.type !== 'coach' && (
    <>
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
    </>
  )}
</div>

  </div>
  
</div>




        {/* Contact Info Section */}
        <h2 className="text-lg font-semibold mt-5 bg-customBlue text-black p-4 rounded-lg">
    General Information
  </h2>
        <section className="bg-white-50 p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">

   
  <div className="flex flex-col md:flex-row md:space-x-8">
    {/* Column 1 */}
    <div className="flex-1 mb-4 md:mb-0">
      <ul className="space-y-4">
        <li><strong>Rate per evaluation:</strong> {coachData.expectedCharge} USD</li>
        <li><strong>Sport :</strong> {coachData.sport}</li>
        <li><strong>Title/ organization(s)/Affilication(s):</strong> {coachData.clubName}</li>
        <li><strong>Gender:</strong> {coachData.gender}</li>
        
      </ul>
    </div>
    
    {/* Column 2 */}
    <div className="flex-1">
      <ul className="space-y-4">
      <li><strong>Location:</strong> {coachData.location}</li>
        <li><strong>Country:</strong> {coachData.country}</li>
        <li><strong>State:</strong> {coachData.state}</li>
        <li><strong>City:</strong> {coachData.city}</li>
      </ul>
    </div>
  </div>
</section>

<h2 className="text-lg font-semibold mt-5  bg-customBlue text-black p-4 rounded-lg">
Qualification & Certifications
  </h2>
<section className="bg-white p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">
 
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* First Column: Qualifications */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Qualifications</h3>
      <p className="text-gray-700">
        {coachData.qualifications}
      </p>
    </div>

    {/* Second Column: Certificate */}
    <div>
      <h3 className="text-lg font-semibold mb-2">Certificate</h3>
      {coachData.certificate ? (
        <button
          onClick={openCertificateModal}
          className="text-blue-500 underline hover:text-blue-700 transform transition-all duration-300"
        >
          View Certification
        </button>
      ) : (
        <p className="text-gray-500">No certificate available</p>
      )}
    </div>
  </div>

  {/* Modal */}
 
</section>

{isCertificateModalOpen && (
    <CertificateModal  certificate={coachData.certificate} closeCertificateModal={closeCertificateModal}/>
    
  )}

<h2 className="text-lg font-semibold mt-5  bg-customBlue text-black p-4 rounded-lg">
Previous Evaluations
  </h2>
  <section className="mt-8 bg-gray-50 p-0 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg animate-fadeInDelay">
  {evaluationList.length > 0 ? (

    
    <ul className="space-y-4">
      {evaluationList.map((evaluation, index) => {
        const stars = Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < evaluation.rating ? 'text-yellow-500' : 'text-gray-300'}>
            ★
          </span>
        ));

        return (

        <li key={index} className="bg-white p-4 rounded-lg shadow flex items-center">
          {/* Circular Image */}
          {evaluation.image && evaluation.image !== 'null' && (
  <Image
    src={evaluation.image}
    alt={`Evaluation by ${evaluation.review_title}`}
    width={50}
    height={50}
    className="rounded-full object-cover mr-4"
  />
)}
{(!evaluation.image || evaluation.image === 'null') && (
  <Image
    src={defaultImage}
    alt={`Evaluation by ${evaluation.review_title}`}
    width={50}
    height={50}
    className="rounded-full object-cover mr-4"
  />
)}
         
          
          {/* Review Title and Other Details */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">{evaluation.review_title}</h3>
            <p>{evaluation.first_name} {evaluation.last_name}</p>
          </div>

          {/* Rating Column */}
          <div>
            <p className="text-gray-600">Rating:
            {stars}    
               {evaluation.rating || 0} / 5</p>
          </div>
        </li>
      );
    })}
    </ul>
  ) : (
    <p className="text-gray-500">No evaluations available.</p>
  )}
</section>
 
      </div>

      {/* Modals */}
      {isModalOpen && (
        <LoginModal isOpen={isModalOpen} coachslug={coachData.slug} onClose={() => setIsModalOpen(false)} />
      )}

      {isevaludationModalopen && playerId && (
        <EvaluationModal
          amount={coachData.expectedCharge}
          isOpen={isevaludationModalopen}
          coachId={coachData.id}
          playerId={playerId}
          onClose={() => setIsevaluationModalOpen(false)}
          kids={kids}
          coachClubId={coachData.enterprise_id}
          playerClubId={Number(playerClubId)}
        />
      )}

{isJoinRequestModalOpen  && playerId && (
        <JoinRequestModal 
        isOpen={isJoinRequestModalOpen} 
        requestToID={coachData?.id.toString()}
        
        type="coach"
        onRequest={()=> setIsRequested(1)}
        onClose={() => setIsJoinRequestModalOpen(false)}
        />
      )}
    </>
  );
};

export default CoachProfile;
