"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/teams/Sidebar'
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import Select from "react-select";
import { countryCodesList, countries, states,positionOptionsList } from '@/lib/constants';
import { upload } from '@vercel/blob/client';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const [countriesArray, setCountriesArray] = useState([]);
  const [photoUpoading, setPhotoUpoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileData, setProfileData] = useState({
    id: "",
    team_name: "",
    manager_name: "",
    manager_email: "",
    manager_phone: "",
    countryCodes: "",
    logo: "",
    description: "",
    country: "",
    state: "",
    city: "",
    address: "",
   
    
  });


  const { data: session, status } = useSession();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const session = await getSession();
        const clubid = session?.user.id;
        const response = await fetch('/api/teampanel/profilebyid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clubid }), // Send playerId in the request body
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data[0]);
        
        } else {
          console.error("Error fetching profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);
  const mapCountriesToOptions = (playingCountries: any) => {
    return playingCountries
      .split(',')
      .map((country: string) => ({ label: country.trim(), value: country.trim() }));
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = async () => {
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      setPhotoUpoading(true);
  
      try {
        const newBlob = await upload(file.name, file, {
            access: 'public',
            handleUploadUrl: '/api/uploads',
          });
        setPhotoUpoading(false);
        const imageUrl = newBlob.url;
        setProfileData((prevData) => ({ ...prevData, logo: imageUrl }));
      } catch (error) {
        setPhotoUpoading(false);
        console.error('Error uploading file:', error);
      }
    } else {
      console.error('No file selected');
    }
  };
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;

    const phoneNumber = value.replace(/[^\d]/g, ""); // Remove all non-numeric characters

    const phoneNumberLength = phoneNumber.length;

    if (phoneNumberLength < 4) return phoneNumber;

    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }

    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };
  const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(event.target.value);
    setProfileData({ ...profileData, manager_phone: formattedNumber });
  };
  const handleSubmit = async () => {
    try {
      console.log(profileData);
      const session = await getSession();
      const clubid = session?.user.id;
      const response = await fetch('/api/enterprise/profilebyid', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...profileData,
            logo: profileData.logo || ""
          }), // Include playerId and profileData
      });

      if (response.ok) {
        // Fetch the updated data again
        const updatedResponse = await fetch('/api/enterprise/profilebyid', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ clubid }),
        });
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setProfileData(updatedData[0]); // Update state with the new profile data
        } else {
          console.error("Failed to fetch updated profile data:", updatedResponse.statusText);
        }

        setIsEditMode(false); // Exit edit mode after saving
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
 
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", // Use "numeric" for numeric month
      day: "numeric",
    });
  };

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const triggerCertificateUpload = () => {
    certificateInputRef.current?.click();
  };
   
  return (
    <>
      <div className="flex  bg-gradient-to-r from-blue-50 to-indigo-100">
        <Sidebar />
        <main className="flex-grow p-8">
          <div className="bg-white shadow-lg rounded-lg p-8 mx-auto max-w-6xl">
            {/* Profile Header */}
            <div className="flex justify-between items-center mb-6">

              <button
                onClick={() => {
                  if (isEditMode) {
                    handleSubmit(); // Call the submit function when in edit mode
                  }
                  setIsEditMode(!isEditMode);
                }}
                className={`px-5 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-md ${isEditMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isEditMode ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Team Logo</label>
              <div
                onClick={handleImageClick}
                className="mt-4 cursor-pointer rounded-full border-4 border-indigo-300 p-2 hover:shadow-lg transition-all"
              >
                {profileData.logo ? (
                  <img
                    src={profileData.logo}
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-full"
                  />
                ) : (
                  <div className="h-32 w-32 bg-gray-200 flex items-center justify-center rounded-full">
                    <span className="text-gray-500">Upload Logo</span>
                  </div>
                )}
              </div>
              {isEditMode && (
                <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
              )}
            </div>

            {/* Profile Information Form */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-5 mb-2">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Team Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="organizationName"
                    value={profileData.team_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border mb-2 border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.team_name}</p>
                )}
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Administrator Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="owner_name"
                    value={profileData.manager_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.manager_name}</p>
                )}
              </div>
            

       

              {/* Email */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Administrator Email</label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.manager_email}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.manager_email}</p>
                )}
              </div>


              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Administrator Mobile Number</label>
                {isEditMode ? (
                  <div className="flex">
                    <select
                      name="countryCodes"
                      className="mt-2 block  border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 w-1/3 mr-1" // Added mr-4 for margin-right
                      value={profileData.countryCodes}
                      onChange={handleChange}
                    >
                      {countryCodesList.map((item) => (
                        <option key={item.id} value={item.code}>
                          {item.code} ({item.country})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="number"
                      value={profileData.manager_phone}
                      onChange={handlePhoneNumberChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.countryCodes} {profileData.manager_phone}</p>
                )}
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Address</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.address}</p>
                )}
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Country</label>
                {isEditMode ? (
                   <input
                   type="text"
                   name="country"
                   value={profileData.country}
                   onChange={handleChange}
                   className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                 />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.country}</p>
                )}
              </div>


              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">State</label>
                {isEditMode ? (
                <input
                type="text"
                name="state"
                value={profileData.state}
                onChange={handleChange}
                className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
              />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.state}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">City</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="city"
                    value={profileData.city}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.city}</p>
                )}
              </div>
</div>



          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
