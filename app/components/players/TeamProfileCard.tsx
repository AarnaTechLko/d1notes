import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser } from 'react-icons/fa';
import { getSession } from 'next-auth/react';
import Swal from 'sweetalert2';
 

interface ProfileCardProps {
  teamName: string;
  logo: string;
  rating: number;
  sport: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ teamName, logo, rating, sport}) => {
  
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));

  return (
    <><div className="max-w-sm bg-white rounded-lg shadow-lg p-6 relative group">
    {/* Profile Image Container */}
    <div className="relative w-full h-64">
  
    {logo && logo !== 'null' && (
      <Image
        src={logo}
        alt={teamName}
        layout="fill"
        className="object-cover rounded-lg"
      />
    )}
     {logo && logo == 'null' && (
      <Image
        src={'/default.jpg'}
        alt={teamName}
        layout="fill"
        className="object-cover rounded-lg"
      />
    )}
  
    </div>
  
    {/* Profile Info Section */}
    <div className="text-center mt-4">
        <h3 className="text-lg font-semibold">{teamName}</h3>
        <p>Sport: Soccer</p>
        </div>
    
  </div>
 
  </>
  );
};

export default ProfileCard;
