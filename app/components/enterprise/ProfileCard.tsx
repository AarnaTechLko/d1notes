import React from 'react';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';

interface ProfileCardProps {
  slug: string;
  logo: string;
  organization: string;
  country: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ organization, logo, slug, country }) => {
  const handleRedirect = (slug: string) => {
    window.location.href = `/clubs/${slug}`;
  };

  return (
    <div
      onClick={() => handleRedirect(slug)}
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
            onClick={() => handleRedirect(slug)} // Function to redirect to the bio
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
