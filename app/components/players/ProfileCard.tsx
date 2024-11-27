import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser } from 'react-icons/fa';
 

interface ProfileCardProps {
    coachName: string;
    enterpriseName: string;
    firstName: string;
    lastName: string;
    image: string;
    slug: string;
    rating: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ coachName, enterpriseName, firstName, lastName,image,slug,rating }) => {
  const handleRedirect = (slug: string) => {
    //console.log(slug);
    window.location.href = `/players/${slug}`;
  };
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
<div className="w-[200px] h-[200px] rounded-full m-auto flex items-center justify-center bg-red-700">
  <Image
    src={image}
    alt={firstName}
    width={160}
    height={160}
    className="object-cover w-[170px] h-[170px] rounded-full"
  />
  </div>
  <div className="text-center mt-4">
    <h3 className="text-lg font-semibold">{firstName} {lastName}</h3>
    <h3 className="text-sm "><b>Coach:</b> {coachName}</h3>
    <h3 className="text-sm "><b>Club:</b> {enterpriseName ?? "Not Associated to any Club"}</h3>
    
    <div className="mt-2 flex justify-center">
      <div className="mt-1">{stars}</div>
    </div>
    {/* Bio Icon Section */}
    <div className="mt-2 flex justify-center">
      <button 
        onClick={() => handleRedirect(slug)} // Function to redirect to the bio
        className="flex items-center space-x-2 text-gray-500"
      >
       <FaUser/>
        <span>View Bio</span>
      </button>
    </div>
  </div>
</div>
    
    </>
  );
};

export default ProfileCard;
