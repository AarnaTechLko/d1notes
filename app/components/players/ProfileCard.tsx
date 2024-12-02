import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser } from 'react-icons/fa';

import DefaultImage from '../../public/default.jpg';
import { getInitialsAfterComma } from '@/lib/clientHelpers';


interface ProfileCardProps {
  coachName: string;
  jersey: number;
  firstName: string;
  lastName: string;
  image: string;
  slug: string;
  rating: number;
  position: string;
  grade_level: string;
  location: string;
  height: string;
  weight: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ coachName, jersey, firstName, lastName, image, slug, rating, position, grade_level, location, height, weight }) => {
  const positions = getInitialsAfterComma(position);
  const handleRedirect = (slug: string) => {
    //console.log(slug);
    window.location.href = `/players/${slug}`;
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));

  return (
    <>
     <div className="max-w-sm bg-white rounded-lg shadow-lg p-6 relative group">
  {/* Profile Image Container */}
  <div className="relative w-full h-64">
    <Image
      src={image}
      alt={firstName}
      layout="fill"
      className="object-cover rounded-lg"
    />

    {/* Overlay on hover */}
    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
      {/* Link in the middle of the overlay */}
      <a 
        href="#" 
        className="bg-white text-black py-2 px-4 rounded-full text-lg font-semibold"
      >
        View Full Bio
      </a>
    </div>

    {/* Jersey Badge */}
    <div className="absolute top-4 right-4 bg-maroon-500 text-white text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center jersyBlock">
      {jersey}
    </div>
  </div>

  {/* Profile Info Section */}
  <div className="mt-4 text-left">
    <p className="text-gray-500 text-lg snap-center cursor-pointer teampagefont" onClick={() => handleRedirect(slug)}>
      {firstName}
    </p>
    <h2 className="text-2xl font-bold text-gray-800 snap-center cursor-pointer teampagefont" onClick={() => handleRedirect(slug)}>
      {lastName}
    </h2>
    <hr className="my-2 w-8 border-blue-500" />
    <p className="text-gray-500 mt-2 teampagefont">{positions}</p>

    <p className="text-gray-500 teampagefont">
      {height}/ {weight} Lbs.
    </p>
    <p className="text-gray-600 teampagefont">{grade_level}</p>
  </div>
</div>




    </>
  );
};

export default ProfileCard;
