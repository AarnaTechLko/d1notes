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

      
      if(session.user.club_id==id)
      {
        window.location.href = `/enterprise/${slug}`;
      }
      else{
        Swal.fire({
          title: 'Unauthorized!',
          text: 'Only Associated  Members and Administrators of this Organization / Team may view.',
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
        text: 'Only logged in Members and Administrators of this Organization / Team may view.',
        icon: 'error', // 'success' displays a green checkmark icon
        confirmButtonText: 'OK',
      });
    
    }
  };

  return (
    <div
      onClick={() => handleRedirect(slug,id)}
      className="flex-none w-64 h-150 bg-white rounded-lg shadow-md mt-5 overflow-hidden snap-center cursor-pointer"
      key={slug}
    >
      {/* Colorful background wrapper for the image */}
      <div className="w-[200px] h-[200px] rounded-full m-auto flex items-center justify-center bg-black">
        <Image
          src={logo}
          alt={organization}
          width={190}
          height={190}
          className="object-cover w-[170px] h-[170px] rounded-full"
        />
      </div>
      <div className="text-center mt-4">
        <h3 className="text-lg font-semibold">{organization}</h3>

        {/* Bio Icon Section */}
        <div className="mt-2 flex justify-center">
          <button
           onClick={(e) => {
            e.stopPropagation(); // Prevent event bubbling
            handleRedirect(slug, id);
          }}
            className="flex items-center space-x-2 text-gray-500 mb-5"
          >
            <FaUser />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
