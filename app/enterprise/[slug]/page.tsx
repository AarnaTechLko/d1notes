"use client"; // Ensure this is a client component

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
// Import the modal

import Loading from '@/app/components/Loading';


import { EvaluationData } from '../../types/types';




interface CoachData {
 
    organizationName: string;
    contactPerson: string;
    address:  string;
    
  createdAt:  string;
  slug: string;
 
  country: string;
  state: string;
  city: string;
 
  logo:string;
}

interface CoachProfileProps {
  params: {
    slug: string;
  };
}

const CoachProfile = ({ params }: CoachProfileProps) => {
  const { slug } = params;
  const [coachData, setCoachData] = useState<CoachData | null>(null);
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
  
  // Fetch coach data
  useEffect(() => {
    const payload = { slug: slug };
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
      <div className="container mx-auto px-4 py-8 animate-fadeIn" >
        {/* Header Section */}
       
        <div className="flex flex-col md:flex-row items-start bg-white p-6 rounded-lg shadow-md transform transition-all duration-300 hover:shadow-lg">
  {/* Profile Image and Coach Info */}
  <div className="flex flex-col md:flex-row md:w-2/3 mb-4 md:mb-0 md:mr-4">
    {/* Profile Image */}
    <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-4">
      <Image
        src={coachData.logo}
        alt={`${coachData.organizationName}`}
        width={200}
        height={200}
        className="rounded-full object-cover"
      />
    </div>

    {/* Coach Info */}
    <div className="text-center md:text-left">
      <h1 className="text-3xl font-bold text-gray-800 animate-bounce-once">
        {coachData.organizationName}
      </h1>
      <p className="text-gray-600 text-lg">
       Club
      </p>

      {/* Rating */}
      <div className="flex items-center justify-center md:justify-start mt-2">
      <div className="mt-1">{stars}</div>
      
      </div>
      <span className="text-yellow-500 text-2xl">5</span>
      <span className="ml-2 text-gray-500">/ 5.0</span>
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
        <li><strong>Address:</strong> {coachData.address} USD</li>
        <li><strong>Country :</strong> {coachData.country}</li>
        <li><strong>State:</strong> {coachData.state}</li>
        <li><strong>City:</strong> {coachData.city}</li>
        
      </ul>
    </div>
    
    {/* Column 2 */}
    {/* <div className="flex-1">
      <ul className="space-y-4">
      <li><strong>Location:</strong> {coachData.location}</li>
        <li><strong>Country:</strong> {coachData.country}</li>
        <li><strong>State:</strong> {coachData.state}</li>
        <li><strong>City:</strong> {coachData.city}</li>
      </ul>
    </div> */}
  </div>
</section>

 


 


 
      </div>

      {/* Modals */}
     
    </>
  );
};

export default CoachProfile;
