"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/teams/Sidebar'
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import Select from "react-select";
import { countryCodesList, countries, states, positionOptionsList } from '@/lib/constants';
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
    countryName: "",
    stateName: "",
    state: "",
    city: "",
    address: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    xlink: "",
    youtube: "",
    website: ""
  });


  const { data: session, status } = useSession();

  

  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);

  const fetchStates = async (country: number) => {
    try {
      const response = await fetch(`/api/masters/states?country=${country}`);
      const data = await response.json();
      setStatesList(data); // Adjust key if necessary based on your API response structure
    } catch (error) {
      console.error('Failed to fetch states:', error);
    }
  };

  
  


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
  useEffect(() => {
    fetch('/api/masters/countries')
      .then((response) => response.json())
      .then((data) => setCountriesList(data || []))
      .catch((error) => console.error('Error fetching countries:', error));
      fetchStates(231);
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


              <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2"> Sport<span className='mandatory'>*</span></label>
                    {isEditMode ? (
                    
                    <select
                    name="sport"
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                    value="Soccer"
                    onChange={handleChange}
                  >

                    <option value="Soccer">Soccer</option>

                  </select>

                    ) : (
                      <p className="mt-2 text-[12px] font-medium text-gray-800">Soccer</p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-5">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Team Name<span className="mandatory">*</span></label>
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




              {/* Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Administrator Email<span className="mandatory">*</span></label>
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
                <label className="block text-gray-700 text-sm font-semibold mb-2">Administrator Mobile Number<span className="mandatory">*</span></label>
                {isEditMode ? (
                  <div className="flex">
                    <select
                      name="countryCodes"
                      className="block  border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 w-1/3 mr-1" // Added mr-4 for margin-right
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
                      className="block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.countryCodes} {profileData.manager_phone}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">

              <div>
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Administrator Name<span className="mandatory">*</span></label>
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

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2"> Team Street Address</label>
                {isEditMode ? (
                
                  <input
                    placeholder='Ex. 12 Fireside Road Suite 200'
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md py-2 px-4 w-full focus:ring-indigo-500"
                  />

                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.address}</p>
                )}
              </div>  
          
              
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Team Country<span className="mandatory">*</span></label>
                {isEditMode ? (
                  // <input
                  //   type="text"
                  //   name="country"
                  //   value={profileData.country}
                  //   onChange={handleChange}
                  //   className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  // />
                  <select
                  name="country"
                  className="border border-gray-300 rounded-md py-2 px-4 w-full"
                  value={profileData.country}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {countriesList
                    .map((country: any) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}


                </select>

                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.countryName}</p>
                )}
              </div>


              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Team State/Provience<span className="mandatory">*</span></label>
                {isEditMode ? (
                  // <input
                  //   type="text"
                  //   name="state"
                  //   value={profileData.state}
                  //   onChange={handleChange}
                  //   className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  // />
                  <select
                    name="state"
                    id="state"
                    value={profileData.state}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md py-2 px-4 w-full"
                  >
                    <option value="">Select</option>
                    {statesList.map((state: any, index) => (
                      <option key={index} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.stateName}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2"> Team City<span className="mandatory">*</span></label>
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
                {/* description */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-5">
              <div>
              <label  htmlFor="city" className="block text-gray-700 text-sm font-semibold mb-2">Team Description<span className='mandatory'>*</span></label>
              {isEditMode ? (
                 <textarea name="description"   maxLength={1500} className='w-full border border-gray-300 rounded-md py-2 px-4  focus:outline-none focus:ring-2 focus:ring-blue-500'
                 placeholder='Ex. LA Storm FC is a boys and girls soccer club based in Los Angeles.'
                 value={profileData.description}
                 onChange={handleChange}
                 ></textarea>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.description}</p>
                )}
              </div>

              </div>

              {/* Facebook */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
              <div>
                <label htmlFor="facebook" className="block text-gray-700 text-sm font-semibold mb-2">Facebook Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="facebook"
                    value={profileData.facebook}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.facebook}</p>
                )}
              </div>
              {/* Instagram */}
              <div>
                <label htmlFor="instagram" className="block text-gray-700 text-sm font-semibold mb-2">Instagram Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="instagram"
                    value={profileData.instagram}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.instagram}</p>
                )}
              </div>
              {/* Linkedin */}
              <div>
                <label htmlFor="linkedin" className="block text-gray-700 text-sm font-semibold mb-2">Linkedin Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.linkedin}</p>
                )}
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {/* xlink */}
              <div>
                <label htmlFor="xlink" className="block text-gray-700 text-sm font-semibold mb-2">XLink <span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="xlink"
                    value={profileData.xlink}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.xlink}</p>
                )}
              </div>
              {/* youtube */}
              <div>
                <label htmlFor="youtube" className="block text-gray-700 text-sm font-semibold mb-2">YouTube Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="youtube"
                    value={profileData.youtube}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.youtube}</p>
                )}
              </div>
              <div>
                <label htmlFor="website" className="block text-gray-700 text-sm font-semibold mb-2">Website Link<span className="text-xs text-gray-500"> (Optional)</span></label>

                {isEditMode ? (
                  <input
                    type="text"
                    name="website"
                    value={profileData.website}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.website}</p>
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
