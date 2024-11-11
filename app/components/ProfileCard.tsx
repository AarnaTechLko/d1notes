import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser } from 'react-icons/fa';
 

interface ProfileCardProps {
  slug: string;
  name: string;
  organization: string;
  image: string;
  rating: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, organization, image, rating,slug }) => {
  const handleRedirect = (slug: string) => {
    //console.log(slug);
    window.location.href = `/coach/${slug}`;
  };
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));

  return (
    <>
    <div
  onClick={() => handleRedirect(slug)}
  className="flex-none w-64 h-150 bg-white rounded-lg shadow-md mt-5 overflow-hidden snap-center"
  key={slug}
>
  <Image
    src={image}
    alt={name}
    width={200}
    height={200}
    className="rounded-lg object-cover w-full h-[200px]"
  />
  <div className="text-center mt-4">
    <h3 className="text-lg font-semibold">{name}</h3>
    
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
