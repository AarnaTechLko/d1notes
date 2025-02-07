import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser } from 'react-icons/fa';
import EvaluationModal from './EvaluationModal';
import { useSession } from 'next-auth/react';
 

interface ProfileCardProps {
  slug: string;
  name: string;
  organization: string;
  image: string;
  rating: number;
  usedIn?:string;
  expectedCharge?:number;
  id?:number;
  playerClubId?:number;
  freeEvaluations?:number;
  allowedFreeRequests?:number;
  coachClubId?:number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, organization, image, rating,slug,usedIn,expectedCharge,id,playerClubId,coachClubId,freeEvaluations,allowedFreeRequests }) => {
  const handleRedirect = (slug: string) => {
    //console.log(slug);
    window.open(`/coach/${slug}`, '_blank');
  };
  const [isevaluationModalopen,setIsevaluationModalOpen]=useState(false);
  const [playerId,setPlayerId]=useState<string>('');
  const { data: session } = useSession();
useEffect(()=>{
  setPlayerId(session?.user?.id || '');
},[session])
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));

  return (
    <>
    <div
  onClick={() => handleRedirect(slug)}
  className="flex-none w-64 h-150 bg-white rounded-lg shadow-md mt-5 overflow-hidden snap-center cursor-pointer"
  key={slug}
>
  <Image
    src={image === 'null' || !image ? '/default.jpg' : image}
    alt={name}
    width={200}
    height={200}
    className="rounded-lg object-cover w-full h-[200px]"
  />
  <div className="text-center mt-4">
    <h3 className="text-lg font-semibold">{name}</h3>
    
    {/* <div className="mt-2 flex justify-center">
      <div className="mt-1">{stars}</div>
    </div> */}
    {/* Bio Icon Section */}
    <div className="mt-2 flex justify-center">
      <button 
        onClick={() => handleRedirect(slug)} // Function to redirect to the bio
        className="flex items-center space-x-2 text-gray-500 mb-5"
      >
       <FaUser/>
        <span>View Bio</span>
      </button>
    </div>
    
  
  </div>
</div>
{usedIn && (
  <div className="mt-2 flex justify-center">
  <button 
    onClick={() =>setIsevaluationModalOpen(true)} // Function to redirect to the bio
    className="flex items-center space-x-2 bg-blue-600 text-white p-2 rounded-smmb-5"
  >
  Request Evaluation{isevaluationModalopen}
  </button>
</div>
    )}
{isevaluationModalopen}

{isevaluationModalopen && playerId && (
        <EvaluationModal
          amount={expectedCharge || 0}
          isOpen={isevaluationModalopen}
          coachId={String(id)}
          playerId={playerId}
          freeEvaluations={freeEvaluations}
          allowedFreeRequests={allowedFreeRequests}
          onClose={() => setIsevaluationModalOpen(false)}
          coachClubId={coachClubId}
          playerClubId={playerClubId}
        />
      )}


    </>
  );
};

export default ProfileCard;
