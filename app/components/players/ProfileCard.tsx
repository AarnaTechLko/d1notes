import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaFacebook, FaInstagram, FaLinkedin, FaUser, FaYoutube } from 'react-icons/fa';

import DefaultImage from '../../public/default.jpg';
import { getInitialsAfterComma } from '@/lib/clientHelpers';
import { FaXTwitter } from 'react-icons/fa6';


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
  graduation: string;
  birthdate: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  xlink?: string;
  sport?: string;
  age_group?: string;
  birth_year?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ coachName, jersey, firstName, lastName, image, slug, rating, position, grade_level, location, height, weight, graduation, birthdate, facebook,
  instagram,
  linkedin,
  youtube,
  xlink, sport, age_group,birth_year }) => {
  //const positions = getInitialsAfterComma(position);
  const positions = position;
  const handleRedirect = (slug: string) => {
    //console.log(slug);
    window.location.href = `/players/${slug}`;
  };

  const extractYear = (birthdate: string) => {
    return new Date(birthdate).getUTCFullYear(); // Use getUTCFullYear() to ensure correct year
  };

  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < rating ? 'text-yellow-500' : 'text-gray-300'}>★</span>
  ));

  const formatDate = (isoString: string) => {
    if (isoString) {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    }
    else {
      return '<></>';
    }

  };

  const formattedDate = formatDate(birthdate);
  return (
    <>
      <div className="max-w-sm bg-white rounded-lg shadow-lg p-6 relative group">
        {/* Profile Image Container */}
        <div className="relative w-full h-64">

          {image && image !== 'null' && (
            <Image
              src={image}
              alt={firstName}
              layout="fill"
              className="object-cover rounded-lg"
            />
          )}
          {image && image == 'null' && (
            <Image
              src={'/default.jpg'}
              alt={firstName}
              layout="fill"
              className="object-cover rounded-lg"
            />
          )}



          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            {/* Link in the middle of the overlay */}
            <a
              href={`/players/${slug}`}
              className="bg-white text-black py-2 px-4 rounded-full text-lg font-semibold"
            >
              View Details
            </a>
          </div>

          {jersey && (
            <div className="absolute top-4 right-4 bg-maroon-500 text-white text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center jersyBlock">
              #{jersey}
            </div>
          )}
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
          <p className="text-gray-500 mt-2 teampagefont"><b>Sport(s):</b> Soccer</p>
          <p className="text-gray-500 mt-2 teampagefont"><b>Position(s):</b> {positions}</p>
          <p className="text-gray-500 mt-2 teampagefont"><b>Graduation Year:</b> {graduation}</p>
          <p className="text-gray-500 mt-2 teampagefont"><b>Level: </b>{grade_level}</p>
        {/* { birth_year && (
          <p className="text-gray-500 teampagefont">
            <b>Birth Year: </b>{birth_year}
          </p>
        )}
        { birth_year && (
          <p className="text-gray-500 teampagefont">
            <b>Age Group: </b>{age_group}
          </p>
          )} */}

          {/* <p className="text-gray-500 teampagefont">
     <b>Weight: </b>  {weight} Lbs.
    </p> */}

          
        </div>
        <div className="flex space-x-4 justify-center mt-3 mb-3 h-5">
          {facebook && (
            <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
              <FaFacebook size={20} />
            </a>
          )}
          {instagram && (
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-500">
              <FaInstagram size={20} />
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700">
              <FaLinkedin size={20} />
            </a>
          )}
          {xlink && (
            <a href={xlink} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black">
              <FaXTwitter size={20} />
            </a>
          )}
          {youtube && (
            <a href={youtube} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-600">
              <FaYoutube size={20} />
            </a>
          )}
        </div>
      </div>




    </>
  );
};

export default ProfileCard;
