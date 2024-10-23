"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/coach/Sidebar';
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import { Select } from '@mui/material';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const positionOptions = [
    { value: "Goalkeeper", label: "Goalkeeper" },
    { value: "Defender", label: "Defender" },
    { value: "Midfielder", label: "Midfielder" },
    { value: "Forward", label: "Forward" },
    { value: "Striker", label: "Striker" },
    { value: "Wingback", label: "Wingback" },
    { value: "Center Back", label: "Center Back" },
    // Add more positions as needed
  ];
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    grade_level: "",
    location: "",
    birthday: "",
    gender: "",
    sport: "",
    team: "",
    position: "",
    number: "",
    email: "",
    image: "",
    bio: "",
    country: "",
    state: "",
    city: "",
    jersey: "",
    password: "",
  });
  const states = [
    { name: "Alabama", abbreviation: "AL" },
    { name: "Alaska", abbreviation: "AK" },
    { name: "Arizona", abbreviation: "AZ" },
    { name: "Arkansas", abbreviation: "AR" },
    { name: "California", abbreviation: "CA" },
    { name: "Colorado", abbreviation: "CO" },
    { name: "Connecticut", abbreviation: "CT" },
    { name: "Delaware", abbreviation: "DE" },
    { name: "Florida", abbreviation: "FL" },
    { name: "Georgia", abbreviation: "GA" },
    { name: "Hawaii", abbreviation: "HI" },
    { name: "Idaho", abbreviation: "ID" },
    { name: "Illinois", abbreviation: "IL" },
    { name: "Indiana", abbreviation: "IN" },
    { name: "Iowa", abbreviation: "IA" },
    { name: "Kansas", abbreviation: "KS" },
    { name: "Kentucky", abbreviation: "KY" },
    { name: "Louisiana", abbreviation: "LA" },
    { name: "Maine", abbreviation: "ME" },
    { name: "Maryland", abbreviation: "MD" },
    { name: "Massachusetts", abbreviation: "MA" },
    { name: "Michigan", abbreviation: "MI" },
    { name: "Minnesota", abbreviation: "MN" },
    { name: "Mississippi", abbreviation: "MS" },
    { name: "Missouri", abbreviation: "MO" },
    { name: "Montana", abbreviation: "MT" },
    { name: "Nebraska", abbreviation: "NE" },
    { name: "Nevada", abbreviation: "NV" },
    { name: "New Hampshire", abbreviation: "NH" },
    { name: "New Jersey", abbreviation: "NJ" },
    { name: "New Mexico", abbreviation: "NM" },
    { name: "New York", abbreviation: "NY" },
    { name: "North Carolina", abbreviation: "NC" },
    { name: "North Dakota", abbreviation: "ND" },
    { name: "Ohio", abbreviation: "OH" },
    { name: "Oklahoma", abbreviation: "OK" },
    { name: "Oregon", abbreviation: "OR" },
    { name: "Pennsylvania", abbreviation: "PA" },
    { name: "Rhode Island", abbreviation: "RI" },
    { name: "South Carolina", abbreviation: "SC" },
    { name: "South Dakota", abbreviation: "SD" },
    { name: "Tennessee", abbreviation: "TN" },
    { name: "Texas", abbreviation: "TX" },
    { name: "Utah", abbreviation: "UT" },
    { name: "Vermont", abbreviation: "VT" },
    { name: "Virginia", abbreviation: "VA" },
    { name: "Washington", abbreviation: "WA" },
    { name: "West Virginia", abbreviation: "WV" },
    { name: "Wisconsin", abbreviation: "WI" },
    { name: "Wyoming", abbreviation: "WY" }
  ];
  const { data: session, status } = useSession();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const session = await getSession();
        const playerId = session?.user.id;
        const response = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId }), // Send playerId in the request body
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
        } else {
          console.error("Error fetching profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData((prevData) => ({
          ...prevData,
          [name]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const session = await getSession();
      const playerId = session?.user.id;
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId, 
          profileData: {
            ...profileData,
            image: profileData.image || ""
          }
        }), // Include playerId and profileData
      });
  
      if (response.ok) {
        // Fetch the updated data again
        const updatedResponse = await fetch('/api/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId }),
        });
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setProfileData(updatedData); // Update state with the new profile data
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
  

  const triggerImageUpload = () => {
    imageInputRef.current?.click();
  };

  const triggerCertificateUpload = () => {
    certificateInputRef.current?.click();
  };
  const handlePositionChange = (selectedOptions: any) => {
    // Convert selected options into a comma-separated string
    const positions = selectedOptions ? selectedOptions.map((option: any) => option.value).join(", ") : "";
    setProfileData({ ...profileData, position: positions });
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
                className={`px-5 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-md ${
                  isEditMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditMode ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <label className="block text-lg font-medium text-gray-700">Profile Image</label>
              <div
                onClick={triggerImageUpload}
                className="mt-4 cursor-pointer rounded-full border-4 border-indigo-300 p-2 hover:shadow-lg transition-all"
              >
                {profileData.image ? (
                  <img
                    src={profileData.image}
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-full"
                  />
                ) : (
                  <div className="h-32 w-32 bg-gray-200 flex items-center justify-center rounded-full">
                    <span className="text-gray-500">Upload Image</span>
                  </div>
                )}
              </div>
              {isEditMode && (
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              )}
            </div>

            {/* Profile Information Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700">First Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Last Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Location</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.location}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Email</label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.email}</p>
                )}
              </div>


              <div>
                <label className="block text-lg font-medium text-gray-700">Phone Number</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="number"
                    value={profileData.number}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.number}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Birthday</label>
                {isEditMode ? (
                  <input
                    type="date"
                    name="birthday"
                    value={profileData.birthday}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.birthday}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Grade Level</label>
                {isEditMode ? (
                  <select
                  name="grade_level"
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  value={profileData.grade_level}
                  onChange={handleChange}
                >
                  <option value="">Select  Level</option>
                  <option value="Club">Club</option>
                  <option value="League">League</option>
                  <option value="Academy">Academy</option>
                  <option value="Organization">Organization</option>
                </select>
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.grade_level}</p>
                )}
              </div>

             
              <div>
                <label className="block text-lg font-medium text-gray-700">Gender</label>
                {isEditMode ? (
                  <select
                    name="gender"
                    value={profileData.gender}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.gender}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Jersey No (Optional)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="jersey"
                    value={profileData.jersey}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.jersey}</p>
                )}
              </div>

              {/* Sport */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Sport</label>
                {isEditMode ? (
                  <select
                    name="sport"
                    value={profileData.sport}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  >
                    <option value="">Select Sport</option>
                    <option value="Soccer">Soccer</option>
                    {/* Add other sports as options */}
                  </select>
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.sport}</p>
                )}
              </div>

              {/* Club Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Team Name/ Year</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="team"
                    value={profileData.team}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.team}</p>
                )}
              </div>


             

              {/* Qualifications */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-lg font-medium text-gray-700">Tell us about your player’s experience/ competition level, any accolades and goals.</label>
                {isEditMode ? (
                  <textarea
                    name="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800 whitespace-pre-wrap">
                    {profileData.bio}
                  </p>
                )}
              </div>
              <div className="grid grid-cols- sm:grid-cols- lg:grid-cols-4 gap-6 pb-5">
              <div>
                <label className="block text-lg font-medium text-gray-700">Country</label>
                {isEditMode ? (
                 <select
                 name="country"
                 className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                 value={profileData.country}
                 onChange={handleChange}
               >
                 <option value="">Select</option>
                 <option value="Freshman">United States of America</option>
                
               </select>
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.country}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">State</label>
                {isEditMode ? (
                  <select
                  name="state"
                  id="state"
                  value={profileData.state}
                  onChange={handleChange}
                  className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                >
                  <option value="">Select a state</option>
                  {states.map((state) => (
                    <option key={state.abbreviation} value={state.abbreviation}>
                      {state.name}
                    </option>
                  ))}
                </select>
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.state}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">City</label>
                {isEditMode ? (
                   <input
                   type="text"
                   name="city"
                   value={profileData.city}
                   onChange={handleChange}
                   className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                 />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.city}</p>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700">Password</label>
                {isEditMode ? (
                   <input
                   type="password"
                   name="password"
                   value={profileData.password}
                   onChange={handleChange}
                   className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                 />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">************</p>
                )}
              </div>
              </div>
            </div>

            {/* Certificate Image Thumbnail */}
             
          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
