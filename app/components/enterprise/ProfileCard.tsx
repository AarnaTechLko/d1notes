import React, {useState, useEffect} from 'react';
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
  countryName: string;
  state: string;
  city: string;
    is_deleted: number; // 👈 Add this line

}

const ProfileCard: React.FC<ProfileCardProps> = ({ organization, logo, slug, country, countryName, id, state, city,is_deleted }) => {
  


  // useEffect(() => {
  //   fetch('/api/masters/countries')
  //     .then((response) => response.json())
  //     .then((data) => setCountriesList(data || []))
  //     .catch((error) => console.error('Error fetching countries:', error));
  // }, []);


  const handleRedirect =async (slug: string, id:string) => {
    const session = await getSession();

    // console.log("club id: ", session?.user.club_id)

    // console.log("session: ", session)

    if(session)
    {
      // if(session?.user?.type=='coach' || session?.user?.type=='player')
      // {
       //// window.location.href = `/enterprise/${slug}`;
      
      if(session.user.club_id==id)
      {
        window.location.href = `/enterprise/${slug}`;
      }
      else{
        Swal.fire({
          title: 'Unauthorized!',
          text: 'Only logged in members of this Team may access.',
          icon: 'error', // 'success' displays a green checkmark icon
          confirmButtonText: 'OK',
        });
        
      }
    // }
    // else{
    //   window.location.href = `/enterprise/${slug}`;
    // }
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
  if (is_deleted !== 1) return null;

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
        {/* <p>EST {}</p> */}
        <p>{countryName}</p>
        <p>{state}</p>
        <p>{city}</p>
        <p>Sport: Soccer</p>
        </div>
    
  </div>
 
  </>
    
  );
};

export default ProfileCard;
