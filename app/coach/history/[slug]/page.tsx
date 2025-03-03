"use client"; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import LoginModal from '../../../components/LoginModal'; // Import the modal
import EvaluationModal from '@/app/components/EvaluationModal';
import Loading from '@/app/components/Loading';
import CertificateModal from '@/app/components/CertificateModal';
import defaultImage from '../../../public/default.jpg'
import { EvaluationData } from '../../../types/types';
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
  currency:string;
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
 
<h2 className="text-lg font-semibold mt-5  bg-customBlue text-black p-4 rounded-lg">
Evaluation History
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
               <div>
            <p className="text-gray-600">Rating:
            {stars}    
               {evaluation.rating || 0} / 5</p>
<div className=' mt-5'>
               <a href={`/evaluationdetails?evaluationId=${evaluation.id}`} className='' target='_blank'>View Evaluation</a>
               </div>
          </div>
          </div>
        </li>
      );
    })}
    </ul>
  ) : (
    <p className="text-gray-500">No history available.</p>
  )}
</section>
 
      </div>

    

      
 
    </>
  );
};

export default CoachProfile;
