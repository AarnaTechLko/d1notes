"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useSession } from 'next-auth/react';
import { getSession } from "next-auth/react";
import Select from "react-select";
import { countryCodesList, countries, states,positionOptionsList, Grades } from '@/lib/constants';
import FileUploader from '../components/FileUploader';
import { upload } from '@vercel/blob/client';
import { profile } from 'console';

const Profile: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [playerId, setPlayerId] = useState<number | undefined>(undefined);
  const [countriesArray, setCountriesArray] = useState([]);
  const [nationality, setNationality] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [position, setPosition] = useState<{ label: string; value: string }>({ label: '', value: '' });
  const [photoUpoading, setPhotoUpoading] = useState<boolean>(false);
let nationalities;
let ppositons;
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
    countrycode: "",
    height: "",
    weight: "",
    playingcountries: "",
    league: "",
    graduation: "",
  });


  const { data: session, status } = useSession();

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
         
          if (data.playingcountries.includes(',')) {
            nationalities = data.playingcountries
              .split(',')
              .map((country: string) => 
                countries.find(option => option.value.trim() === country.trim())
              )
              .filter(Boolean);
          } else {
             
            nationalities =[data.playingcountries.trim()];
          }
          
          setNationality({label:nationalities,value:nationalities});


          if (data.position.includes(',')) {
            ppositons = data.position
              .split(',')
              .map((country: string) => 
                positionOptionsList.find(option => option.value.trim() === country.trim())
              )
              .filter(Boolean);
          } else {
             
            ppositons =[data.position.trim()];
          }
          console.log(ppositons);
          setPosition(ppositons);
           

        } else {
          console.error("Error fetching profile data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
   
    fetchProfileData();
  }, []);


  const formatHeight = (value: string) => {
    // Remove non-numeric characters except for the decimal point and the apostrophe (for feet)
    const numericValue = value.replace(/[^0-9.'"]/g, "");
  
    if (numericValue.length === 0) return ""; // Return empty if no input
  
    // Split the input by the apostrophe (')
    const parts = numericValue.split("'");
  
    let feet = parts[0]; // The whole number part for feet
  
    // If there's something after the apostrophe, handle inches
    let inches = parts[1] || "";
    
    // If there's a decimal point in inches, keep it intact
    if (inches.includes('"')) {
      inches = inches.replace('"', "");
    }
  
    if (inches) {
      return `${feet}' ${inches}"`; // Format as feet and decimal inches
    } else {
      return `${feet}'`; // Format as feet only
    }
  };

  const handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const formattedValue = formatHeight(value);
    setProfileData((prevValues) => ({ ...prevValues, height: formattedValue }));
  };
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

  const handleImageChange = async () => {
    if (!fileInputRef.current?.files) {
      throw new Error('No file selected');
    }
    setPhotoUpoading(true);
    const file = fileInputRef.current.files[0];

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/uploads',
      });
      setPhotoUpoading(false);
      const imageUrl = newBlob.url;
      setProfileData({ ...profileData, image: imageUrl });

    } catch (error) {
      setPhotoUpoading(false);
      console.error('Error uploading file:', error);
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
    setProfileData({ ...profileData, number: formattedNumber });
  };
  const handleSubmit = async () => {
    try {
      console.log(profileData);
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

        setIsEditMode(false);
        window.location.reload(); // Exit edit mode after saving
      } else {
        console.error("Failed to update profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  const handleCountryChange = (selectedOptions: any) => {
    const playingcountries = selectedOptions ? selectedOptions.map((option: any) => option.label).join(", ") : "";
    setProfileData({ ...profileData, playingcountries: playingcountries });
     
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
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
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
                className={`px-5 py-2 rounded-lg transition-all duration-200 ease-in-out shadow-md ${isEditMode ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
              >
                {isEditMode ? 'Save Profile' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <label className="block text-gray-700 text-sm font-semibold mb-2">Profile Image</label>
              <div
                onClick={triggerImageUpload}
                className="mt-4 cursor-pointer rounded-full border-4 border-indigo-300 p-2 hover:shadow-lg transition-all"
              >
                {profileData.image!='null' && profileData.image!=null ? (
                  <img
                    src={profileData.image}
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-full"
                  />
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center rounded-full">
                    <img
                    src='/default.jpg'
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-full"
                  />
                    
                  </div>
                )}
              </div>
              {isEditMode && (
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              )}
            </div>
            {photoUpoading ? (
                      <>
                        <FileUploader />
                      </>
                    ) : (
                      <>
                        {/* Optional: Placeholder for additional content */}
                      </>
                    )}
            {/* Profile Information Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">First Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Last Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.last_name}</p>
                )}
              </div>
           

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Height</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="height"
                    value={profileData.height}
                    onChange={handleHeightChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.height}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Weight</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="weight"
                    value={profileData.weight}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.weight} Lbs</p>
                )}
              </div>
              <div>
                <label htmlFor="graduation" className="block text-gray-700 text-sm font-semibold mb-2">College Graduation</label>
                {isEditMode ? (
                  <select
                  name="graduation"
                  className="border border-gray-300 rounded-lg py-2 px-4 w-full"
                  value={profileData.graduation}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {Grades
                    .map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}

                </select>
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.graduation}</p>
                )}
              </div>
              <div>
                <label htmlFor="playingcountries" className="block text-gray-700 text-sm font-semibold mb-2">{nationalities}Nationality(s)</label>
                {isEditMode ? (<Select
                  isMulti
                  name='playingcountries'
                  options={countries}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  onChange={handleCountryChange}
                  placeholder="Select Country(s)"
                  value={nationality}

                />
                ) : (
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.playingcountries}</p>
                )}
              </div>


              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Country</label>
                {isEditMode ? (
                  <select
                    name="country"
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                    value={profileData.country}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="USA">USA</option>

                  </select>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.country}</p>
                )}
              </div>

              <div >
                <label className="block text-gray-700 text-sm font-semibold mb-2">State</label>
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
                      <option key={state.abbreviation} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.state}</p>
                )}
              </div>

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
                  <p className="block text-gray-700 text-sm font-semibold mb-2">{profileData.city}</p>
                )}
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Location</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.location}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Email</label>
                {isEditMode ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.email}</p>
                )}
              </div>


              <div>
                <label className="block text-gray-700 text-sm font-semibold ">Mobile Number</label>
                {isEditMode ? (
                  <div className="flex">
                    <select
                      name="countrycode"
                      className="mt-2 block  border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500 w-1/3 mr-1" // Added mr-4 for margin-right
                      value={profileData.countrycode}
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
                      value={profileData.number}
                      onChange={handlePhoneNumberChange}
                      className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.countrycode} {profileData.number}</p>
                )}
              </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-5">
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Birth Date</label>
                {isEditMode ? (
                  <input
                    type="date"
                    name="birthday"
                    value={ profileData.birthday ? new Date(profileData.birthday).toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{formatDate(profileData.birthday)}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Level</label>
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
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.grade_level}</p>
                )}
              </div>


              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Gender</label>
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
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.gender}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Jersey Number (Optional)</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="jersey"
                    value={profileData.jersey}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.jersey}</p>
                )}
              </div>

              {/* Sport */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Sport</label>
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
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.sport}</p>
                )}
              </div>

              {/* Club Name */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-2">Team Name/ Year</label>
                {isEditMode ? (
                  <input
                    type="text"
                    name="team"
                    value={profileData.team}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.team}</p>
                )}
              </div>
              <div>
                  <label htmlFor="position" className="block text-gray-700 text-sm font-semibold mb-2">Position(s)</label>
                  {isEditMode ? (
                  <Select
                    isMulti
                    options={positionOptionsList}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    onChange={handlePositionChange}
                    placeholder="Select Position(s)"
                    value={position}
                  />
                ) : (
                  <p className="mt-2 text-[12px] font-medium text-gray-800">{profileData.position}</p>
                )}
                </div>


              


</div>


<div className="col-span-1 mt-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">League</label>
                {isEditMode ? (
                  <input
                    name="league"
                    placeholder='Pre ECNL, ECNL and ECRL'
                    value={profileData.league}
                    onChange={handleChange}
                    className="mt-2 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:border-indigo-500"
                  />
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-800 whitespace-pre-wrap">
                    {profileData.league}
                  </p>
                )}
              </div>

              <div className="col-span-1 mt-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">Experience/Accolades</label>
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

             

            {/* Certificate Image Thumbnail */}

          </div>
        </main>
      </div>
    </>
  );
};

export default Profile;
