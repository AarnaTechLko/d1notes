import React from 'react';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
import { getSession } from 'next-auth/react';
import { showError } from '../Toastr';
import Swal from 'sweetalert2';

interface ProfileCardProps {
  slug: string;
  id: string;
  logo: string;
  organization: string;
  country: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ organization, logo, slug, country,id }) => {
  
  const handleRedirect =async (slug: string, id:string) => {
    const session = await getSession();
    if(session)
    {
      if(session?.user?.type=='coach' || session?.user?.type=='player')
      {
       //// window.location.href = `/enterprise/${slug}`;
      
      if(session.user.club_id==id)
      {
        window.location.href = `/enterprise/${slug}`;
      }
      else{
        Swal.fire({
          title: 'Unauthorized!',
          text: 'Only logged in members of this Organization may access.',
          icon: 'error', // 'success' displays a green checkmark icon
          confirmButtonText: 'OK',
        });
        
      }
    }
    else{
      window.location.href = `/enterprise/${slug}`;
    }
    }
    else{
      Swal.fire({
        title: 'Unauthorized!',
        text: 'Only logged in members and administrators of this Organization / Team may view.',
        icon: 'error', // 'success' displays a green checkmark icon
        confirmButtonText: 'OK',
      });
    
    }
  };

  return (
    <><div className="max-w-sm bg-white rounded-lg shadow-lg p-6 relative group">
    {/* Profile Image Container */}
    <div className="relative w-full h-64">
  
    {logo && logo !== 'null' && (
      <Image
        src={logo}
        alt={organization}
        layout="fill"
        className="object-cover rounded-lg"
      />
    )}
     {logo && logo == 'null' && (
      <Image
        src={'/default.jpg'}
        alt={organization}
        layout="fill"
        className="object-cover rounded-lg"
      />
    )}
  
  
  
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
        {/* Link in the middle of the overlay */}
        <a 
         onClick={() => handleRedirect(slug,id)}
          className="bg-white text-black py-2 px-4 rounded-full text-lg font-semibold cursor-pointer"
        >
          View Details
        </a>
      </div>
  
    </div>
  
    {/* Profile Info Section */}
    <div className="text-center mt-4">
        <h3 className="text-lg font-semibold">{organization}</h3>
        <p>Sport: Soccer</p>
        </div>
    
  </div>
 
  </>
    
  );
};

export default ProfileCard;
