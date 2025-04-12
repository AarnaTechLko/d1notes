import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser } from 'react-icons/fa';
import { getSession } from 'next-auth/react';
import Swal from 'sweetalert2';
 

interface ProfileCardProps {
  slug: string;
  teamName: string;
  logo: string;
  rating: number;
  teamId: number;
  playerId: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ teamName, logo, rating,slug, teamId, playerId }) => {
  
  const handleRedirect =async (slug: string) => {

    // console.log("team Id: ", teamId)

    // console.log("player type: ", type)

    // console.log("player id: ", playerId)

    // const session = await getSession();

    if (playerId === 0){
      window.location.href = `/teams/${slug}`;
    }
    else if (playerId === teamId){
      window.location.href = `/teams/${slug}`;
    }
    else{

      Swal.fire({
        title: 'Unauthorized!',
        text: 'Only logged in members and administrators of this Organization / Team may view.',
        icon: 'error',
        confirmButtonText: 'OK',
      })
    }
    // if(playerId === teamId)
    // {
    //  window.location.href = `/teams/${slug}`;
    // }
    // else{
    // Swal.fire({
    //     title: 'Unauthorized!',
    //     text: 'Only logged in members and administrators of this Organization / Team may view.',
    //     icon: 'error', // 'success' displays a green checkmark icon
    //     confirmButtonText: 'OK',
    //   });
    // }
  // window.open(`/teams/${slug}`, '_blank');
  };
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
  
  
  
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
        {/* Link in the middle of the overlay */}
        <a 
         onClick={() => handleRedirect(slug)}
          className="bg-white text-black py-2 px-4 rounded-full text-lg font-semibold cursor-pointer"
        >
          View Details
        </a>
      </div>
  
    </div>
  
    {/* Profile Info Section */}
    <div className="text-center mt-4">
        <h3 className="text-lg font-semibold">{teamName}</h3>
        <p>Sport:Soccer</p>
        </div>
    
  </div>
 
  </>
  );
};

export default ProfileCard;
