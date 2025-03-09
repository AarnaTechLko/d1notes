import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser, FaFacebook, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

import EvaluationModal from './EvaluationModal';
import { useSession } from 'next-auth/react';
import { FaYoutube } from 'react-icons/fa';
 

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
  facebook?:string;
  instagram?:string;
  linkedin?:string;
  xlink?:string;
  youtube?:string;
  evaluation_rate?:number;
  evaluationCount?:number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, organization, image, rating,slug,usedIn,expectedCharge,id,playerClubId,coachClubId,freeEvaluations,allowedFreeRequests,facebook,instagram,linkedin,xlink,evaluation_rate,youtube,evaluationCount }) => {
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
    <div className="max-w-sm bg-white rounded-lg shadow-lg p-6 relative group"
  key={slug}
>
<div className="relative w-full h-64">
  <Image
    src={image === 'null' || !image ? '/default.jpg' : image}
    alt={name}
    width={200}
    height={200}
    className="rounded-lg object-cover w-full h-[200px]"
    onClick={() => handleRedirect(slug)}
  />
  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
      {/* Link in the middle of the overlay */}
      <a 
        href={`/coach/${slug}`}
        className="bg-white text-black py-2 px-4 rounded-full text-lg font-semibold"
      >
        View Details
      </a>
    </div>
    </div>
  <div className="text-center mt-4">
    <h3 className="text-lg font-semibold"  onClick={() => handleRedirect(slug)}>{name}</h3>
    <p>Sport: Soccer</p>
     <div className="mt-2 flex justify-center">
      <div className="mt-1">${evaluation_rate}</div>
    </div>
     <div className="mt-2 flex justify-center">
      <div className="mt-1">{stars} ({evaluationCount})</div>
    </div>
    {/* Bio Icon Section */}
    <div className="flex space-x-4 justify-center mt-3 mb-3 h-5">
      {facebook &&(
    <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
      <FaFacebook size={20} />
    </a>
      )}
       {instagram &&(
    <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500">
      <FaInstagram size={20} />
    </a>
     )}
     {linkedin &&(
    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
      <FaLinkedin size={20} />
    </a>
     )}
    {xlink &&(
    <a href={xlink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">
      <FaXTwitter size={20} />
    </a>
     )}
    {youtube &&(
    <a href={youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600">
      <FaYoutube size={20} />
    </a>
     )}
  </div>
    {/* <div className="mt-2 flex justify-center">

      <button 
        onClick={() => handleRedirect(slug)} // Function to redirect to the bio
        className="flex items-center space-x-2 text-gray-500 mb-5"
      >
        
       <FaUser/>
        <span>View Bio</span>
      </button>
    </div> */}
    
  
  </div>
</div>
{usedIn && (
  <div className="mt-2 flex justify-center">
  <button 
    onClick={() =>handleRedirect(slug)} // Function to redirect to the bio
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
