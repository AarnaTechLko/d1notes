"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/coach/Sidebar';
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [coachId, setCoachId] = useState<number | undefined>(undefined);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    location: "",
    sport: "",
    clubName: "",
    qualifications: "",
    expectedCharge: "",
    image: "",
    certificate: "",
    password: "",
  });

  const { data: session, status } = useSession();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const session = await getSession();
        const coachId = session?.user.id;
        const response = await fetch('/api/coach/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coachId }), // Send coachId in the request body
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
      const coachId = session?.user.id;
      const response = await fetch('/api/coach/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coachId, 
          profileData: {
            ...profileData,
            image: profileData.image || "", // Send base64 image
            certificate: profileData.certificate || ""
          }
        }), // Include coachId and profileData
      });
  
      if (response.ok) {
        // Fetch the updated data again
        const updatedResponse = await fetch('/api/coach/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ coachId }),
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
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Last Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.lastName}</p>
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

              {/* Phone Number */}
              <div>
                <label className="block text-lg font-medium text-gray-700">Phone Number</label>
                {isEditMode ? (
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.phoneNumber}</p>
                )}
              </div>

              {/* Gender */}
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
                <label className="block text-lg font-medium text-gray-700">Club/Company Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="clubName"
                    value={profileData.clubName}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800">{profileData.clubName}</p>
                )}
              </div>

              {/* Qualifications */}
              <div >
                <label className="block text-lg font-medium text-gray-700">Qualifications</label>
                {isEditMode ? (
                  <textarea
                    name="qualifications"
                    rows={4}
                    value={profileData.qualifications}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800 whitespace-pre-wrap">
                    {profileData.qualifications}
                  </p>
                )}
              </div>

              <div >
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
                  <p className="mt-2 text-sm font-medium text-gray-800 whitespace-pre-wrap">
                    ******************
                  </p>
                )}
              </div>
            </div>

            {/* Certificate Image Thumbnail */}
            <div className="mt-8">
              <div className="flex flex-col items-center">
                <label className="block text-sm font-medium text-gray-700">Certificate Image</label>
                <div onClick={triggerCertificateUpload} className="mt-4 cursor-pointer">
                  {profileData.certificate ? (
                    <img
                      src={profileData.certificate}
                      alt="Certificate"
                      className="h-32 w-32 object-cover rounded-lg border-4 border-indigo-300 hover:shadow-lg transition-all"
                    />
                  ) : (
                    <div className="h-32 w-32 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-400">
                      <span className="text-gray-500">Upload Image</span>
                    </div>
                  )}
                </div>
                {isEditMode && (
                  <input
                    type="file"
                    name="certificate"
                    accept="image/*"
                    ref={certificateInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
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
