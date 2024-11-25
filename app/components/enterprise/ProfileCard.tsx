import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUser } from 'react-icons/fa';
 

interface ProfileCardProps {
  slug: string;
  logo:string;
  organization: string;
  country:string;
   
}

const ProfileCard: React.FC<ProfileCardProps> = ({ organization, logo,slug, country }) => {
  const handleRedirect = (slug: string) => {
    //console.log(slug);
    window.location.href = `/clubs/${slug}`;
  };
 

  return (
    <>
    <div
  onClick={() => handleRedirect(slug)}
  className="flex-none w-64 h-150 bg-white rounded-lg shadow-md mt-5 overflow-hidden snap-center cursor-pointer"
  key={slug}
>
  <Image
    src={logo}
    alt={organization}
    width={200}
    height={200}
    className="rounded-lg object-cover w-full h-[200px]"
  />
  <div className="text-center mt-4">
    <h3 className="text-lg font-semibold">{organization}</h3>
   
    {/* Bio Icon Section */}
    <div className="mt-2 flex justify-center">
      <button 
        onClick={() => handleRedirect(slug)} // Function to redirect to the bio
        className="flex items-center space-x-2 text-gray-500"
      >
       <FaUser/>
        <span>View Details</span>
      </button>
    </div>
  </div>
</div>
    
    </>
  );
};

export default ProfileCard;
